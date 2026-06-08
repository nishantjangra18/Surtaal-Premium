import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { userLibraryService } from '../services/userLibraryService';

const quotes = [
    { text: "Music wo zubaan hai, jo alfaaz keh nahi paate.",              author: "Unknown" },
    { text: "Sur aur taal jab milte hain, toh ruh jhoom uthi hai.",         author: "Ustad Bismillah Khan" },
    { text: "Sangeet mein woh taakat hai jo dilo ko jod deti hai.",          author: "Lata Mangeshkar" },
    { text: "Har sur mein ek kahani hai, bas sunne wala chahiye.",           author: "A.R. Rahman" },
    { text: "Taal ke bina sur adhoora hai, sur ke bina taal bekar.",         author: "Zakir Hussain" },
];

const fmtDuration = (seconds) => {
    if (!seconds || seconds <= 0) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return `${Math.floor(seconds)}s`;
};

// ── In-memory cache for Spotify artist images ───────────────────────────────
const artistImageCache = new Map();
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Fetch a high-quality artist photo from Spotify via the backend's
 * /api/music/artists endpoint. Results are cached in memory to avoid
 * repeated network calls.
 */
const fetchArtistImage = async (artistName) => {
    if (!artistName) return null;
    if (artistImageCache.has(artistName)) return artistImageCache.get(artistName);

    try {
        const response = await fetch(`${API_BASE_URL}/api/music/artists?query=${encodeURIComponent(artistName)}&limit=1`);
        if (!response.ok) return null;
        const artists = await response.json();

        // Find best match — exact or starts-with name match
        const match = artists.find(a =>
            a.name.toLowerCase() === artistName.toLowerCase() ||
            a.name.toLowerCase().startsWith(artistName.toLowerCase())
        ) || artists[0];

        const image = match?.image || null;
        artistImageCache.set(artistName, image);
        return image;
    } catch {
        artistImageCache.set(artistName, null);
        return null;
    }
};

const ArrowIcon = ({ direction }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        {direction === 'left'
            ? <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            : <path d="m8.59 16.59 1.41 1.41 6-6-6-6-1.41 1.41L13.17 12z" />}
    </svg>
);

const RightSidebar = () => {
    const { user, requireLogin }          = useContext(AuthContext);
    const [quote,        setQuote]        = useState(quotes[0]);
    const [stats,        setStats]        = useState(null);
    const [topArtists,   setTopArtists]   = useState([]);
    const [loadingStats, setLoadingStats] = useState(false);
    const carouselRef                     = useRef(null);

    useEffect(() => {
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    const scroll = (direction) => {
        const row = carouselRef.current;
        if (!row) return;
        const amount = 150;
        row.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    // ── Fetch Spotify artist images for the top artists list ────────────────
    const enrichArtistsWithImages = useCallback(async (artists) => {
        const enriched = await Promise.all(
            artists.map(async (artist) => {
                const spotifyImage = await fetchArtistImage(artist.name);
                return {
                    ...artist,
                    // Prefer Spotify artist photo; fall back to song cover from history
                    image: spotifyImage || artist.image || null,
                };
            })
        );
        return enriched;
    }, []);

    // ── Fetch per-user stats from backend whenever user changes ─────────────
    useEffect(() => {
        if (!user) {
            setStats(null);
            setTopArtists([]);
            return;
        }

        let cancelled = false;
        setLoadingStats(true);

        userLibraryService.getStats()
            .then(async (data) => {
                if (cancelled || !data) return;
                setStats(data);

                // Split comma-separated artist strings, aggregate play counts, and get unique artists
                const artistMap = {};
                (data.favoriteArtists || []).forEach(a => {
                    if (!a || !a.name) return;
                    
                    const names = a.name.split(',').map(n => n.trim()).filter(Boolean);
                    names.forEach(name => {
                        if (name === 'Various Artists') return;
                        if (!artistMap[name]) {
                            artistMap[name] = {
                                name,
                                count: 0,
                                image: a.image || null,
                            };
                        }
                        artistMap[name].count += (a.count || 1);
                        if (!artistMap[name].image && a.image) {
                            artistMap[name].image = a.image;
                        }
                    });
                });

                // Sort unique artists by aggregated play count descending and select top 10 for the carousel
                const rawArtists = Object.values(artistMap)
                    .sort((x, y) => y.count - x.count)
                    .slice(0, 10)
                    .map(a => ({
                        name:  a.name,
                        image: a.image,
                    }));

                if (rawArtists.length > 0) {
                    const enriched = await enrichArtistsWithImages(rawArtists);
                    if (!cancelled) setTopArtists(enriched);
                }
            })
            .catch(err => console.warn('[RightSidebar] Stats fetch failed:', err.message))
            .finally(() => { if (!cancelled) setLoadingStats(false); });

        return () => { cancelled = true; };
    }, [user, enrichArtistsWithImages]);

    // Stat rows derived from backend data
    const statRows = stats ? [
        { label: "Today's Listening",  value: fmtDuration(stats.todayListeningSeconds) },
        { label: 'Total Songs Played', value: stats.totalSongsPlayed > 0 ? String(stats.totalSongsPlayed) : '—' },
        { label: 'Most Played Song',   value: stats.mostPlayedSong || '—' },
        { label: 'Top Artist',         value: stats.topArtist     || '—' },
        { label: 'Top Genre',          value: stats.topGenre      || '—' },
        { label: 'Streak',             value: stats.listeningStreakDays > 0 ? `${stats.listeningStreakDays} day${stats.listeningStreakDays !== 1 ? 's' : ''}` : '—' },
    ] : [];

    return (
        <div className="right-sidebar">
            {/* Quote — always visible */}
            <div className="quote-card">
                <div className="quote-card-header">Quote of the day</div>
                <div className="quote-card-body">
                    <blockquote className="quote-text">"{quote.text}"</blockquote>
                    <cite className="quote-author">- {quote.author}</cite>
                </div>
                <div className="quote-ornament" aria-hidden="true">
                    <svg viewBox="0 0 80 80" width="60" height="60" opacity="0.08">
                        <circle cx="40" cy="40" r="38" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                        <circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                        <circle cx="40" cy="40" r="18" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                        <circle cx="40" cy="40" r="8"  fill="none" stroke="currentColor" strokeWidth="0.5"/>
                        {[0,45,90,135,180,225,270,315].map(a => (
                            <line key={a} x1="40" y1="2" x2="40" y2="78"
                                stroke="currentColor" strokeWidth="0.3"
                                transform={`rotate(${a} 40 40)`}/>
                        ))}
                    </svg>
                </div>
            </div>

            {/* ── Not logged in ── */}
            {!user ? (
                <div className="stats-login-gate">
                    <span className="gate-icon">♪</span>
                    <p>Login to see your music journey — listening stats, top artists and more.</p>
                    <button
                        className="stats-login-btn"
                        onClick={() => requireLogin({ message: 'Login to see your music journey.' })}
                    >
                        Login
                    </button>
                </div>
            ) : (
                <>
                    {/* Listening Stats — from backend /api/songs/stats */}
                    <div className="right-section listening-stats-section">
                        <div className="right-section-header">
                            <span className="right-section-title">Listening Stats</span>
                        </div>
                        <div className="stats-compact-card">
                            {loadingStats && statRows.length === 0 ? (
                                <div className="stat-row">
                                    <span className="stat-label" style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Loading…</span>
                                </div>
                            ) : statRows.map(stat => (
                                <div className="stat-row" key={stat.label}>
                                    <span className="stat-label">{stat.label}</span>
                                    <span className="stat-value">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Artists — premium showcase */}
                    <div className="right-section top-artists-section">
                        <div className="right-section-header">
                            <span className="right-section-title">Top Artists</span>
                        </div>
                        {topArtists.length === 0 ? (
                            <p className="top-artists-empty">
                                {loadingStats ? 'Loading…' : 'Play some songs to see your top artists.'}
                            </p>
                        ) : (
                            <div className="top-artists-carousel-wrapper">
                                <button className="top-artists-arrow arrow-left" onClick={() => scroll('left')} aria-label="Scroll left">
                                    <ArrowIcon direction="left" />
                                </button>
                                <div className="top-artists-carousel-row" ref={carouselRef}>
                                    {topArtists.map((artist) => (
                                        <div className="top-artist-card" key={artist.name}>
                                            <div className="top-artist-photo">
                                                {artist.image ? (
                                                    <img src={artist.image} alt={artist.name} />
                                                ) : (
                                                    <span className="top-artist-fallback">
                                                        {artist.name.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="top-artist-name">{artist.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="top-artists-arrow arrow-right" onClick={() => scroll('right')} aria-label="Scroll right">
                                    <ArrowIcon direction="right" />
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default RightSidebar;
