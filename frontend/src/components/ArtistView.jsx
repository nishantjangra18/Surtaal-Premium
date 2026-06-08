import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MusicContext } from '../context/MusicContext';
import { musicService } from '../services/musicService';


const PlayIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);

const PlayAllIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);

const HeartIcon = ({ filled }) => filled ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>
);

const MoreIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
);

const ArrowIcon = ({ direction }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        {direction === 'left'
            ? <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            : <path d="m8.59 16.59 1.41 1.41 6-6-6-6-1.41 1.41L13.17 12z" />}
    </svg>
);

const Equalizer = () => (
    <span className="search-eq" aria-label="Now playing" style={{ display: 'inline-flex', gap: '3px', alignItems: 'flex-end', height: '14px' }}>
        <span className="search-eq-bar" style={{ width: '3px', height: '100%', background: 'var(--amber)', animation: 'bounce-eq 0.8s ease-in-out infinite alternate' }} />
        <span className="search-eq-bar" style={{ width: '3px', height: '60%', background: 'var(--amber)', animation: 'bounce-eq 0.8s ease-in-out infinite alternate 0.2s' }} />
        <span className="search-eq-bar" style={{ width: '3px', height: '80%', background: 'var(--amber)', animation: 'bounce-eq 0.8s ease-in-out infinite alternate 0.4s' }} />
        <span className="search-eq-bar" style={{ width: '3px', height: '40%', background: 'var(--amber)', animation: 'bounce-eq 0.8s ease-in-out infinite alternate 0.6s' }} />
    </span>
);

const artistDataCache = new Map();

// Per-category gradient fallback — never use dhun.jpg for unrelated content
const ARTIST_FALLBACK_GRADIENT = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';

const handleImageError = (e) => {
    // Replace broken image with a gradient placeholder
    const parent = e.target.parentElement;
    if (parent) {
        e.target.style.display = 'none';
        // Check if fallback already exists
        if (!parent.querySelector('.img-fallback-icon')) {
            const fallback = document.createElement('div');
            fallback.className = 'img-fallback-icon';
            fallback.style.cssText = `
                width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;
                background: ${ARTIST_FALLBACK_GRADIENT}; border-radius: inherit; font-size: 24px; color: white;
            `;
            fallback.textContent = '🎤';
            parent.appendChild(fallback);
        }
    }
};

const getArtistBio = (name, genres = []) => {
    const lower = name.toLowerCase();
    if (lower.includes('karan aujla') || lower.includes('diljit') || lower.includes('ap dhillon') || lower.includes('mxrci')) {
        return "Popular Punjabi Artist";
    }
    if (lower.includes('arijit') || lower.includes('jasleen') || lower.includes('armaan')) {
        return "Popular Bollywood Artist";
    }
    if (genres.some(g => g.toLowerCase().includes('punjabi') || g.toLowerCase().includes('bhangra'))) {
        return "Popular Punjabi Artist";
    }
    if (genres.some(g => g.toLowerCase().includes('bollywood') || g.toLowerCase().includes('desi') || g.toLowerCase().includes('filmi'))) {
        return "Popular Bollywood Artist";
    }
    return "Popular Indian Artist";
};

const ArtistView = () => {
    const navigate = useNavigate();
    const {
        activeViewData, playSpotifySong, playSong, currentSong, isPlaying, toggleLike, isLiked, navigateTo,
        addToQueue, setPlaylistPickerSong, showToast
    } = useContext(MusicContext);

    const [artistDetails, setArtistDetails] = useState(null);
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [relatedArtists, setRelatedArtists] = useState([]);
    const [visibleSongsCount, setVisibleSongsCount] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const [loadingSongId, setLoadingSongId] = useState(null);

    const albumsRef = useRef(null);
    const relatedRef = useRef(null);
    const headerRef = useRef(null);

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/');
        }
    };

    const artistName = activeViewData?.name || '';

    useEffect(() => {
        if (!artistName) return;

        let cancelled = false;
        const loadArtistData = async () => {
            const cacheKey = artistName;
            if (artistDataCache.has(cacheKey)) {
                const cached = artistDataCache.get(cacheKey);
                console.log(`[Explore Audit] Cache hit for artist: "${artistName}". SOURCE: Cache`);
                if (!cancelled) {
                    setArtistDetails(cached.details);
                    setSongs(cached.songs);
                    setAlbums(cached.albums);
                    setRelatedArtists(cached.relatedArtists);
                    setVisibleSongsCount(10);
                    setIsLoading(false);
                }
                return;
            }

            if (!cancelled) {
                setIsLoading(true);
                setError('');
            }

            try {
                console.log(`[Explore Audit] Spotify request sent for artist: "${artistName}"`);
                let details = await musicService.getArtistByName(artistName);
                let artistId = details?.id;
                let fetchedSongs = [];
                let fetchedAlbums = [];
                let fetchedRelated = [];

                if (artistId) {
                    const [topTracks, albumsList, related] = await Promise.all([
                        musicService.getArtistTopTracks(artistId).catch(() => []),
                        musicService.getArtistAlbums(artistId).catch(() => []),
                        musicService.getRelatedArtists(artistId).catch(() => []),
                    ]);

                    if (topTracks.length > 0) {
                        console.log(`[Explore Audit] Spotify response received for artist top tracks: "${artistName}". Track count: ${topTracks.length}. SOURCE: Spotify API`);
                        fetchedSongs = topTracks;
                    }
                    fetchedAlbums = albumsList;
                    fetchedRelated = related;
                }

                // If Spotify top-tracks returns few tracks, try multiple search strategies
                if (fetchedSongs.length < 8) {
                    const searchQueries = [
                        `artist:${artistName}`,
                        `${artistName} songs`,
                        `${artistName} Hindi Punjabi`,
                    ];
                    const seen = new Set(fetchedSongs.map(s => s.id));

                    for (const sq of searchQueries) {
                        if (fetchedSongs.length >= 15) break; // enough songs
                        try {
                            console.log(`[Explore Audit] Spotify search fallback: "${sq}"`);
                            const searchResults = await musicService.searchSongs(sq, { limit: 20 });
                            if (searchResults.length > 0) {
                                console.log(`[Explore Audit] Spotify search "${sq}" returned ${searchResults.length} tracks. SOURCE: Spotify API`);
                                searchResults.forEach(s => {
                                    if (s.id && !seen.has(s.id)) {
                                        seen.add(s.id);
                                        fetchedSongs.push(s);
                                    }
                                });
                            }
                        } catch (e) {
                            console.warn(`[Explore Audit] Search fallback "${sq}" failed:`, e.message);
                        }
                    }
                }

                if (fetchedSongs.length === 0) {
                    console.log(`[Explore Audit] No Spotify tracks found for artist: "${artistName}" after all strategies. SOURCE: Spotify API (empty)`);
                }

                if (!details) {
                    details = {
                        name: artistName,
                        image: activeViewData?.image || '',
                        genres: ['Indian Music'],
                        popularity: 50
                    };
                }

                const resultData = { details, songs: fetchedSongs, albums: fetchedAlbums, relatedArtists: fetchedRelated };
                artistDataCache.set(cacheKey, resultData);

                if (!cancelled) {
                    setArtistDetails(details);
                    setSongs(fetchedSongs);
                    setAlbums(fetchedAlbums);
                    setRelatedArtists(fetchedRelated);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Failed loading artist:", err);
                if (!cancelled) {
                    setError('Failed to load artist details.');
                    setIsLoading(false);
                }
            }
        };

        loadArtistData();

        return () => {
            cancelled = true;
        };
    }, [artistName]);

    // Apply color gradient backdrop based on artist photo
    useEffect(() => {
        if (!headerRef.current || !artistDetails?.image) return;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = artistDetails.image;
        img.onload = () => {
            try {
                if (window.ColorThief) {
                    const ct = new window.ColorThief();
                    const color = ct.getColor(img);
                    if (color && headerRef.current) {
                        headerRef.current.style.background = `linear-gradient(to bottom, rgba(${color.join(',')}, 0.5) 0%, var(--bg-base) 100%)`;
                    }
                }
            } catch {
                if (headerRef.current) {
                    headerRef.current.style.background = 'linear-gradient(to bottom, rgba(42, 36, 32, 0.6) 0%, var(--bg-base) 100%)';
                }
            }
        };
    }, [artistDetails?.image]);

    // Clear spinner once playing status is verified
    useEffect(() => {
        if (isPlaying && currentSong && loadingSongId) {
            const key = currentSong.spotifyId || currentSong.id || currentSong.src || currentSong.title;
            if (key === loadingSongId) setLoadingSongId(null);
        }
    }, [isPlaying, currentSong, loadingSongId]);

    if (isLoading) {
        return (
            <div className="explore-collection-loading" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <span className="explore-collection-spinner" />
                <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading artist profile...</p>
            </div>
        );
    }

    if (error || !artistDetails) {
        return (
            <div className="detail-view" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--danger)' }}>{error || 'Artist details not found.'}</p>
                <button className="explore-load-more-btn" onClick={() => navigateTo('search')}>Back to Explore</button>
            </div>
        );
    }

    const { name, image, genres, popularity } = artistDetails;
    const bioText = getArtistBio(name, genres);
    const formattedListeners = `${(popularity * 12345 + 500000).toLocaleString()} monthly listeners`;

    const songsToDisplay = songs.slice(0, visibleSongsCount);
    const hasMore = songs.length > visibleSongsCount;

    const handlePlayAll = () => {
        if (songs.length === 0) return;
        const song = songs[0];
        setLoadingSongId(song.spotifyId || song.id || song.src || song.title);
        playSpotifySong(song, `${name} Top Tracks`, songs, 0);
    };

    const handlePlaySong = (song, idx) => {
        setLoadingSongId(song.spotifyId || song.id || song.src || song.title);
        playSpotifySong(song, `${name} Top Tracks`, songs, idx);
    };

    const scroll = (ref, direction) => {
        const row = ref.current;
        if (!row) return;
        const amount = Math.max(row.clientWidth * 0.78, 260);
        row.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    return (
        <div className="detail-view artist-view-page">
            <button className="mobile-back-btn" onClick={handleBack} aria-label="Back">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>

            {/* Hero Header */}
            <div className="detail-header artist-hero" ref={headerRef}>
                <div className="artist-hero-photo-wrap">
                    {image ? (
                        <img src={image} alt={name} className="detail-cover artist-hero-photo" onError={handleImageError} />
                    ) : (
                        <div className="detail-cover artist-hero-photo" style={{ background: ARTIST_FALLBACK_GRADIENT, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '48px', color: 'white' }}>
                            {name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="detail-info artist-hero-info">
                    <span className="detail-type artist-bio-pill">{bioText}</span>
                    <h1 className="detail-title artist-name-title">{name}</h1>
                    <span className="detail-meta artist-listeners-count">{formattedListeners}</span>
                </div>
            </div>

            {/* Play Actions */}
            <div className="detail-actions">
                <button className="play-all-btn" onClick={handlePlayAll} title="Play Popular Songs" disabled={songs.length === 0}>
                    <PlayAllIcon />
                </button>
            </div>

            <div className="detail-divider"></div>

            {/* Popular Songs Section */}
            <div className="artist-songs-section">
                <h2 className="artist-section-heading">Popular Songs</h2>
                {songs.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>No popular songs available from Spotify.</p>
                ) : (
                    <div className="song-list">
                        <div className="song-list-header">
                            <span>#</span>
                            <span>Title</span>
                            <span>Singer</span>
                            <span></span>
                        </div>
                        {songsToDisplay.map((song, index) => {
                            const isCurrent = currentSong && (currentSong.spotifyId === song.spotifyId || currentSong.id === song.id || currentSong.src === song.src);
                            const isActive = isCurrent && isPlaying;
                            const isSongLoading = loadingSongId && (song.spotifyId === loadingSongId || song.id === loadingSongId || song.src === loadingSongId);

                            return (
                                <div
                                    key={song.id || index}
                                    className={`song-row ${isCurrent ? 'active' : ''}`}
                                    onClick={() => handlePlaySong(song, index)}
                                >
                                    <div className="song-index">
                                        {isSongLoading ? (
                                            <span className="song-row-spinner" />
                                        ) : isActive ? (
                                            <Equalizer />
                                        ) : (
                                            <>
                                                <span className="index-number">{index + 1}</span>
                                                <span className="play-icon"><PlayIcon /></span>
                                            </>
                                        )}
                                    </div>
                                    <div className="song-main">
                                        <img src={song.cover} alt={song.title} onError={handleImageError} />
                                        <span className="song-name">{song.title}</span>
                                    </div>
                                    <span className="song-artist-col">{song.singer}</span>
                                    <button
                                        className={`song-like-btn ${isLiked(song) ? 'liked' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                                    >
                                        <HeartIcon filled={isLiked(song)} />
                                    </button>
                                    <div className="song-more-wrapper">
                                        <button className="song-more-btn" onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(openMenuIndex === index ? null : index); }}>
                                            <MoreIcon />
                                        </button>
                                        {openMenuIndex === index && (
                                            <div className="song-options-menu song-row-menu" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => { addToQueue(song, true); setOpenMenuIndex(null); }}>Play Next</button>
                                                <button onClick={() => { addToQueue(song); setOpenMenuIndex(null); }}>Add to Queue</button>
                                                <button onClick={() => { setPlaylistPickerSong(song); setOpenMenuIndex(null); }}>Add to Playlist</button>
                                                <button onClick={() => { toggleLike(song); setOpenMenuIndex(null); }}>{isLiked(song) ? 'Unlike Song' : 'Like Song'}</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {hasMore && (
                    <div className="explore-load-more-container" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <button className="explore-load-more-btn" onClick={() => setVisibleSongsCount(prev => prev + 10)}>
                            Load More
                        </button>
                    </div>
                )}
            </div>

            {/* Albums Section */}
            {albums.length > 0 && (
                <div className="artist-albums-section explore-section-block" style={{ marginTop: '3rem' }}>
                    <div className="explore-section-header">
                        <h2 className="artist-section-heading">Albums</h2>
                    </div>
                    <div className="explore-carousel-wrapper">
                        <button className="explore-arrow arrow-left" onClick={() => scroll(albumsRef, 'left')} aria-label="Scroll left">
                            <ArrowIcon direction="left" />
                        </button>
                        <div className="explore-carousel-row" ref={albumsRef}>
                            {albums.map((album) => (
                                <div
                                    className="cinema-card"
                                    key={album.id}
                                    onClick={async () => {
                                        // Always fetch tracks from Spotify
                                        let albumSongs = [];
                                        try {
                                            albumSongs = await musicService.searchSongs(`album:${album.name}`, { limit: 25 });
                                            console.log(`[Explore Audit] Album "${album.name}" tracks fetched. Count: ${albumSongs.length}. SOURCE: Spotify API`);
                                        } catch (e) {
                                            console.warn("Failed fetching album tracks:", e);
                                        }
                                        navigateTo('album', {
                                            name: album.name,
                                            cover: album.cover,
                                            type: album.type === 'single' ? 'Single' : 'Album',
                                            songs: albumSongs
                                        });
                                    }}
                                >
                                    <div className="card-cover-wrapper">
                                        {album.cover ? (
                                            <img src={album.cover} alt={album.name} onError={handleImageError} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px', fontSize: '24px', color: 'white' }}>💿</div>
                                        )}
                                        <button className="card-play-btn" onClick={(e) => e.stopPropagation()}>
                                            <PlayIcon />
                                        </button>
                                    </div>
                                    <div className="card-title">{album.name}</div>
                                    <div className="card-subtitle">{album.releaseDate ? album.releaseDate.split('-')[0] : 'Album'}</div>
                                </div>
                            ))}
                        </div>
                        <button className="explore-arrow arrow-right" onClick={() => scroll(albumsRef, 'right')} aria-label="Scroll right">
                            <ArrowIcon direction="right" />
                        </button>
                    </div>
                </div>
            )}

            {/* Related Artists Section */}
            {relatedArtists.length > 0 && (
                <div className="artist-related-section explore-section-block" style={{ marginTop: '3rem', marginBottom: '3rem' }}>
                    <div className="explore-section-header">
                        <h2 className="artist-section-heading">Related Artists</h2>
                    </div>
                    <div className="explore-carousel-wrapper">
                        <button className="explore-arrow arrow-left" onClick={() => scroll(relatedRef, 'left')} aria-label="Scroll left">
                            <ArrowIcon direction="left" />
                        </button>
                        <div className="explore-carousel-row" ref={relatedRef}>
                            {relatedArtists.map((artist) => (
                                <div
                                    className="explore-artist-card"
                                    key={artist.name}
                                    onClick={() => navigateTo('artist', { name: artist.name, image: artist.image })}
                                    style={{ flex: '0 0 auto', width: '130px', margin: '0 10px', textAlign: 'center', cursor: 'pointer' }}
                                >
                                    <div className="explore-artist-photo" style={{ width: '90px', height: '90px', margin: '0 auto 10px', borderRadius: '50%', overflow: 'hidden' }}>
                                        {artist.image ? (
                                            <img src={artist.image} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={handleImageError} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', background: ARTIST_FALLBACK_GRADIENT, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', color: 'white' }}>
                                                {artist.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className="explore-artist-name" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--text-base)' }}>
                                        {artist.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button className="explore-arrow arrow-right" onClick={() => scroll(relatedRef, 'right')} aria-label="Scroll right">
                            <ArrowIcon direction="right" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArtistView;
