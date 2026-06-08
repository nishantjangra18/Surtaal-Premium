import React, { useContext, useEffect, useRef, useState } from 'react';
import { MusicContext } from '../context/MusicContext';
import { AuthContext } from '../context/AuthContext';
import { musicService } from '../services/musicService';
import { profileName, useProfileSettings, getDisplayName } from './ProfileViews';
import { albums, playlists, newReleases } from '../data';

const PlayIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);

const ArrowIcon = ({ direction }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        {direction === 'left'
            ? <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            : <path d="m8.59 16.59 1.41 1.41 6-6-6-6-1.41 1.41L13.17 12z" />}
    </svg>
);

const MoreIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>;

const MoodSymbol = ({ type }) => {
    const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
    const icons = {
        relax: <svg {...common}><path d="M12 21c-3.8-2.1-6-5.1-6-8.2 0-2.8 1.9-5.3 6-9.8 4.1 4.5 6 7 6 9.8 0 3.1-2.2 6.1-6 8.2Z"/><path d="M12 21c0-5.2 0-9.2 0-13"/><path d="M8.2 14.4c1.1.2 2.4.1 3.8-.7 1.4.8 2.7.9 3.8.7"/></svg>,
        focus: <svg {...common}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>,
        workout: <svg {...common}><path d="m13 2-7 11h5l-1 9 8-13h-5l1-7Z"/></svg>,
        party: <svg {...common}><path d="M4 18V8M8 18V4M12 18v-7M16 18V6M20 18v-4"/><path d="M3 18h18"/></svg>,
        heartbreak: <svg {...common}><path d="M12 21C8 17.2 4 14.2 4 9.5A4.4 4.4 0 0 1 8.5 5c1.7 0 2.8.8 3.5 1.8C12.7 5.8 13.8 5 15.5 5A4.4 4.4 0 0 1 20 9.5c0 4.7-4 7.7-8 11.5Z"/><path d="m13 6-2 5h4l-3 5"/></svg>,
        sleep: <svg {...common}><path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7 7 0 1 0 9.5 9.5Z"/><path d="M18 3v4M16 5h4"/></svg>,
    };
    return icons[type] || icons.relax;
};

const moods = [
    { icon: 'R', label: 'Relax', desc: 'Calm your mind', visual: 'relax', gradient: 'linear-gradient(135deg, rgba(24,104,85,0.82), rgba(16,54,69,0.78))' },
    { icon: 'W', label: 'Workout', desc: 'High energy', visual: 'workout', gradient: 'linear-gradient(135deg, rgba(151,88,20,0.84), rgba(74,38,13,0.8))' },
    { icon: 'P', label: 'Punjabi', desc: 'Dhol energy', visual: 'party', gradient: 'linear-gradient(135deg, rgba(151,88,20,0.84), rgba(74,38,13,0.8))' },
    { icon: 'B', label: 'Bollywood', desc: 'Film hits', visual: 'focus', gradient: 'linear-gradient(135deg, rgba(33,91,151,0.82), rgba(18,45,91,0.78))' },
    { icon: 'R', label: 'Romance', desc: 'Feel the love', visual: 'heartbreak', gradient: 'linear-gradient(135deg, rgba(148,45,84,0.82), rgba(69,25,58,0.8))' },
    { icon: 'S', label: 'Sad Songs', desc: 'Dil se', visual: 'heartbreak', gradient: 'linear-gradient(135deg, rgba(105,51,82,0.82), rgba(37,35,63,0.8))' },
    { icon: 'P', label: 'Party', desc: 'Turn it up', visual: 'party', gradient: 'linear-gradient(135deg, rgba(148,45,84,0.82), rgba(69,25,58,0.8))' },
    { icon: '9', label: "90's Hits", desc: 'Retro gold', visual: 'sleep', gradient: 'linear-gradient(135deg, rgba(54,56,122,0.82), rgba(15,24,62,0.82))' },
];

const topValue = (items, valueFn) => {
    const counts = items.reduce((map, item) => {
        const value = valueFn(item);
        if (!value) return map;
        map[value] = (map[value] || 0) + 1;
        return map;
    }, {});

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
};

const MusicCard = ({ song, index, playlist, playlistName, playSong }) => {
    const { addToQueue, setPlaylistPickerSong, toggleLike, isLiked, playSpotifySong } = useContext(MusicContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const handleClick = () => {
        // Auth gate is handled inside playSpotifySong / playSong in MusicContext
        if (!song.src) {
            playSpotifySong(song, playlistName || song.title, playlist || [song], index || 0);
        } else {
            playSong(playlist || [song], index || 0, playlistName || song.title);
        }
    };
    const handlePlay = (e) => {
        e.stopPropagation();
        handleClick();
    };

    return (
        <div className="cinema-card" onClick={handleClick}>
            <img className="card-ambient" src={song.cover} alt="" aria-hidden="true" />
            <div className="card-cover-wrapper">
                <img src={song.cover} alt={song.title} />
                <button className="card-play-btn" onClick={handlePlay} title={`Play ${song.title}`}>
                    <PlayIcon />
                </button>
                <span className="popularity-pill">Hot</span>
                <button className="card-more-btn" onClick={(e) => { e.stopPropagation(); setMenuOpen(prev => !prev); }} title="More options">
                    <MoreIcon />
                </button>
                {menuOpen && (
                    <div className="song-options-menu" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { addToQueue(song, true); setMenuOpen(false); }}>Play Next</button>
                        <button onClick={() => { addToQueue(song); setMenuOpen(false); }}>Add to Queue</button>
                        <button onClick={() => { setPlaylistPickerSong(song); setMenuOpen(false); }}>Add to Playlist</button>
                        <button onClick={() => { toggleLike(song); setMenuOpen(false); }}>{isLiked(song) ? 'Unlike Song' : 'Like Song'}</button>
                    </div>
                )}
            </div>
            <div className="card-title">{song.title}</div>
            <div className="card-subtitle">{song.singer}</div>
        </div>
    );
};

const CarouselSection = ({ title, subtitle = '', children, className = 'card-row', header = true, onSeeAll }) => {
    const rowRef = useRef(null);

    const scroll = (direction) => {
        const row = rowRef.current;
        if (!row) return;
        const amount = Math.max(row.clientWidth * 0.78, 260);
        row.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    return (
        <section className="carousel-block">
            {header && (
                <div className="section-header">
                    <h2 className="section-title">{title}</h2>
                    <button className="section-see-all" onClick={onSeeAll}>See all</button>
                </div>
            )}
            {subtitle && <p className="mobile-section-subtitle">{subtitle}</p>}
            <div className="carousel-shell">
                <button className="carousel-arrow carousel-arrow-left" onClick={() => scroll('left')} aria-label={`Scroll ${title || 'section'} left`}>
                    <ArrowIcon direction="left" />
                </button>
                <div className={className} ref={rowRef}>
                    {children}
                </div>
                <button className="carousel-arrow carousel-arrow-right" onClick={() => scroll('right')} aria-label={`Scroll ${title || 'section'} right`}>
                    <ArrowIcon direction="right" />
                </button>
            </div>
        </section>
    );
};

const HomeView = () => {
    const {
        playSong, playSpotifySong, navigateTo, listeningHistory, recentlyPlayed,
        likedSongs, setCreatePlaylistOpen,
    } = useContext(MusicContext);
    const { user, requireLogin } = useContext(AuthContext);
    const [profile] = useProfileSettings();
    const [recommendations, setRecommendations] = useState([]);

    const handleLikedSongsClick = () => {
        if (!user) {
            requireLogin({ message: 'Login to access your liked songs.' });
        } else {
            navigateTo('album', { 
                id: 'liked-songs',
                name: 'Liked Songs', 
                type: 'Playlist', 
                cover: '/liked-songs-cover.webp', 
                songs: likedSongs,
                isCustom: true
            });
        }
    };

    const handleCreatePlaylistClick = () => {
        if (!user) {
            requireLogin({ message: 'Login to create playlists.' });
        } else {
            setCreatePlaylistOpen(true);
        }
    };

    const displayName = user ? getDisplayName(profileName(user, profile)) : null;

    useEffect(() => {
        let cancelled = false;

        const loadRecommendations = async () => {
            // Only derive personalisation from activity when the user is logged in.
            // Guests always get generic Indian seeds — never cached localStorage activity.
            let topArtist    = '';
            let favoriteGenre = '';
            let mostPlayed   = '';

            if (user) {
                const activity = [...(listeningHistory || []), ...(recentlyPlayed || [])];
                topArtist     = topValue(activity, s => s.artist || s.singer);
                favoriteGenre = topValue(activity, s => s.genre);
                mostPlayed    = topValue(activity, s => s.title);
            }

            try {
                const { sections } = await musicService.getRecommendations({
                    topArtist,
                    favoriteGenre,
                    mostPlayed,
                });
                if (cancelled) return;

                // For guests, hide the personalised "Because You Like …" section
                const visibleSections = sections.filter(s => {
                    if (!user && s.key === 'because') return false; // hide personal section for guests
                    return s.songs?.length > 0;
                });
                setRecommendations(visibleSections);
            } catch (error) {
                console.warn('Unable to load recommendations:', error.message);
            }
        };

        loadRecommendations();
        return () => { cancelled = true; };
    }, [user, listeningHistory, recentlyPlayed]);

    const curatedMoodPlaylists = {
        Relax: {
            name: 'Relax Mix',
            cover: albums['Bollywood & Chill']?.cover || '/Covers/dhun.jpg',
            songs: [
                ...(albums['Bollywood & Chill']?.songs || []),
                ...(playlists['Ishq aur Tanhai']?.songs || []),
            ],
        },
        Workout: {
            name: 'Workout Mix',
            cover: albums['Haryanvi Workout']?.cover || '/Covers/2 numbari.jpg',
            songs: albums['Haryanvi Workout']?.songs || [],
        },
        Punjabi: {
            name: 'Punjabi Hits',
            cover: playlists['Punjabi Pump']?.cover || '/punjabi.jpg',
            songs: [
                ...(playlists['Punjabi Pump']?.songs || []),
                ...(playlists['P-POP CULTURE']?.songs || []).slice(0, 6),
            ],
        },
        Bollywood: {
            name: 'Bollywood Romance',
            cover: albums['Bollywood & Chill']?.cover || '/Covers/pardesiya.jpg',
            songs: albums['Bollywood & Chill']?.songs || [],
        },
        Romance: {
            name: 'Romance Mix',
            cover: playlists['Ishq aur Tanhai']?.cover || '/Covers/isq.jpg',
            songs: playlists['Ishq aur Tanhai']?.songs || [],
        },
        'Sad Songs': {
            name: 'Sad Songs',
            cover: '/Covers/phir.jpg',
            songs: [
                ...(playlists['Ishq aur Tanhai']?.songs || []),
                ...(albums.Saiyaara?.songs || []).slice(1),
            ],
        },
        Party: {
            name: 'Party Mix',
            cover: newReleases.Bijuria?.cover || '/Covers/bijuria.jpg',
            songs: [
                ...(Object.values(newReleases).flatMap(item => item.songs || [])),
                ...(albums['The Glory']?.songs || []),
            ],
        },
        "90's Hits": {
            name: "90's Hits",
            cover: playlists["80's-90's"]?.cover || "/80's.jpg",
            songs: playlists["80's-90's"]?.songs || [],
        },
    };

    const openPlaylist = (playlist) => {
        navigateTo('playlist', {
            name: playlist.name,
            type: 'Playlist',
            cover: playlist.cover || playlist.songs?.[0]?.cover || '/Covers/dhun.jpg',
            songs: playlist.songs || [],
        });
    };

    const handleMoodClick = (mood) => {
        const playlist = curatedMoodPlaylists[mood.label];
        if (playlist) openPlaylist(playlist);
    };
    const hour = new Date().getHours();
    const dayGreeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="home-view">
            <div className="hero-section">
                <div className="hero-artwork" aria-hidden="true">
                    <div className="hero-artwork-image" />
                    <div className="hero-ambient-glow" />
                    <div className="hero-particles" />
                </div>

                <div className="hero-content">
                    <span className="mobile-day-greeting">{dayGreeting}</span>
                    <h1 className="hero-greeting">
                        {user && displayName
                            ? <>Namaste, {displayName} <span className="hero-greeting-accent" aria-hidden="true">♫</span></>
                            : user
                                ? <>Namaste <span className="hero-greeting-accent" aria-hidden="true">♫</span></>
                                : <>Namaste <span className="hero-greeting-accent" aria-hidden="true">👋</span></>
                        }
                    </h1>
                    <p className="hero-subtitle">
                        {user
                            ? "Let's vibe with some music today."
                            : 'Discover your next favorite song.'}
                    </p>
                    <div className="desktop-hero-discovery">
                        {(() => {
                            // Use recentlyPlayed (deduplicated unique songs from DB).
                            // Fall back to listeningHistory (raw log) if recentlyPlayed is empty.
                            const source = recentlyPlayed.length > 0
                                ? recentlyPlayed
                                : listeningHistory.reduce((acc, song) => {
                                    const key = song.spotifyId || song.id || song.src || song.title;
                                    if (!acc.seen.has(key)) { acc.seen.add(key); acc.list.push(song); }
                                    return acc;
                                }, { seen: new Set(), list: [] }).list;
                            const recentSongs = source.slice(0, 5);

                            return recentSongs.length > 0 && (
                                <section className="hero-recent-strip">
                                    <span className="hero-mini-label">Recently Played</span>
                                    <div className="hero-recent-row">
                                        {recentSongs.map((song, idx) => (
                                            <button
                                                key={`${song.id || song.title}-${idx}`}
                                                onClick={() => playSong(recentSongs, idx, 'Recently Played')}
                                                title={song.title}
                                                aria-label={`Play ${song.title}`}
                                            >
                                                <img src={song.cover} alt={song.title} />
                                                <b><PlayIcon /></b>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            );
                        })()}
                        <section className="hero-quick-actions">
                            <span className="hero-mini-label">Quick Actions</span>
                            <div className="hero-action-row">
                                <button onClick={handleLikedSongsClick}>♥ Liked Songs</button>
                                <button onClick={() => navigateTo('history')}>♫ Recently Played</button>
                                <button onClick={handleCreatePlaylistClick}>+ Create Playlist</button>
                            </div>
                        </section>
                    </div>
                </div>

            </div>

            {/* Continue Listening Section - Mobile only, hidden on desktop via CSS */}
            {recentlyPlayed.length > 0 && (
                <div className="home-continue-listening-section">
                    <h2 className="home-continue-title">Continue Listening</h2>
                    <div className="home-continue-scroll">
                        {recentlyPlayed.slice(0, 8).map((song, idx) => (
                            <div
                                className="home-continue-card"
                                key={idx}
                                onClick={() => playSong(recentlyPlayed, idx, 'Continue Listening')}
                            >
                                <div className="home-continue-card-image-wrapper">
                                    <img src={song.cover} alt={song.title} />
                                    <button
                                        className="home-continue-card-play-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playSong(recentlyPlayed, idx, 'Continue Listening');
                                        }}
                                        title={`Play ${song.title}`}
                                    >
                                        <PlayIcon />
                                    </button>
                                </div>
                                <div className="home-continue-card-info">
                                    <div className="home-continue-card-title">{song.title}</div>
                                    <div className="home-continue-card-artist">{song.singer || song.artist}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <CarouselSection title="Mood Categories" className="mood-grid mood-section" header={false}>
                {moods.map((mood, idx) => (
                    <div className={`mood-chip mood-${mood.visual}`} key={idx}
                        style={{ background: mood.gradient }}
                        onClick={() => handleMoodClick(mood)}>
                        <span className="mood-visual" aria-hidden="true">
                            <span className="mood-scene" />
                            <span className="mood-spark mood-spark-one" />
                            <span className="mood-spark mood-spark-two" />
                        </span>
                        <span className="mood-icon"><MoodSymbol type={mood.visual} /></span>
                        <div className="mood-chip-text">
                            <span className="mood-label">{mood.label}</span>
                            <span className="mood-desc">{mood.desc}</span>
                        </div>
                    </div>
                ))}
            </CarouselSection>

            {recommendations.map(section => {
                const songs = section.songs || [];
                const mobileTitle = section.key === 'because' ? 'Recommended For You' : section.title;
                return (
                    <CarouselSection
                        title={mobileTitle}
                        subtitle=""
                        key={section.key}
                        onSeeAll={() => openPlaylist({ name: mobileTitle, cover: songs[0]?.cover, songs })}
                    >
                        {songs.map((song, idx) => (
                            <MusicCard key={`${section.key}-${song.id || idx}`} song={song} index={idx} playlist={songs} playlistName={section.title} playSong={playSong} />
                        ))}
                    </CarouselSection>
                );
            })}

            {/* Top Charts section completely removed */}
        </div>
    );
};

export default HomeView;
