import React, { useContext } from 'react';
import { MusicContext } from '../context/MusicContext';

const QueueView = () => {
    const { currentSong, queue, removeFromQueue, clearQueue, currentPlaylist, currentSongIndex, currentPlaylistName, playSong } = useContext(MusicContext);

    const upcomingFromPlaylist = currentPlaylist.slice(currentSongIndex + 1);

    return (
        <div className="queue-view">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                <h2 className="queue-title" style={{ marginBottom: 0 }}>Queue</h2>
                {queue.length > 0 && (
                    <button onClick={clearQueue} style={{
                        background: 'transparent', color: 'var(--text-secondary)',
                        fontSize: '13px', fontWeight: '600',
                        transition: 'color 0.2s',
                        letterSpacing: '0.5px'
                    }}>
                        Clear queue
                    </button>
                )}
            </div>

            {/* Now Playing */}
            {currentSong && (
                <div className="queue-section">
                    <div className="queue-section-label">Now playing</div>
                    <div className="song-row active">
                        <div className="song-index">
                            <div className="equalizer">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                        <div className="song-main">
                            <img src={currentSong.cover} alt={currentSong.title} />
                            <span className="song-name">{currentSong.title}</span>
                        </div>
                        <span className="song-artist-col">{currentSong.singer}</span>
                        <span></span>
                    </div>
                </div>
            )}

            {/* Manual Queue */}
            {queue.length > 0 && (
                <div className="queue-section">
                    <div className="queue-section-label">Next in queue</div>
                    <div className="song-list">
                        {queue.map((song, idx) => (
                            <div key={idx} className="song-row" onClick={() => {
                                // Play from queue position
                                removeFromQueue(idx);
                                playSong([song], 0, song.title);
                            }}>
                                <div className="song-index">
                                    <span className="index-number">{idx + 1}</span>
                                    <span className="play-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                    </span>
                                </div>
                                <div className="song-main">
                                    <img src={song.cover} alt={song.title} />
                                    <span className="song-name">{song.title}</span>
                                </div>
                                <span className="song-artist-col">{song.singer}</span>
                                <button
                                    className="song-like-btn"
                                    style={{ opacity: 1 }}
                                    onClick={(e) => { e.stopPropagation(); removeFromQueue(idx); }}
                                    title="Remove from queue"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upcoming from playlist */}
            {upcomingFromPlaylist.length > 0 && (
                <div className="queue-section">
                    <div className="queue-section-label">
                        Next from: {currentPlaylistName || 'Current playlist'}
                    </div>
                    <div className="song-list">
                        {upcomingFromPlaylist.map((song, idx) => (
                            <div key={idx} className="song-row" onClick={() => playSong(currentPlaylist, currentSongIndex + 1 + idx, currentPlaylistName)}>
                                <div className="song-index">
                                    <span className="index-number">{idx + 1}</span>
                                    <span className="play-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                    </span>
                                </div>
                                <div className="song-main">
                                    <img src={song.cover} alt={song.title} />
                                    <span className="song-name">{song.title}</span>
                                </div>
                                <span className="song-artist-col">{song.singer}</span>
                                <span></span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {queue.length === 0 && upcomingFromPlaylist.length === 0 && !currentSong && (
                <p style={{ color: 'var(--text-dim)', fontSize: '16px', marginTop: '24px', fontFamily: 'var(--font-elegant)', fontStyle: 'italic' }}>
                    Your queue is empty. Add songs to see them here.
                </p>
            )}
        </div>
    );
};

export default QueueView;
