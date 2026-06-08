import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { musicService, normalizeSong } from '../services/musicService';
import { userLibraryService } from '../services/userLibraryService';
import { AuthContext } from './AuthContext';

export const MusicContext = createContext();

// ─── Empty user state (used on logout + initial guest state) ─────────────────
const emptyUserState = () => ({
    likedSongs:       [],
    recentlyPlayed:   [],
    listeningHistory: [],
    customPlaylists:  [],
});

export const MusicProvider = ({ children }) => {
    const { user, requireLogin } = useContext(AuthContext);

    // Player state — not user-specific
    const [currentPlaylist,     setCurrentPlaylist]     = useState([]);
    const [currentPlaylistName, setCurrentPlaylistName] = useState('');
    const [currentSongIndex,    setCurrentSongIndex]    = useState(0);
    const [isPlaying,           setIsPlaying]           = useState(false);
    const [progress,            setProgress]            = useState(0);
    const [currentTime,         setCurrentTime]         = useState(0);
    const [duration,            setDuration]            = useState(0);
    const [volume,              setVolume]              = useState(() => {
        const saved = localStorage.getItem('st-volume');
        return saved ? parseFloat(saved) : 0.7;
    });
    const [isMuted,      setIsMuted]      = useState(false);
    const [activeView,   setActiveView]   = useState('home');
    const [activeViewData, setActiveViewData] = useState(null);
    const [viewHistory,  setViewHistory]  = useState([]);
    const [isNowPlayingExpanded, setIsNowPlayingExpanded] = useState(false);
    const [shuffleMode,  setShuffleMode]  = useState(false);
    const [repeatMode,   setRepeatMode]   = useState('off');
    const [queue,        setQueue]        = useState([]);
    const [createPlaylistOpen,  setCreatePlaylistOpen]  = useState(false);
    const [playlistPickerSong,  setPlaylistPickerSong]  = useState(null);
    const [requestModalOpen,    setRequestModalOpen]    = useState(false);


    // ── User-specific state — always empty until hydrated from backend ────────
    const [likedSongs,       setLikedSongs]       = useState([]);
    const [recentlyPlayed,   setRecentlyPlayed]   = useState([]);
    const [listeningHistory, setListeningHistory] = useState([]);
    const [customPlaylists,  setCustomPlaylists]  = useState([]);

    const audioRef       = useRef(new Audio());
    const prevVolumeRef  = useRef(volume);

    // ── Persist volume only (not user data — that lives in MongoDB) ──────────
    useEffect(() => { localStorage.setItem('st-volume', volume.toString()); }, [volume]);

    // ─── Hydrate from backend ─────────────────────────────────────────────────
    const hydrateFromBackend = useCallback(async () => {
        try {
            console.log('[SurTaal] Starting library hydration...');
            console.log('[SurTaal] Current user:', user);
            console.log('[SurTaal] Token in localStorage:', localStorage.getItem('token'));
            
            const [remotePlaylists, remoteHistory, remoteLiked] = await Promise.all([
                userLibraryService.getPlaylists(),
                userLibraryService.getHistory(),
                userLibraryService.getLikedSongs(),
            ]);
            
            console.log('[SurTaal] Loaded playlists:', remotePlaylists);
            
            if (Array.isArray(remotePlaylists)) {
                const normalizedPlaylists = remotePlaylists.map(p => ({
                    ...p, 
                    id: p._id || p.id, 
                    songs: p.songs || []
                }));
                console.log('[SurTaal] Normalized playlists:', normalizedPlaylists);
                setCustomPlaylists(normalizedPlaylists);
            }
            if (remoteHistory?.recentlyPlayed)  setRecentlyPlayed(remoteHistory.recentlyPlayed);
            if (remoteHistory?.listeningHistory) setListeningHistory(remoteHistory.listeningHistory);
            if (Array.isArray(remoteLiked))      setLikedSongs(remoteLiked);
            console.log('[SurTaal] Library hydrated for user:', user?.username || 'unknown');
        } catch (error) {
            console.error('[SurTaal] Unable to sync library:', error);
        }
    }, [user]);

    // ─── Reset all user data (on logout or user switch) ──────────────────────
    const resetUserState = useCallback(() => {
        setLikedSongs([]);
        setRecentlyPlayed([]);
        setListeningHistory([]);
        setCustomPlaylists([]);
        setViewHistory([]);
        // Stop any playback
        audioRef.current.pause();
        audioRef.current.src = '';
        setIsPlaying(false);
        setCurrentPlaylist([]);
        setCurrentSongIndex(0);
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
        setQueue([]);
        console.log('[SurTaal] User state reset');
    }, []);

    // ─── React to login / logout via custom event ────────────────────────────
    // AuthContext fires 'surtaal-user-changed' on both login and logout.
    useEffect(() => {
        const handleUserChanged = (e) => {
            const { user: newUser, token: newToken } = e.detail || {};
            console.log('[SurTaal] User changed event - user:', newUser?.username, 'token:', !!newToken);
            if (!newUser || !newToken) {
                // Logged out
                console.log('[SurTaal] User logged out via event');
                resetUserState();
                setHasHydratedOnMount(false); // Reset flag so next login can hydrate
            } else {
                // Logged in - hydrate after a tick so token is set
                console.log('[SurTaal] User logged in via event, hydrating...');
                setHasHydratedOnMount(false); // Reset flag to allow hydration
                setTimeout(() => hydrateFromBackend(), 50);
            }
        };
        window.addEventListener('surtaal-user-changed', handleUserChanged);
        return () => window.removeEventListener('surtaal-user-changed', handleUserChanged);
    }, [resetUserState, hydrateFromBackend]);

    // ─── Initial hydration when app loads with an existing token ────────────
    // Watch for user to become available, then hydrate once
    const [hasHydratedOnMount, setHasHydratedOnMount] = useState(false);
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('[SurTaal] User state changed - user:', user?.username, 'token:', !!token, 'already hydrated:', hasHydratedOnMount);
        
        if (user && token && !hasHydratedOnMount) {
            console.log('[SurTaal] User now available, hydrating from backend...');
            hydrateFromBackend();
            setHasHydratedOnMount(true);
        } else if (!token && !hasHydratedOnMount) {
            console.log('[SurTaal] No token, resetting state');
            resetUserState();
            setHasHydratedOnMount(true);
        }
    }, [user, hydrateFromBackend, resetUserState, hasHydratedOnMount]);

    // ─── Audio event listeners ───────────────────────────────────────────────
    useEffect(() => {
        const audio = audioRef.current;
        const onTime = () => {
            setCurrentTime(audio.currentTime);
            if (!isNaN(audio.duration)) setProgress((audio.currentTime / audio.duration) * 100);
        };
        const onMeta  = () => setDuration(audio.duration);
        const onEnded = () => handleSongEndRef.current();
        audio.addEventListener('timeupdate',      onTime);
        audio.addEventListener('loadedmetadata',  onMeta);
        audio.addEventListener('ended',           onEnded);
        return () => {
            audio.removeEventListener('timeupdate',     onTime);
            audio.removeEventListener('loadedmetadata', onMeta);
            audio.removeEventListener('ended',          onEnded);
        };
    }, []);

    useEffect(() => { audioRef.current.volume = isMuted ? 0 : volume; }, [volume, isMuted]);

    const showToast = useCallback((message, type = 'success') => {
        window.dispatchEvent(new CustomEvent('surtaal-toast', { detail: { message, type } }));
    }, []);

    const songIdentity = useCallback((song) =>
        song?.spotifyId || song?.id || song?.src || song?.title, []);

    // ─── Record play — ONLY for authenticated users, sent to backend ─────────
    const recordSongPlay = useCallback((song) => {
        // Guard: only record when user is genuinely logged in
        if (!user || !localStorage.getItem('token')) return;

        const playedSong = { ...normalizeSong(song), playedAt: new Date().toISOString() };
        const key = songIdentity(playedSong);

        // Update local state immediately for responsive UI
        setRecentlyPlayed(prev => [playedSong, ...prev.filter(i => songIdentity(i) !== key)].slice(0, 30));
        setListeningHistory(prev => [playedSong, ...prev].slice(0, 300));

        // Persist to MongoDB — this increments favoriteArtists and favoriteGenres server-side
        userLibraryService.saveHistory(playedSong).catch(err =>
            console.warn('[SurTaal] History save failed:', err.message)
        );
    }, [user, songIdentity]);

    // ─── Internal play (no auth check) — used by PendingActionHandler ───────
    // MUST be defined before playSong which depends on it
    const playDirectly = useCallback((playlist, index = 0, playlistName = '') => {
        const normalizedPlaylist = playlist.map(s => normalizeSong(s));
        setCurrentPlaylist(normalizedPlaylist);
        setCurrentSongIndex(index);
        if (playlistName) setCurrentPlaylistName(playlistName);

        const song = normalizedPlaylist[index];
        if (!song) return;

        if (song.src) {
            audioRef.current.src = song.src;
            audioRef.current.play()
                .then(() => { setIsPlaying(true); recordSongPlay(song); })
                .catch(err => showToast('Playback error: ' + err.message, 'error'));
        } else {
            musicService.getPlayableSong(song).then(playable => {
                if (!playable.src) { showToast('Preview is not available for this track', 'error'); return; }
                const updated = [...normalizedPlaylist];
                updated[index] = playable;
                setCurrentPlaylist(updated);
                audioRef.current.src = playable.src;
                audioRef.current.play()
                    .then(() => { setIsPlaying(true); recordSongPlay(playable); })
                    .catch(err => showToast('Playback error: ' + err.message, 'error'));
            }).catch(() => showToast('Preview is not available for this track', 'error'));
        }
    }, [recordSongPlay, showToast]);

    // ─── Internal Spotify play (no auth check) — used by PendingActionHandler
    // MUST be defined before playSpotifySong which depends on it
    const playSpotifyDirectly = useCallback(async (song, playlistName = '', playlist = [], index = 0) => {
        try {
            const playableSong = await musicService.getPlayableSong(song);
            if (!playableSong.src) {
                showToast('Preview is not available for this track', 'error');
                return null;
            }
            const normalizedPlaylist = playlist.length ? playlist.map(i => normalizeSong(i)) : [playableSong];
            const targetIndex = playlist.length ? index : 0;
            normalizedPlaylist[targetIndex] = playableSong;
            playDirectly(normalizedPlaylist, targetIndex, playlistName || playableSong.title);
            return playableSong;
        } catch {
            showToast('Failed to load Spotify preview', 'error');
            return null;
        }
    }, [playDirectly, showToast]);

    // ─── Auth-gated playSong ─────────────────────────────────────────────────
    const playSong = useCallback((playlist, index = 0, playlistName = '') => {
        if (!user) {
            const song = playlist?.[index];
            requireLogin({
                song: song ? normalizeSong(song) : null,
                action: { type: 'playSong', payload: { playlist, index, playlistName } },
            });
            return;
        }
        playDirectly(playlist, index, playlistName);
    }, [user, requireLogin, playDirectly]);

    // ─── Auth-gated playSpotifySong ──────────────────────────────────────────
    const playSpotifySong = useCallback(async (song, playlistName = '', playlist = [], index = 0) => {
        if (!user) {
            requireLogin({
                song: normalizeSong(song),
                action: { type: 'playSpotifySong', payload: { song, playlistName, playlist, index } },
            });
            return null;
        }
        return playSpotifyDirectly(song, playlistName, playlist, index);
    }, [user, requireLogin, playSpotifyDirectly]);

    // ─── Standard playback controls ─────────────────────────────────────────
    const togglePlay = useCallback(() => {
        if (!audioRef.current.src) return;
        if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
        else { audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error); }
    }, [isPlaying]);

    const getNextIndex = useCallback((current, playlist) => {
        if (shuffleMode) {
            let next;
            do { next = Math.floor(Math.random() * playlist.length); }
            while (next === current && playlist.length > 1);
            return next;
        }
        return (current + 1) % playlist.length;
    }, [shuffleMode]);

    const startPlay = useCallback((song, onPlayable) => {
        if (song.src) {
            onPlayable(song);
        } else {
            musicService.getPlayableSong(song).then(playable => {
                if (playable.src) onPlayable(playable);
                else showToast('Preview is not available for this track', 'error');
            }).catch(() => showToast('Failed to load preview', 'error'));
        }
    }, [showToast]);

    const playNext = useCallback(() => {
        if (queue.length > 0) {
            const nextSong = normalizeSong(queue[0]);
            setQueue(prev => prev.slice(1));
            setCurrentPlaylist(prev => {
                const newList = [...prev, nextSong];
                const idx = newList.length - 1;
                setCurrentSongIndex(idx);
                startPlay(nextSong, (s) => {
                    audioRef.current.src = s.src;
                    audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
                    recordSongPlay(s);
                    if (s !== nextSong) {
                        setCurrentPlaylist(l => l.map((item, i) => i === idx ? s : item));
                    }
                });
                return newList;
            });
            return;
        }
        setCurrentSongIndex(prev => {
            const nextIdx = getNextIndex(prev, currentPlaylist);
            const song = currentPlaylist[nextIdx];
            if (song) {
                startPlay(song, (s) => {
                    if (s !== song) setCurrentPlaylist(l => l.map((item, i) => i === nextIdx ? s : item));
                    audioRef.current.src = s.src;
                    audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
                    recordSongPlay(s);
                });
            }
            return nextIdx;
        });
    }, [currentPlaylist, queue, getNextIndex, recordSongPlay, startPlay]);

    const playPrev = useCallback(() => {
        if (audioRef.current.currentTime > 3) { audioRef.current.currentTime = 0; return; }
        setCurrentSongIndex(prev => {
            const prevIdx = (prev - 1 + currentPlaylist.length) % currentPlaylist.length;
            const song = currentPlaylist[prevIdx];
            if (song) {
                startPlay(song, (s) => {
                    if (s !== song) setCurrentPlaylist(l => l.map((item, i) => i === prevIdx ? s : item));
                    audioRef.current.src = s.src;
                    audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
                });
            }
            return prevIdx;
        });
    }, [currentPlaylist, startPlay]);

    const handleSongEnd = useCallback(() => {
        if (repeatMode === 'one') {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(console.error);
        } else if (repeatMode === 'all' || currentSongIndex < currentPlaylist.length - 1 || queue.length > 0) {
            playNext();
        } else {
            setIsPlaying(false);
        }
    }, [repeatMode, currentSongIndex, currentPlaylist, queue, playNext]);

    const handleSongEndRef = useRef(handleSongEnd);
    useEffect(() => { handleSongEndRef.current = handleSongEnd; }, [handleSongEnd]);

    const seek = useCallback((time) => {
        if (audioRef.current) { audioRef.current.currentTime = time; setCurrentTime(time); }
    }, []);

    const toggleShuffle = useCallback(() => setShuffleMode(p => !p), []);
    const toggleRepeat  = useCallback(() => setRepeatMode(p =>
        p === 'off' ? 'all' : p === 'all' ? 'one' : 'off'), []);
    const toggleMute    = useCallback(() => {
        if (isMuted) { setIsMuted(false); setVolume(prevVolumeRef.current); }
        else { prevVolumeRef.current = volume; setIsMuted(true); }
    }, [isMuted, volume]);

    // ─── Liked songs ─────────────────────────────────────────────────────────
    const toggleLike = useCallback((song) => {
        // If not logged in, store pending action and open login modal
        if (!user) {
            requireLogin({
                song: normalizeSong(song),
                message: 'Login to like songs and build your collection.',
                action: { type: 'toggleLike', payload: { song } },
            });
            return;
        }
        const s = normalizeSong(song);
        setLikedSongs(prev => {
            const liked = prev.some(x => songIdentity(x) === songIdentity(s));
            return liked ? prev.filter(x => songIdentity(x) !== songIdentity(s)) : [...prev, s];
        });
        userLibraryService.toggleLike(s).catch(() => showToast('Failed to Save Like', 'error'));
    }, [user, requireLogin, showToast, songIdentity]);

    const isLiked = useCallback((song) => {
        if (!song) return false;
        return likedSongs.some(s => songIdentity(s) === songIdentity(song));
    }, [likedSongs, songIdentity]);

    // ─── Queue ────────────────────────────────────────────────────────────────
    const addToQueue = useCallback((song, next = false) => {
        setQueue(prev => next ? [song, ...prev] : [...prev, song]);
        showToast(next ? '✓ Added to Play Next' : '✓ Added to Queue');
    }, [showToast]);
    const removeFromQueue = useCallback((index) =>
        setQueue(prev => prev.filter((_, i) => i !== index)), []);
    const clearQueue = useCallback(() => setQueue([]), []);

    // ─── Navigation ───────────────────────────────────────────────────────────
    const navigateTo = useCallback((view, data = null, isBack = false) => {
        const protectedViews = ['library', 'history', 'edit-profile', 'settings', 'appearance', 'account', 'privacy', 'notifications', 'profile'];
        if (!user && protectedViews.includes(view)) {
            requireLogin({ message: 'Please login to continue.' });
            return;
        }

        if (view === 'nowplaying') {
            setIsNowPlayingExpanded(true);
        } else {
            setIsNowPlayingExpanded(false);
            if (!isBack) {
                setViewHistory(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.view === activeView && JSON.stringify(last.data) === JSON.stringify(activeViewData)) {
                        return prev;
                    }
                    return [...prev, { view: activeView, data: activeViewData }];
                });
            }
            setActiveView(view);
            setActiveViewData(data);
        }
    }, [user, requireLogin, activeView, activeViewData]);

    const navigateBack = useCallback(() => {
        if (viewHistory.length > 0) {
            const previous = viewHistory[viewHistory.length - 1];
            setViewHistory(prev => prev.slice(0, -1));
            navigateTo(previous.view, previous.data, true);
        } else {
            navigateTo('home');
        }
    }, [viewHistory, navigateTo]);

    // ─── Playlists ────────────────────────────────────────────────────────────
    const createPlaylist = useCallback(({ name, description = '', cover = '', songs = [] }) => {
        console.log('[SurTaal] Creating playlist:', { name, description, cover, songsCount: songs.length });
        const trimmedName = name?.trim();
        if (!trimmedName) { showToast('⚠ Playlist name is required', 'error'); return null; }
        const localId = `pl-${Date.now()}`;
        const playlist = {
            id: localId, name: trimmedName,
            description: description.trim(),
            cover, songs,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setCustomPlaylists(prev => [playlist, ...prev]);
        console.log('[SurTaal] Saving playlist to backend...');
        userLibraryService.createPlaylist(playlist).then(remote => {
            console.log('[SurTaal] Playlist saved, backend response:', remote);
            if (!remote) return;
            setCustomPlaylists(prev => prev.map(item =>
                item.id === localId
                    ? { ...remote, id: remote._id || remote.id, songs: remote.songs || [] }
                    : item
            ));
        }).catch((err) => {
            console.error('[SurTaal] Failed to save playlist:', err);
            showToast('Failed to Save Changes', 'error');
        });
        showToast('✓ Playlist Created');
        return playlist;
    }, [showToast]);

    const updatePlaylist = useCallback((id, updates) => {
        console.log('[SurTaal] Updating playlist:', id, updates);
        setCustomPlaylists(prev => prev.map(p =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
        userLibraryService.updatePlaylist(id, updates)
            .then(() => console.log('[SurTaal] Playlist update saved successfully'))
            .catch((err) => {
                console.error('[SurTaal] Failed to update playlist:', err);
                showToast('Failed to Save Changes', 'error');
            });
    }, [showToast]);

    const deletePlaylist = useCallback((id) => {
        console.log('[SurTaal] Deleting playlist:', id);
        setCustomPlaylists(prev => prev.filter(p => p.id !== id));
        userLibraryService.deletePlaylist(id)
            .then(() => console.log('[SurTaal] Playlist deleted successfully'))
            .catch((err) => {
                console.error('[SurTaal] Failed to delete playlist:', err);
                showToast('Failed to Save Changes', 'error');
            });
        showToast('✓ Playlist Deleted');
        if (activeViewData?.id === id) navigateTo('home');
    }, [activeViewData?.id, navigateTo, showToast]);

    const addSongToPlaylist = useCallback((playlistId, song) => {
        if (!song) return;
        const s = normalizeSong(song);
        if (playlistId === 'liked') {
            setLikedSongs(prev =>
                prev.some(item => songIdentity(item) === songIdentity(s)) ? prev : [...prev, s]);
            showToast('✓ Added to Playlist');
            return;
        }
        const key = songIdentity(s);
        setCustomPlaylists(prev => prev.map(p => {
            if (p.id !== playlistId) return p;
            if (p.songs.some(item => songIdentity(item) === key)) return p;
            return { ...p, songs: [...p.songs, s], updatedAt: new Date().toISOString() };
        }));
        console.log('[SurTaal] Adding song to playlist:', playlistId, s.title);
        userLibraryService.addSongToPlaylist(playlistId, s)
            .then(() => console.log('[SurTaal] Song added successfully'))
            .catch((err) => {
                console.error('[SurTaal] Failed to add song:', err);
                showToast('Failed to Save Changes', 'error');
            });
        showToast('✓ Added to Playlist');
    }, [showToast, songIdentity]);

    const removeSongFromPlaylist = useCallback((playlistId, songSrc) => {
        console.log('[SurTaal] Removing song from playlist:', playlistId, songSrc);
        setCustomPlaylists(prev => prev.map(p =>
            p.id === playlistId
                ? { ...p, songs: p.songs.filter(s => songIdentity(s) !== songSrc && s.src !== songSrc), updatedAt: new Date().toISOString() }
                : p));
        userLibraryService.removeSongFromPlaylist(playlistId, songSrc)
            .then(() => console.log('[SurTaal] Song removed successfully'))
            .catch((err) => {
                console.error('[SurTaal] Failed to remove song:', err);
                showToast('Failed to Save Changes', 'error');
            });
        showToast('✓ Song Removed');
    }, [showToast, songIdentity]);

    const reorderPlaylistSong = useCallback((playlistId, fromIndex, direction) => {
        setCustomPlaylists(prev => prev.map(p => {
            if (p.id !== playlistId) return p;
            const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
            if (toIndex < 0 || toIndex >= p.songs.length) return p;
            const songs = [...p.songs];
            const [moved] = songs.splice(fromIndex, 1);
            songs.splice(toIndex, 0, moved);
            return { ...p, songs, updatedAt: new Date().toISOString() };
        }));
    }, []);

    // ─── Keyboard shortcuts ───────────────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            switch (e.code) {
                case 'Space':      e.preventDefault(); togglePlay(); break;
                case 'ArrowRight': e.shiftKey ? seek(Math.min(audioRef.current.currentTime + 10, duration)) : playNext(); break;
                case 'ArrowLeft':  e.shiftKey ? seek(Math.max(audioRef.current.currentTime - 10, 0)) : playPrev(); break;
                case 'KeyM':       toggleMute(); break;
                case 'KeyS':       toggleShuffle(); break;
                case 'KeyR':       toggleRepeat(); break;
                default: break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay, playNext, playPrev, toggleMute, toggleShuffle, toggleRepeat, seek, duration]);

    const currentSong = currentPlaylist[currentSongIndex] || null;

    return (
        <MusicContext.Provider value={{
            currentPlaylist, currentPlaylistName, currentSong, currentSongIndex,
            isPlaying, progress, currentTime, duration, volume, isMuted,
            activeView, activeViewData, shuffleMode, repeatMode,
            likedSongs, recentlyPlayed, listeningHistory, queue, customPlaylists,
            createPlaylistOpen, playlistPickerSong, requestModalOpen,
            isNowPlayingExpanded, setIsNowPlayingExpanded,
            // Public (auth-gated) playback
            playSong, playSpotifySong,
            // Internal (auth-bypass) playback — used by PendingActionHandler after login
            playDirectly, playSpotifyDirectly,
            togglePlay, playNext, playPrev, seek,
            setVolume, toggleMute, toggleShuffle, toggleRepeat,
            toggleLike, isLiked,
            addToQueue, removeFromQueue, clearQueue,
            createPlaylist, updatePlaylist, deletePlaylist,
            addSongToPlaylist, removeSongFromPlaylist, reorderPlaylistSong,
            setCreatePlaylistOpen, setPlaylistPickerSong, setRequestModalOpen,
            showToast, navigateTo, setCurrentPlaylistName, navigateBack, viewHistory,
        }}>
            {children}
        </MusicContext.Provider>
    );
};
