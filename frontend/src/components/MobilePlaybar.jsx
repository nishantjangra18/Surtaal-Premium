import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MusicContext } from '../context/MusicContext';

const MobilePlaybar = () => {
    const navigate = useNavigate();
    const { currentSong, isPlaying, togglePlay, playNext, playPrev, setIsNowPlayingExpanded } = useContext(MusicContext);
    const titleRef = useRef(null);
    const [shouldAnimate, setShouldAnimate] = useState(false);

    // Check if text overflows and needs marquee
    useEffect(() => {
        if (!titleRef.current || !currentSong) return;

        const checkOverflow = () => {
            const element = titleRef.current;
            if (element) {
                const isOverflowing = element.scrollWidth > element.clientWidth;
                setShouldAnimate(isOverflowing);
            }
        };

        // Check on mount and when song changes
        checkOverflow();

        // Recheck on resize
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [currentSong]);

    if (!currentSong) return null;

    const handlePrevious = (e) => {
        e.stopPropagation();
        playPrev();
    };

    const handlePlayPause = (e) => {
        e.stopPropagation();
        togglePlay();
    };

    const handleNext = (e) => {
        e.stopPropagation();
        playNext();
    };

    return (
        <div className="mobile-playbar" onClick={() => setIsNowPlayingExpanded(true)}>
            <img src={currentSong.cover} alt={currentSong.title} className="mp-cover" />
            <div className="mp-info">
                <div className="mp-title" ref={titleRef}>
                    {shouldAnimate ? (
                        <span className="mp-title-text mp-marquee">
                            <span>{currentSong.title}</span>
                            <span className="mp-title-separator"> • </span>
                            <span>{currentSong.title}</span>
                            <span className="mp-title-separator"> • </span>
                        </span>
                    ) : (
                        <span className="mp-title-text">{currentSong.title}</span>
                    )}
                </div>
                <div className="mp-artist">{currentSong.singer}</div>
            </div>
            <div className="mp-controls">
                <button 
                    className="mp-btn mp-prev-btn" 
                    onClick={handlePrevious}
                    aria-label="Previous track"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                    </svg>
                </button>
                <button 
                    className="mp-btn mp-play-btn" 
                    onClick={handlePlayPause}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    )}
                </button>
                <button 
                    className="mp-btn mp-next-btn" 
                    onClick={handleNext}
                    aria-label="Next track"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default MobilePlaybar;
