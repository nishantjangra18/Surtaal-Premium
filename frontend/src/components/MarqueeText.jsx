import React, { useRef, useState, useEffect } from 'react';

/**
 * MarqueeText - Smooth infinite scrolling text component
 * Only animates when text overflows its container
 * Spotify-style seamless marquee animation
 */
const MarqueeText = ({ text, className = '', onClick, speed = 15 }) => {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [shouldScroll, setShouldScroll] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        const textEl = textRef.current;
        if (!container || !textEl) return;

        const checkOverflow = () => {
            // Check if text width exceeds container width
            const overflow = textEl.scrollWidth > container.clientWidth;
            setShouldScroll(overflow);
        };

        // Check on mount and text change
        checkOverflow();

        // Re-check on window resize
        const resizeObserver = new ResizeObserver(() => {
            checkOverflow();
        });
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, [text]);

    if (shouldScroll) {
        return (
            <div 
                ref={containerRef} 
                className={`marquee-container ${className}`} 
                onClick={onClick}
                style={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    width: '100%',
                    position: 'relative'
                }}
            >
                <div 
                    className="marquee-track"
                    style={{
                        display: 'inline-flex',
                        gap: '80px',
                        animation: `marquee-scroll ${speed}s linear infinite`,
                        willChange: 'transform'
                    }}
                >
                    <span ref={textRef} className="marquee-text-item">{text}</span>
                    <span className="marquee-text-item" aria-hidden="true">{text}</span>
                </div>
            </div>
        );
    }

    // Text doesn't overflow - show static text
    return (
        <div 
            ref={containerRef} 
            className={`no-marquee-container ${className}`} 
            onClick={onClick}
            style={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                width: '100%'
            }}
        >
            <span ref={textRef}>{text}</span>
        </div>
    );
};

export default MarqueeText;
