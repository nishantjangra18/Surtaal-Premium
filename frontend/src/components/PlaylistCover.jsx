import React, { useMemo, useState, useEffect } from 'react';

/**
 * PlaylistCover - Auto-generates playlist covers using 2x2 grid of song artwork
 * Similar to Spotify/YouTube Music behavior
 * 
 * Desktop: Shows 2x2 collage for multiple songs
 * Mobile: Shows first song cover only (classic behavior)
 * 
 * Priority:
 * 1. Custom uploaded cover (if provided and is a data URL or uploaded image)
 * 2. Auto-generated collage from first 4 songs (DESKTOP ONLY)
 * 3. First song cover (MOBILE)
 * 4. Default SurTaal artwork
 */
const PlaylistCover = ({ 
    customCover, 
    songs = [], 
    playlistName = 'Playlist',
    className = '',
    alt = '',
    size = 'medium', // 'small', 'medium', 'large'
    onClick
}) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const coverData = useMemo(() => {
        // Check if customCover is a real user upload (data URL or uploaded file path)
        // If it's just a song cover path (starts with /Covers/ or http), ignore it
        const isUserUpload = customCover && (
            customCover.startsWith('data:') || 
            customCover.startsWith('blob:') ||
            (!customCover.startsWith('/Covers/') && !customCover.includes('scdn.co'))
        );

        // Priority 1: Custom uploaded cover (only if it's a real user upload)
        if (isUserUpload) {
            return {
                type: 'custom',
                src: customCover
            };
        }

        const songCount = songs.length;

        // Priority 3: No songs - default cover
        if (songCount === 0) {
            return {
                type: 'default',
                src: '/add.png'
            };
        }

        // MOBILE: Always show first song cover (no collage)
        if (isMobile) {
            return {
                type: 'single',
                src: songs[0].cover || '/Covers/dhun.jpg'
            };
        }

        // DESKTOP: Single song - use its cover
        if (songCount === 1) {
            return {
                type: 'single',
                src: songs[0].cover || '/Covers/dhun.jpg'
            };
        }

        // DESKTOP: Multiple songs - generate collage
        const covers = songs.slice(0, 4).map(s => s.cover || '/Covers/dhun.jpg');
        
        return {
            type: 'collage',
            covers,
            songCount
        };
    }, [customCover, songs, isMobile]);

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = '/Covers/dhun.jpg';
    };

    // Simple cover (custom, single song, or default)
    if (coverData.type !== 'collage') {
        return (
            <img 
                src={coverData.src}
                alt={alt || playlistName}
                className={`playlist-cover ${className}`}
                onError={handleImageError}
                onClick={onClick}
            />
        );
    }

    // Collage cover
    const { covers, songCount } = coverData;

    // Determine grid layout
    let gridCovers = [];
    
    if (songCount >= 4) {
        // 4+ songs: Use first 4
        gridCovers = covers.slice(0, 4);
    } else if (songCount === 3) {
        // 3 songs: Use 3 covers + gradient placeholder
        gridCovers = [
            ...covers,
            { isPlaceholder: true }
        ];
    } else if (songCount === 2) {
        // 2 songs: Duplicate them for aesthetic balance
        gridCovers = [covers[0], covers[1], covers[0], covers[1]];
    }

    return (
        <div 
            className={`playlist-cover-collage ${className} playlist-cover-collage-${size}`}
            onClick={onClick}
        >
            {gridCovers.map((cover, index) => (
                cover.isPlaceholder ? (
                    <div 
                        key={`placeholder-${index}`}
                        className="playlist-cover-tile playlist-cover-placeholder"
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                    </div>
                ) : (
                    <img
                        key={`cover-${index}`}
                        src={cover}
                        alt=""
                        className="playlist-cover-tile"
                        onError={handleImageError}
                    />
                )
            ))}
        </div>
    );
};

export default PlaylistCover;
