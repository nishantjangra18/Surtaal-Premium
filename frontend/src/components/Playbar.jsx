import React, { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MusicContext } from '../context/MusicContext';
import MarqueeText from './MarqueeText';

// SVG Icons
const PlayIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const PrevIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>;
const NextIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>;

const ShuffleIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>;
const RepeatIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>;
const RepeatOneIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/></svg>;

const HeartIcon = ({ filled }) => filled ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>
);

const QueueIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/></svg>;
const LyricsIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h16v2H4V5zm0 4h12v2H4V9zm0 4h16v2H4v-2zm0 4h10v2H4v-2z"/></svg>;
const PlusIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>;

const VolumeHighIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>;
const VolumeMuteIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>;
const VolumeLowIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>;
const ExpandIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>;

// Generate waveform bars
const generateBars = () => Array.from({ length: 40 }, () => 3 + Math.random() * 18);

const Playbar = () => {
    const navigate = useNavigate();
    const {
        currentSong, isPlaying, progress, currentTime, duration, volume, isMuted,
        shuffleMode, repeatMode,
        togglePlay, playNext, playPrev, seek, setVolume, toggleMute,
        toggleShuffle, toggleRepeat, toggleLike, isLiked,
        navigateTo, setPlaylistPickerSong,
        isNowPlayingExpanded, setIsNowPlayingExpanded
    } = useContext(MusicContext);

    const waveformBars = useMemo(() => generateBars(), []);

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00';
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const effectiveVolume = isMuted ? 0 : volume;
    const VolumeIcon = isMuted || effectiveVolume === 0 ? VolumeMuteIcon
        : effectiveVolume < 0.5 ? VolumeLowIcon : VolumeHighIcon;

    if (!currentSong) {
        return (
            <div className="playbar">
                <div className="playbar-left"></div>
                <div className="playbar-center">
                    <div className="playbar-controls">
                        <button className="ctrl-btn" disabled><ShuffleIcon /></button>
                        <button className="ctrl-btn" disabled><PrevIcon /></button>
                        <button className="play-pause-btn" disabled><PlayIcon /></button>
                        <button className="ctrl-btn" disabled><NextIcon /></button>
                        <button className="ctrl-btn" disabled><RepeatIcon /></button>
                    </div>
                    <div className="playbar-seek">
                        <span className="time-label">0:00</span>
                        <input type="range" className="slider seek-slider" value={0} max={100} disabled
                            style={{ background: 'var(--bg-highlight)' }} />
                        <span className="time-label">0:00</span>
                    </div>
                </div>
                <div className="playbar-right">
                    <div className="volume-wrapper">
                        <button className="right-btn"><VolumeHighIcon /></button>
                        <input type="range" className="slider volume-slider" value={70} max={100} disabled
                            style={{ background: 'var(--bg-highlight)' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="playbar">
            {/* Left — Song info */}
            <div className="playbar-left">
                <img src={currentSong.cover} alt={currentSong.title} className="pb-cover"
                    onClick={() => setIsNowPlayingExpanded(true)} />
                <div className="pb-info" onClick={() => setIsNowPlayingExpanded(true)} style={{ cursor: 'pointer' }}>
                    <MarqueeText text={currentSong.title} className="pb-title" speed={20} />
                    <MarqueeText text={currentSong.singer} className="pb-artist" speed={25} />
                </div>
                <button className={`pb-like-btn ${isLiked(currentSong) ? 'liked' : ''}`}
                    onClick={() => toggleLike(currentSong)}
                    title={isLiked(currentSong) ? 'Remove from Liked Songs' : 'Save to Liked Songs'}>
                    <HeartIcon filled={isLiked(currentSong)} />
                </button>
                <button className="pb-add-btn" onClick={() => setPlaylistPickerSong(currentSong)} title="Add to Playlist">
                    <PlusIcon />
                </button>
            </div>

            {/* Center — Controls + Waveform */}
            <div className="playbar-center">
                <div className="playbar-controls-row">
                    <div className="playbar-controls">
                        <button className={`ctrl-btn ${shuffleMode ? 'active' : ''}`}
                            onClick={toggleShuffle} title="Shuffle"><ShuffleIcon /></button>
                        <button className="ctrl-btn" onClick={playPrev} title="Previous"><PrevIcon /></button>
                        <button className="play-pause-btn" onClick={togglePlay}
                            title={isPlaying ? 'Pause' : 'Play'}>
                            {isPlaying ? <PauseIcon /> : <PlayIcon />}
                        </button>
                        <button className="ctrl-btn" onClick={playNext} title="Next"><NextIcon /></button>
                        <button className={`ctrl-btn ${repeatMode !== 'off' ? 'active' : ''}`}
                            onClick={toggleRepeat} title={`Repeat: ${repeatMode}`}>
                            {repeatMode === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
                        </button>
                    </div>

                    {/* Waveform Visualization */}
                    <div className="waveform-container" aria-hidden="true">
                        {waveformBars.map((height, i) => {
                            const barProgress = (i / waveformBars.length) * 100;
                            const isPast = barProgress < (progress || 0);
                            return (
                                <div key={i} className={`waveform-bar ${isPlaying ? 'animate' : ''}`}
                                    style={{
                                        height: `${isPlaying ? height : height * 0.5}px`,
                                        background: isPast ? 'var(--amber)' : 'rgba(212,161,93,0.2)',
                                        animationDelay: `${i * 0.03}s`
                                    }} />
                            );
                        })}
                    </div>
                </div>

                <div className="playbar-seek">
                    <span className="time-label">{formatTime(currentTime)}</span>
                    <input type="range" className="slider seek-slider"
                        value={progress || 0} max={100}
                        onChange={(e) => seek((e.target.value / 100) * duration)}
                        style={{
                            background: `linear-gradient(to right, var(--amber) ${progress || 0}%, var(--bg-highlight) ${progress || 0}%)`
                        }} />
                    <span className="time-label">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Right — Queue + Volume */}
            <div className="playbar-right">
                <button className="right-btn" onClick={() => navigateTo('queue')} title="Queue">
                    <QueueIcon />
                </button>
                <button className="right-btn" title="Lyrics">
                    <LyricsIcon />
                </button>
                <div className="volume-wrapper">
                    <button className="right-btn" onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
                        <VolumeIcon />
                    </button>
                    <input type="range" className="slider volume-slider"
                        value={effectiveVolume * 100} max={100}
                        onChange={(e) => setVolume(e.target.value / 100)}
                        style={{
                            background: `linear-gradient(to right, var(--amber) ${effectiveVolume * 100}%, var(--bg-highlight) ${effectiveVolume * 100}%)`
                        }} />
                </div>
                <button className="right-btn" title="Expand" onClick={() => setIsNowPlayingExpanded(true)}><ExpandIcon /></button>
            </div>
        </div>
    );
};

export default Playbar;
