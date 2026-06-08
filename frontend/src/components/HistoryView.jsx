import React, { useContext } from 'react';
import { MusicContext } from '../context/MusicContext';
import { AuthContext } from '../context/AuthContext';

const formatDate = (date) => date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
const formatTime = (date) => date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

const groupLabel = (date) => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfItem  = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((startOfToday - startOfItem) / 86400000);
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return 'Last Week';
    return 'Last Month';
};

const HistoryRow = ({ cover, title, subtitle, date, time, onClick }) => (
    <div className="history-row" onClick={onClick}>
        <img src={cover} alt={title} />
        <div className="history-copy">
            <span className="history-title">{title}</span>
            <span className="history-subtitle">{subtitle}</span>
        </div>
        <span className="history-time">{date} - {time}</span>
    </div>
);

const HistoryGroup = ({ title, children }) => (
    <section className="history-group">
        <h2>{title}</h2>
        <div className="history-list">{children}</div>
    </section>
);

const uniqueBy = (items, keyFn) => {
    const seen = new Set();
    return items.filter(item => {
        const key = keyFn(item);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const HistoryView = () => {
    const { user, requireLogin } = useContext(AuthContext);
    const { listeningHistory, recentlyPlayed, customPlaylists, playSong, navigateTo } = useContext(MusicContext);

    // ── Auth gate ─────────────────────────────────────────────────────────────
    if (!user) {
        return (
            <div className="history-view">
                <div className="history-hero">
                    <span className="history-kicker">Listening Timeline</span>
                    <h1>History</h1>
                </div>
                <div className="history-login-gate">
                    <h2>Your history awaits</h2>
                    <p>Login to see every song you've played, organised by time.</p>
                    <button
                        className="history-login-btn"
                        onClick={() => requireLogin({ message: 'Login to see your listening history.' })}
                    >
                        Login to See History
                    </button>
                </div>
            </div>
        );
    }

    const songs = (listeningHistory.length ? listeningHistory : recentlyPlayed).slice(0, 80);

    const groupedSongs = songs.reduce((groups, song, index) => {
        const playedAt = song.playedAt ? new Date(song.playedAt) : new Date();
        const group = groupLabel(playedAt);
        return { ...groups, [group]: [...(groups[group] || []), { song, playedAt, index }] };
    }, {});

    const recentAlbums    = uniqueBy(songs, s => s.album).slice(0, 8);
    const recentPlaylists = customPlaylists.filter(p => p.songs?.length).slice(0, 8);

    return (
        <div className="history-view">
            <div className="history-hero">
                <span className="history-kicker">Listening Timeline</span>
                <h1>History</h1>
                <p>Revisit songs, albums, and playlists from your recent sessions.</p>
            </div>

            {songs.length === 0 && (
                <p style={{ color: 'var(--text-dim)', padding: '24px 0' }}>
                    Your listening history will appear here after you play a track.
                </p>
            )}

            {Object.entries(groupedSongs).map(([group, items]) => (
                <HistoryGroup key={group} title={group}>
                    {items.map(({ song, playedAt, index }, idx) => (
                        <HistoryRow
                            key={`${group}-${song.id || song.src || song.title}-${idx}`}
                            cover={song.cover}
                            title={song.title}
                            subtitle={song.singer || song.artist}
                            date={formatDate(playedAt)}
                            time={formatTime(playedAt)}
                            onClick={() => playSong(songs, index, 'History')}
                        />
                    ))}
                </HistoryGroup>
            ))}

            {recentAlbums.length > 0 && (
                <HistoryGroup title="Recently Played Albums">
                    {recentAlbums.map((song) => (
                        <HistoryRow
                            key={song.album}
                            cover={song.cover}
                            title={song.album}
                            subtitle={song.singer || song.artist}
                            date={song.playedAt ? formatDate(new Date(song.playedAt)) : 'Recent'}
                            time="Album"
                            onClick={() => navigateTo('search', { query: song.album })}
                        />
                    ))}
                </HistoryGroup>
            )}

            {recentPlaylists.length > 0 && (
                <HistoryGroup title="Recently Played Playlists">
                    {recentPlaylists.map((playlist) => (
                        <HistoryRow
                            key={playlist.id}
                            cover={playlist.cover || playlist.songs?.[0]?.cover}
                            title={playlist.name}
                            subtitle={`${playlist.songs.length} songs`}
                            date="Your Library"
                            time="Playlist"
                            onClick={() => navigateTo('album', { name: playlist.name, ...playlist, type: 'Playlist', isCustom: true })}
                        />
                    ))}
                </HistoryGroup>
            )}
        </div>
    );
};

export default HistoryView;
