import React, { useContext, useEffect, useRef, useState } from 'react';
import { MusicContext } from '../context/MusicContext';
import { musicService } from '../services/musicService';
import { albums, playlists, newReleases, allSongs } from '../data';

const PlayIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);

const Equalizer = () => (
    <span className="search-eq" aria-label="Now playing">
        <span className="search-eq-bar" />
        <span className="search-eq-bar" />
        <span className="search-eq-bar" />
        <span className="search-eq-bar" />
    </span>
);

const SearchView = () => {
    const {
        activeViewData, playSong, playSpotifySong, navigateTo,
        toggleLike, isLiked,
        currentSong, isPlaying, recentlyPlayed,
    } = useContext(MusicContext);

    const [songResults,   setSongResults]   = useState([]);
    const [isLoading,     setIsLoading]     = useState(false);
    const [error,         setError]         = useState('');
    const [loadingId,     setLoadingId]     = useState(null);
    const lastQueryRef = useRef('');

    const query = activeViewData?.query || '';
    const [localQuery, setLocalQuery] = useState(query);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 767);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const curatedCategories = {
        'Workout Mix': {
            name: 'Workout Mix',
            cover: '/cards/workout.jpg',
            songs: albums['Haryanvi Workout']?.songs || [],
        },
        'Punjabi Hits': {
            name: 'Punjabi Hits',
            cover: '/cards/desi-hip-hop.png',
            songs: [
                ...(playlists['Punjabi Pump']?.songs || []),
                ...(playlists['P-POP CULTURE']?.songs || []).slice(0, 6),
            ],
        },
        'Bollywood Essentials': {
            name: 'Bollywood Essentials',
            cover: '/cards/pyaar.png',
            songs: albums['Bollywood & Chill']?.songs || [],
        },
        'Romance Collection': {
            name: 'Romance Collection',
            cover: '/cards/sukoon.png',
            songs: playlists['Ishq aur Tanhai']?.songs || [],
        },
        'Chill Vibes': {
            name: 'Chill Vibes',
            cover: '/cards/raat-ki-drive.png',
            songs: [
                ...(albums['Bollywood & Chill']?.songs || []),
                ...(playlists['Ishq aur Tanhai']?.songs || []),
            ],
        },
        'Made For You': {
            name: 'Made For You',
            cover: '/cards/weekend-vibes.png',
            songs: [
                ...(playlists['Punjabi Pump']?.songs || []).slice(0, 2),
                ...(albums['Bollywood & Chill']?.songs || []).slice(0, 2),
                ...(playlists['Ishq aur Tanhai']?.songs || []).slice(0, 2),
            ],
        },
    };

    const handleCategoryClick = (categoryName, fallbackQuery) => {
        if (isMobile) {
            const playlist = curatedCategories[categoryName];
            if (playlist) {
                navigateTo('playlist', {
                    name: playlist.name,
                    type: 'Playlist',
                    cover: playlist.cover || '/Covers/dhun.jpg',
                    songs: playlist.songs || [],
                });
                return;
            }
        }
        navigateTo('search', { query: fallbackQuery });
    };

    // Sync input when navigation query changes (e.g. from desktop navbar)
    useEffect(() => {
        setLocalQuery(query);
    }, [query]);

    // ── Fetch Search Results — LOCAL SONGS ONLY ───────────────────────────────
    useEffect(() => {
        const trimmed = query.trim();
        if (!trimmed || trimmed.length < 2) {
            setSongResults([]);
            setError('');
            setIsLoading(false);
            return;
        }
        if (trimmed === lastQueryRef.current) return;
        lastQueryRef.current = trimmed;
        let cancelled = false;
        setIsLoading(true);
        setError('');
        setSongResults([]);

        musicService.searchSongs(trimmed, { limit: 10 })
            .then(data => {
                if (cancelled) return;
                setSongResults(data);
            })
            .catch(err => { if (!cancelled) setError(`Search failed: ${err.message}`); })
            .finally(() => { if (!cancelled) setIsLoading(false); });

        return () => { cancelled = true; };
    }, [query]);

    // Clear spinner once playing status is verified
    useEffect(() => {
        if (isPlaying && currentSong && loadingId) {
            const key = currentSong.spotifyId || currentSong.id || currentSong.src || currentSong.title;
            if (key === loadingId) setLoadingId(null);
        }
    }, [isPlaying, currentSong, loadingId]);

    // Ensure search view always scrolls to top on query change
    useEffect(() => {
        const mainEl = document.querySelector('.main-content');
        if (mainEl) {
            mainEl.scrollTop = 0;
        }
    }, [query]);

    // Mobile Input Typing Handler with Debounce
    const mobileDebounceRef = useRef(null);
    const handleMobileInputChange = (e) => {
        const val = e.target.value;
        setLocalQuery(val);
        
        clearTimeout(mobileDebounceRef.current);
        if (val.trim().length >= 2) {
            mobileDebounceRef.current = setTimeout(() => {
                navigateTo('search', { query: val.trim() });
            }, 300);
        } else if (val.trim().length === 0) {
            navigateTo('search', { query: '' });
        }
    };

    const songKey    = (s) => s?.spotifyId || s?.id || s?.src || s?.title;
    const isSongActive   = (s) => !!currentSong && songKey(s) === songKey(currentSong);
    const isSongPlaying  = (s) => isSongActive(s) && isPlaying;
    const isSongLoading  = (s) => songKey(s) === loadingId;

    const handlePlaySong = (song, idx) => {
        setLoadingId(songKey(song));
        playSpotifySong(song, 'Search Results', songResults, idx);
    };

    return (
        <div className="search-view explore-page">
            {/* Mobile Search Input bar (hidden on desktop via css) */}
            <div className="mobile-search-bar-container">
                <div className="mobile-search-input-wrapper">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mobile-search-icon-svg" style={{ opacity: 0.6, marginRight: '8px', flexShrink: 0 }}>
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search songs, artists, playlists..."
                        value={localQuery}
                        onChange={handleMobileInputChange}
                    />
                    {localQuery && (
                        <button className="mobile-search-clear" onClick={() => { setLocalQuery(''); navigateTo('search', { query: '' }); }}>
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {query.trim().length >= 2 ? (
                /* Search Results View - Replicated for both Desktop and Mobile */
                <div className="search-results-local">
                    {isLoading && (
                        <div className="search-local-loading">
                            <span className="explore-collection-spinner" />
                        </div>
                    )}

                    {error && <p className="explore-status-text">{error}</p>}

                    {!isLoading && !error && songResults.length === 0 && (
                        <p className="explore-status-text">No songs found for "{query}"</p>
                    )}

                    {songResults.length > 0 && (
                        <div className="search-local-list">
                            {songResults.map((song, idx) => {
                                const active  = isSongPlaying(song);
                                const loading = isSongLoading(song);
                                const paused  = isSongActive(song) && !isPlaying;
                                return (
                                    <div
                                        key={songKey(song) || idx}
                                        className={`search-local-row ${active ? 'playing' : ''} ${loading ? 'loading' : ''} ${paused ? 'paused' : ''}`}
                                        onClick={() => handlePlaySong(song, idx)}
                                    >
                                        <div className="search-local-cover-wrap">
                                            <img src={song.cover} alt="" className="search-local-cover" />
                                            {loading ? (
                                                <span className="search-local-spinner" />
                                            ) : active ? (
                                                <span className="search-local-eq"><Equalizer /></span>
                                            ) : (
                                                <span className="search-local-play-overlay">
                                                    <PlayIcon />
                                                </span>
                                            )}
                                        </div>
                                        <div className="search-local-info">
                                            <span className="search-local-title">{song.title}</span>
                                            <span className="search-local-artist">{song.singer || song.artist}</span>
                                        </div>
                                        <button
                                            className={`search-local-like ${isLiked(song) ? 'liked' : ''}`}
                                            onClick={e => { e.stopPropagation(); toggleLike(song); }}
                                            aria-label={isLiked(song) ? 'Unlike' : 'Like'}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill={isLiked(song) ? 'var(--amber)' : 'none'} stroke="currentColor" strokeWidth="2">
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                            </svg>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                /* Search Landing - Premium Browse Experience */
                <div className="search-landing-premium">
                    {/* Recently Played Section */}
                    {recentlyPlayed && recentlyPlayed.length > 0 && (
                        <div className="search-landing-section">
                            <h2 className="search-landing-section-title">Recently Played</h2>
                            <div className="search-landing-albums-grid">
                                {recentlyPlayed.slice(0, 6).map((song, idx) => (
                                    <div 
                                        className="search-landing-album-card" 
                                        key={idx}
                                        onClick={() => playSpotifySong(song, 'Recently Played', recentlyPlayed, idx)}
                                    >
                                        <img src={song.cover} alt={song.title} />
                                        <button className="search-landing-play-btn">
                                            <PlayIcon />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Browse Categories Section */}
                    <div className="search-landing-section">
                        <h2 className="search-landing-section-title">Browse Categories</h2>
                        <div className="search-landing-browse-grid">
                            <div className="search-landing-browse-card" onClick={() => handleCategoryClick('Workout Mix', 'Workout gym Punjabi')}>
                                <img src="/cards/workout.jpg" alt="Workout Mix" onError={(e) => e.target.src = '/Covers/2 numbari.jpg'} />
                                <div className="search-landing-browse-overlay">
                                    <h3>Workout Mix</h3>
                                </div>
                            </div>
                            <div className="search-landing-browse-card" onClick={() => handleCategoryClick('Punjabi Hits', 'Punjabi hits latest')}>
                                <img src="/cards/desi-hip-hop.png" alt="Punjabi Hits" />
                                <div className="search-landing-browse-overlay">
                                    <h3>Punjabi Hits</h3>
                                </div>
                            </div>
                            <div className="search-landing-browse-card" onClick={() => handleCategoryClick('Bollywood Essentials', 'Bollywood romantic Hindi')}>
                                <img src="/cards/pyaar.png" alt="Bollywood Essentials" />
                                <div className="search-landing-browse-overlay">
                                    <h3>Bollywood Essentials</h3>
                                </div>
                            </div>
                            <div className="search-landing-browse-card" onClick={() => handleCategoryClick('Romance Collection', 'romantic love Hindi')}>
                                <img src="/cards/sukoon.png" alt="Romance Collection" />
                                <div className="search-landing-browse-overlay">
                                    <h3>Romance Collection</h3>
                                </div>
                            </div>
                            <div className="search-landing-browse-card" onClick={() => handleCategoryClick('Chill Vibes', 'chill lofi Hindi relax')}>
                                <img src="/cards/raat-ki-drive.png" alt="Chill Vibes" />
                                <div className="search-landing-browse-overlay">
                                    <h3>Chill Vibes</h3>
                                </div>
                            </div>
                            <div className="search-landing-browse-card" onClick={() => handleCategoryClick('Made For You', 'trending India 2024')}>
                                <img src="/cards/weekend-vibes.png" alt="Made For You" />
                                <div className="search-landing-browse-overlay">
                                    <h3>Made For You</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Browse Albums Carousel Section */}
                    <div className="search-landing-section" style={{ marginTop: '24px' }}>
                        <h2 className="search-landing-section-title">Browse Albums</h2>
                        <div className="search-landing-albums-carousel">
                            {Object.entries(albums).map(([name, album]) => (
                                <div
                                    className="search-landing-album-card-carousel"
                                    key={name}
                                    onClick={() => navigateTo('album', { name, type: 'Album', cover: album.cover, songs: album.songs })}
                                >
                                    <div className="search-landing-album-cover-wrapper">
                                        <img src={album.cover} alt={name} />
                                        <button className="search-landing-play-btn-carousel" onClick={(e) => { e.stopPropagation(); playSong(album.songs, 0, name); }}>
                                            <PlayIcon />
                                        </button>
                                    </div>
                                    <div className="search-landing-album-title">{name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchView;
