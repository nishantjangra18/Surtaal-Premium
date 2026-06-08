import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MusicContext } from '../context/MusicContext';


// SVG Icons
const DownChevronIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6-1.41 1.41z"/>
    </svg>
);
const ShuffleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
    </svg>
);
const PrevIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
    </svg>
);
const PlayIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
    </svg>
);
const PauseIcon = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>
);
const NextIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
    </svg>
);
const RepeatIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
    </svg>
);
const RepeatOneIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>
    </svg>
);
const HeartIcon = ({ filled }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "var(--amber)" : "none"} stroke={filled ? "var(--amber)" : "currentColor"} strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
);
const PlusIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14"/>
    </svg>
);
const MoreIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
);
const LyricsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18h6M10 22h4M12 2v12m-5-8h10M8 10h8"/>
    </svg>
);
const PremiumMicrophoneIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lyrics-premium-icon">
        <rect x="9" y="2" width="6" height="12" rx="3" fill="rgba(212, 161, 93, 0.1)" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 10a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="17" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" />
        <line x1="9" y1="22" x2="15" y2="22" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);
const MiniGoldSparkle = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="gold-bullet">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" fill="currentColor" />
    </svg>
);
const QueueIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
    </svg>
);
const ShareIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
    </svg>
);





const MarqueeText = ({ text, className, onClick, isMobile }) => {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [shouldScroll, setShouldScroll] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        const textEl = textRef.current;
        if (!container || !textEl) return;

        const checkOverflow = () => {
            const overflow = textEl.scrollWidth > container.clientWidth;
            setShouldScroll(overflow);
        };

        checkOverflow();

        const resizeObserver = new ResizeObserver(() => {
            checkOverflow();
        });
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, [text]);

    if (isMobile) {
        if (shouldScroll) {
            return (
                <div ref={containerRef} className={`${className} marquee-container`} onClick={onClick}>
                    <div className="marquee-content">
                        <span ref={textRef} className="marquee-text-item">{text}</span>
                        <span className="marquee-text-spacer">•</span>
                        <span className="marquee-text-item">{text}</span>
                        <span className="marquee-text-spacer">•</span>
                    </div>
                </div>
            );
        }
        return (
            <div ref={containerRef} className={`${className} no-marquee-container`} onClick={onClick}>
                <span ref={textRef} className="no-marquee-text">{text}</span>
            </div>
        );
    }

    // PC view
    if (shouldScroll) {
        const isTitle = className.includes('np-title');
        const marqueeClass = isTitle ? 'song-title-marquee' : 'artist-marquee';
        return (
            <div 
                ref={containerRef} 
                className={`${className} ${marqueeClass}`} 
                onClick={onClick}
            >
                <div className="pc-marquee-track">
                    <span ref={textRef} className="pc-marquee-text-item">{text}</span>
                    <span className="pc-marquee-text-item" aria-hidden="true">{text}</span>
                </div>
            </div>
        );
    }

    return (
        <div 
            ref={containerRef} 
            className={`${className} pc-no-marquee`} 
            onClick={onClick}
        >
            <span ref={textRef} className="pc-static-text">{text}</span>
        </div>
    );
};

const NowPlayingView = () => {
    const navigate = useNavigate();
    const {
        currentSong, isPlaying, progress, currentTime, duration,
        togglePlay, playNext, playPrev, seek,
        toggleShuffle, toggleRepeat, shuffleMode, repeatMode,
        toggleLike, isLiked, setPlaylistPickerSong, navigateTo,
        queue, removeFromQueue,
        showToast, currentPlaylistName,
        setIsNowPlayingExpanded
    } = useContext(MusicContext);

    const containerRef = useRef(null);
    const [activePanel, setActivePanel] = useState(null); // 'lyrics' | 'queue' | 'options' | null
    const [vinylRotate, setVinylRotate] = useState(true);
    const [isCollapsing, setIsCollapsing] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent background body scrolling when mobile player is expanded
    useEffect(() => {
        if (isMobile) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }
    }, [isMobile]);

    const hasLyrics = Array.isArray(currentSong?.lyrics) && currentSong?.lyrics.length > 0;

    const getActiveLyricIndex = () => {
        if (!hasLyrics || !currentSong?.lyrics) return -1;
        let activeIdx = -1;
        for (let i = 0; i < currentSong.lyrics.length; i++) {
            if (currentTime >= currentSong.lyrics[i].time) {
                activeIdx = i;
            } else {
                break;
            }
        }
        return activeIdx;
    };
    const activeLyricIdx = getActiveLyricIndex();

    const lyricsScrollRef = useRef(null);

    useEffect(() => {
        if (!hasLyrics || activeLyricIdx === -1 || !lyricsScrollRef.current) return;
        const container = lyricsScrollRef.current;
        const activeEl = container.querySelector(`[data-index="${activeLyricIdx}"]`);
        if (activeEl) {
            const containerHeight = container.clientHeight;
            const elemTop = activeEl.offsetTop;
            const elemHeight = activeEl.clientHeight;
            
            container.scrollTo({
                top: elemTop - (containerHeight / 2) + (elemHeight / 2),
                behavior: 'smooth'
            });
        }
    }, [activeLyricIdx, hasLyrics]);

    const handleClose = () => {
        setIsCollapsing(true);
        setTimeout(() => {
            setIsNowPlayingExpanded(false);
            setIsCollapsing(false);
        }, 350);
    };

    useEffect(() => {
        if (!currentSong || !containerRef.current) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = currentSong.cover;
        img.onload = () => {
            try {
                if (window.ColorThief) {
                    const ct = new window.ColorThief();
                    const palette = ct.getPalette(img, 3);
                    if (palette && containerRef.current) {
                        const [c1, c2, c3] = palette;
                        containerRef.current.style.setProperty('--dynamic-bg-1', `rgba(${c1.join(',')}, 0.28)`);
                        containerRef.current.style.setProperty('--dynamic-bg-2', `rgba(${c2.join(',')}, 0.18)`);
                        containerRef.current.style.setProperty('--dynamic-bg-3', `rgba(${c3.join(',')}, 0.08)`);
                    }
                }
            } catch {
                // Fallback handles gracefully
            }
        };
    }, [currentSong]);

    if (!currentSong) return null;

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/track/${currentSong.spotifyId || currentSong.id}`;
        const shareData = {
            title: currentSong.title,
            text: `Listen to ${currentSong.title} by ${currentSong.singer} on SurTaal!`,
            url: shareUrl
        };

        if (navigator.share) {
            navigator.share(shareData)
                .then(() => showToast('✓ Shared successfully!'))
                .catch((err) => {
                    if (err.name !== 'AbortError') {
                        navigator.clipboard.writeText(shareUrl)
                            .then(() => showToast('Link copied to clipboard! Share the melody.'))
                            .catch(() => showToast('Failed to copy share link.', 'error'));
                    }
                });
        } else {
            navigator.clipboard.writeText(shareUrl)
                .then(() => showToast('Link copied to clipboard! Share the melody.'))
                .catch(() => showToast('Failed to copy share link.', 'error'));
        }
        setActivePanel(null);
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };



    return (
        <div className={`now-playing-page ${isCollapsing ? 'collapsing' : ''}`} ref={containerRef}>
            {/* Dark blurred ambient backdrop */}
            <div className="np-blur-bg" style={{ backgroundImage: `url(${currentSong.cover})` }} aria-hidden="true" />
            <div className="np-glass-tint" aria-hidden="true" />

            <div className="np-container">
                {/* ── TOP BAR ── */}
                <div className="np-topbar">
                    <button className="np-dismiss-btn" onClick={handleClose} aria-label="Dismiss">
                        <DownChevronIcon />
                    </button>
                    <div className="np-topbar-info">
                        <span className="np-collection-label">PLAYING FROM</span>
                        <span className="np-collection-title">{currentPlaylistName || 'Explore discovering'}</span>
                    </div>
                    <div className="np-topbar-right" style={{ width: '44px' }} />
                </div>

                {/* ── MAIN BODY CONTENT ── */}
                <div className="np-body">
                    {/* Core Player Area */}
                    <div className="np-player-core">
                        {/* Artwork / Vinyl Sleeve container */}
                        <div className="np-visual-section">
                            {/* Centered Artwork Vinyl wrapper */}
                            <div className="np-artwork-container">
                                {/* Rotating Vinyl disc peaking behind artwork */}
                                <div className={`np-vinyl-disc ${isPlaying && vinylRotate ? 'spinning' : ''}`}>
                                    <div className="np-vinyl-grooves" />
                                    <div className="np-vinyl-center">
                                        <img src={currentSong.cover} alt="" />
                                    </div>
                                </div>
                                {/* Rounded cover card overlay */}
                                <div className="np-cover-wrapper">
                                    <img src={currentSong.cover} alt={currentSong.title} className="np-cover-img" crossOrigin="anonymous" />
                                    <div className="np-cover-glow" />
                                </div>
                            </div>
                        </div>

                        {/* Metadata & Controls layout */}
                        <div className="np-details-section">
                            {/* Song Metadata */}
                            <div className="np-meta-container">
                                <div className="np-meta-text">
                                    <MarqueeText
                                        text={currentSong.title}
                                        className="np-title"
                                        isMobile={isMobile}
                                    />
                                    <MarqueeText
                                        text={currentSong.singer}
                                        className="np-artist"
                                        onClick={() => {
                                            navigate('/');
                                            navigateTo('artist', { name: currentSong.singer });
                                        }}
                                        isMobile={isMobile}
                                    />
                                </div>
                                <button className="np-like-btn" onClick={() => toggleLike(currentSong)} aria-label="Like song">
                                    <HeartIcon filled={isLiked(currentSong)} />
                                </button>
                            </div>

                            {/* Timeline / Progress Bar */}
                            <div className="np-timeline-container">
                                <div className="np-timeline-slider-wrapper">
                                    <input
                                        type="range"
                                        className="np-timeline-slider"
                                        value={progress || 0}
                                        max={100}
                                        onChange={(e) => seek((e.target.value / 100) * duration)}
                                        style={{
                                            background: `linear-gradient(to right, var(--amber) ${progress || 0}%, rgba(255, 255, 255, 0.16) ${progress || 0}%)`
                                        }}
                                    />
                                </div>
                                <div className="np-timeline-labels">
                                    <span className="time-curr">{formatTime(currentTime)}</span>
                                    <span className="time-total">{formatTime(duration)}</span>
                                </div>
                            </div>

                            {/* Controls Panel */}
                            <div className="np-controls">
                                <button className={`np-ctrl-btn ${shuffleMode ? 'active' : ''}`} onClick={toggleShuffle} title="Shuffle">
                                    <ShuffleIcon />
                                </button>
                                <button className="np-ctrl-btn" onClick={playPrev} title="Previous">
                                    <PrevIcon />
                                </button>
                                <button className="np-play-pause-btn" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
                                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                                </button>
                                <button className="np-ctrl-btn" onClick={playNext} title="Next">
                                    <NextIcon />
                                </button>
                                <button className={`np-ctrl-btn ${repeatMode !== 'off' ? 'active' : ''}`} onClick={toggleRepeat} title={`Repeat: ${repeatMode}`}>
                                    {repeatMode === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
                                </button>
                            </div>

                            <div className="np-controls-actions-divider" />

                            {/* Footer Sub Actions */}
                            <div className="np-footer-actions">
                                <button className={`np-footer-btn ${activePanel === 'lyrics' ? 'active' : ''}`} onClick={() => setActivePanel(activePanel === 'lyrics' ? null : 'lyrics')}>
                                    <span className="footer-btn-icon"><LyricsIcon /></span> Lyrics
                                </button>
                                <button className={`np-footer-btn ${activePanel === 'queue' ? 'active' : ''}`} onClick={() => setActivePanel(activePanel === 'queue' ? null : 'queue')}>
                                    <span className="footer-btn-icon"><QueueIcon /></span> Queue
                                </button>
                                <button className="np-footer-btn" onClick={() => setPlaylistPickerSong(currentSong)}>
                                    <span className="footer-btn-icon"><PlusIcon /></span> Add Playlist
                                </button>
                                <button className="np-footer-btn" onClick={handleShare}>
                                    <span className="footer-btn-icon"><ShareIcon /></span> Share
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right-side Sliding Panel (Queue or Lyrics) */}
                    <div className={`np-side-panel ${activePanel === 'queue' || activePanel === 'lyrics' ? 'open' : ''}`}>
                        {activePanel === 'queue' && (
                            <div className="np-side-panel-content">
                                <div className="np-panel-header">
                                    <h3>Play Queue</h3>
                                    <button className="np-panel-close" onClick={() => setActivePanel(null)}>✕</button>
                                </div>
                                <div className="np-panel-content">
                                    <div className="np-queue-section-title">Now Playing</div>
                                    <div className="np-queue-item np-queue-active-item">
                                        <img src={currentSong.cover} alt="" />
                                        <div className="np-queue-item-info">
                                            <span className="q-title">{currentSong.title}</span>
                                            <span className="q-singer">{currentSong.singer}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="np-queue-section-title" style={{ marginTop: '24px' }}>Next Up</div>
                                    {queue.length === 0 ? (
                                        <p className="np-panel-empty">Queue is empty.</p>
                                    ) : (
                                        <div className="np-queue-list">
                                            {queue.map((track, idx) => (
                                                <div className="np-queue-item" key={idx}>
                                                    <img src={track.cover || '/Covers/dhun.jpg'} alt="" />
                                                    <div className="np-queue-item-info">
                                                        <span className="q-title">{track.title}</span>
                                                        <span className="q-singer">{track.singer}</span>
                                                    </div>
                                                    <button className="np-queue-remove" onClick={() => removeFromQueue(idx)}>✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {activePanel === 'lyrics' && (
                            <div className="np-side-panel-content">
                                <div className="np-panel-header">
                                    <h3>Lyrics</h3>
                                    <button className="np-panel-close" onClick={() => setActivePanel(null)}>✕</button>
                                </div>
                                <div className="np-panel-content np-lyrics-lines">
                                    <div className="np-lyrics-song-header" style={{ marginBottom: '20px' }}>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--text-cream)' }}>{currentSong.title}</h4>
                                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--amber)' }}>{currentSong.singer}</p>
                                    </div>
                                    {hasLyrics ? (
                                        <div className="np-lyrics-scroll-area" ref={lyricsScrollRef}>
                                            {currentSong.lyrics.map((line, idx) => (
                                                <p
                                                    key={idx}
                                                    data-index={idx}
                                                    className={idx === activeLyricIdx ? 'active-line' : ''}
                                                    onClick={() => seek(line.time)}
                                                    title={`Seek to ${formatTime(line.time)}`}
                                                >
                                                    {line.text}
                                                </p>
                                            ))}
                                        </div>
                                                                ) : (
                                        <div className="np-lyrics-empty-state">
                                            <div className="np-lyrics-empty-icon">
                                                <PremiumMicrophoneIcon />
                                            </div>
                                            <h3>LYRICS COMING SOON</h3>
                                            <p className="np-lyrics-empty-text">
                                                Experience synchronized lyrics, karaoke mode, line-by-line highlighting and live lyric scrolling with future SurTaal updates.
                                            </p>
                                            <div className="premium-lyrics-info-card">
                                                <span className="premium-lyrics-badge">COMING SOON</span>
                                                <div className="premium-lyrics-features-list">
                                                    <div className="premium-lyrics-feature-item">
                                                        <MiniGoldSparkle />
                                                        <span>Real-time Lyrics</span>
                                                    </div>
                                                    <div className="premium-lyrics-feature-item">
                                                        <MiniGoldSparkle />
                                                        <span>Karaoke Mode</span>
                                                    </div>
                                                    <div className="premium-lyrics-feature-item">
                                                        <MiniGoldSparkle />
                                                        <span>Auto Sync</span>
                                                    </div>
                                                    <div className="premium-lyrics-feature-item">
                                                        <MiniGoldSparkle />
                                                        <span>Multi-language</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NowPlayingView;
