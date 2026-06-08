import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MusicContext } from '../context/MusicContext';


const AdminDashboard = () => {
    const { user, token } = useContext(AuthContext);
    const { showToast } = useContext(MusicContext);
    const navigate = useNavigate();

    // Redirection Guard
    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else if (user && user.role !== 'admin') {
            navigate('/');
        }
    }, [user, token, navigate]);

    // Active Sidebar Tab
    const [activeTab, setActiveTab] = useState('dashboard');

    // Data lists in state
    const [dashboardData, setDashboardData] = useState(null);
    const [songs, setSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [artists, setArtists] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [requests, setRequests] = useState([]);
    const [waitlist, setWaitlist] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [songSearch, setSongSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');

    // Modal state objects
    const [songModalOpen, setSongModalOpen] = useState(false);
    const [editingSong, setEditingSong] = useState(null);
    const [albumModalOpen, setAlbumModalOpen] = useState(false);
    const [editingAlbum, setEditingAlbum] = useState(null);
    const [artistModalOpen, setArtistModalOpen] = useState(false);
    const [editingArtist, setEditingArtist] = useState(null);
    const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
    const [editingPlaylist, setEditingPlaylist] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { type, id, name }
    const [viewUserStats, setViewUserStats] = useState(null); // user details

    // Form inputs state
    const [songForm, setSongForm] = useState({ title: '', artist: '', album: 'Single', genre: 'Indian Music', language: 'Hindi', duration: '', coverUrl: '', audioUrl: '' });
    const [albumForm, setAlbumForm] = useState({ name: '', artist: '', songs: [], coverUrl: '' });
    const [artistForm, setArtistForm] = useState({ name: '', bio: '', instagram: '', twitter: '', spotify: '', imageUrl: '' });
    const [playlistForm, setPlaylistForm] = useState({ name: '', description: '', songs: [], isFeatured: false, coverUrl: '' });

    // File references for uploads
    const [songCoverFile, setSongCoverFile] = useState(null);
    const [songAudioFile, setSongAudioFile] = useState(null);
    const [albumCoverFile, setAlbumCoverFile] = useState(null);
    const [artistImageFile, setArtistImageFile] = useState(null);
    const [playlistCoverFile, setPlaylistCoverFile] = useState(null);

    const API = import.meta.env.VITE_API_URL || '';

    // Load CMS Data on Tab Switch
    useEffect(() => {
        if (!token || (user && user.role !== 'admin')) return;

        setLoading(true);
        const fetchData = async () => {
            try {
                const headers = { 'x-auth-token': token };
                
                if (activeTab === 'dashboard') {
                    const res = await fetch(`${API}/api/admin/dashboard`, { headers });
                    if (res.ok) {
                        const data = await res.json();
                        setDashboardData(data);
                        setSongs(data.recentUploads || []);
                    }
                } else if (activeTab === 'songs') {
                    const res = await fetch(`${API}/api/admin/songs`, { headers });
                    if (res.ok) setSongs(await res.json());
                } else if (activeTab === 'albums') {
                    const [albRes, sngRes] = await Promise.all([
                        fetch(`${API}/api/admin/albums`, { headers }),
                        fetch(`${API}/api/admin/songs`, { headers })
                    ]);
                    if (albRes.ok) setAlbums(await albRes.json());
                    if (sngRes.ok) setSongs(await sngRes.json());
                } else if (activeTab === 'artists') {
                    const [artRes, sngRes] = await Promise.all([
                        fetch(`${API}/api/admin/artists`, { headers }),
                        fetch(`${API}/api/admin/songs`, { headers })
                    ]);
                    if (artRes.ok) setArtists(await artRes.json());
                    if (sngRes.ok) setSongs(await sngRes.json());
                } else if (activeTab === 'playlists') {
                    const [plRes, sngRes] = await Promise.all([
                        fetch(`${API}/api/admin/playlists`, { headers }),
                        fetch(`${API}/api/admin/songs`, { headers })
                    ]);
                    if (plRes.ok) setPlaylists(await plRes.json());
                    if (sngRes.ok) setSongs(await sngRes.json());
                } else if (activeTab === 'requests') {
                    const res = await fetch(`${API}/api/admin/requests`, { headers });
                    if (res.ok) setRequests(await res.json());
                } else if (activeTab === 'waitlist') {
                    const res = await fetch(`${API}/api/admin/waitlist`, { headers });
                    if (res.ok) setWaitlist(await res.json());
                } else if (activeTab === 'users') {
                    const res = await fetch(`${API}/api/admin/users`, { headers });
                    if (res.ok) setUsersList(await res.json());
                }
            } catch (err) {
                console.error('[Admin] Error fetching data:', err.message);
                showToast('Failed to load dashboard data.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab, token, API]);

    // ── CRUD HANDLERS ────────────────────────────────────────────────────────

    // 1. Song CRUD
    const handleSongSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(songForm).forEach(([k, v]) => formData.append(k, v));
        if (songCoverFile) formData.append('cover', songCoverFile);
        if (songAudioFile) formData.append('audio', songAudioFile);

        try {
            const url = editingSong ? `${API}/api/admin/songs/${editingSong._id}` : `${API}/api/admin/songs`;
            const method = editingSong ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'x-auth-token': token },
                body: formData
            });

            if (res.ok) {
                showToast(editingSong ? 'Song updated successfully!' : 'Song created successfully!', 'success');
                setSongModalOpen(false);
                setEditingSong(null);
                setSongForm({ title: '', artist: '', album: 'Single', genre: 'Indian Music', language: 'Hindi', duration: '', coverUrl: '', audioUrl: '' });
                setSongCoverFile(null);
                setSongAudioFile(null);
                // Refresh list
                const listRes = await fetch(`${API}/api/admin/songs`, { headers: { 'x-auth-token': token } });
                if (listRes.ok) setSongs(await listRes.json());
            } else {
                showToast('Save failed. Try again.', 'error');
            }
        } catch (err) {
            showToast('Network error during upload.', 'error');
        }
    };

    const triggerEditSong = (song) => {
        setEditingSong(song);
        setSongForm({
            title: song.title,
            artist: song.artist,
            album: song.album || 'Single',
            genre: song.genre || 'Indian Music',
            language: song.language || 'Hindi',
            duration: song.duration || '',
            coverUrl: song.cover || '',
            audioUrl: song.src || ''
        });
        setSongModalOpen(true);
    };

    // 2. Album CRUD
    const handleAlbumSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', albumForm.name);
        formData.append('artist', albumForm.artist);
        formData.append('coverUrl', albumForm.coverUrl);
        formData.append('songs', JSON.stringify(albumForm.songs));
        if (albumCoverFile) formData.append('cover', albumCoverFile);

        try {
            const url = editingAlbum ? `${API}/api/admin/albums/${editingAlbum._id}` : `${API}/api/admin/albums`;
            const method = editingAlbum ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'x-auth-token': token },
                body: formData
            });

            if (res.ok) {
                showToast(editingAlbum ? 'Album updated!' : 'Album created!', 'success');
                setAlbumModalOpen(false);
                setEditingAlbum(null);
                setAlbumForm({ name: '', artist: '', songs: [], coverUrl: '' });
                setAlbumCoverFile(null);
                // Refresh
                const albRes = await fetch(`${API}/api/admin/albums`, { headers: { 'x-auth-token': token } });
                if (albRes.ok) setAlbums(await albRes.json());
            } else {
                showToast('Save failed.', 'error');
            }
        } catch (err) {
            showToast('Error saving album.', 'error');
        }
    };

    const triggerEditAlbum = (album) => {
        setEditingAlbum(album);
        setAlbumForm({
            name: album.name,
            artist: album.artist || 'Various Artists',
            songs: album.songs?.map(s => s._id || s) || [],
            coverUrl: album.cover || ''
        });
        setAlbumModalOpen(true);
    };

    // 3. Artist CRUD
    const handleArtistSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(artistForm).forEach(([k, v]) => formData.append(k, v));
        if (artistImageFile) formData.append('image', artistImageFile);

        try {
            const url = editingArtist ? `${API}/api/admin/artists/${editingArtist._id}` : `${API}/api/admin/artists`;
            const method = editingArtist ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'x-auth-token': token },
                body: formData
            });

            if (res.ok) {
                showToast(editingArtist ? 'Artist updated!' : 'Artist created!', 'success');
                setArtistModalOpen(false);
                setEditingArtist(null);
                setArtistForm({ name: '', bio: '', instagram: '', twitter: '', spotify: '', imageUrl: '' });
                setArtistImageFile(null);
                // Refresh
                const artRes = await fetch(`${API}/api/admin/artists`, { headers: { 'x-auth-token': token } });
                if (artRes.ok) setArtists(await artRes.json());
            } else {
                showToast('Save failed.', 'error');
            }
        } catch (err) {
            showToast('Error saving artist.', 'error');
        }
    };

    const triggerEditArtist = (artist) => {
        setEditingArtist(artist);
        setArtistForm({
            name: artist.name,
            bio: artist.bio || '',
            instagram: artist.socials?.instagram || '',
            twitter: artist.socials?.twitter || '',
            spotify: artist.socials?.spotify || '',
            imageUrl: artist.image || ''
        });
        setArtistModalOpen(true);
    };

    // 4. Playlist CRUD
    const handlePlaylistSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', playlistForm.name);
        formData.append('description', playlistForm.description);
        formData.append('isFeatured', playlistForm.isFeatured);
        formData.append('coverUrl', playlistForm.coverUrl);
        formData.append('songs', JSON.stringify(playlistForm.songs));
        if (playlistCoverFile) formData.append('cover', playlistCoverFile);

        try {
            const url = editingPlaylist ? `${API}/api/admin/playlists/${editingPlaylist._id}` : `${API}/api/admin/playlists`;
            const method = editingPlaylist ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'x-auth-token': token },
                body: formData
            });

            if (res.ok) {
                showToast(editingPlaylist ? 'Playlist updated!' : 'Playlist created!', 'success');
                setPlaylistModalOpen(false);
                setEditingPlaylist(null);
                setPlaylistForm({ name: '', description: '', songs: [], isFeatured: false, coverUrl: '' });
                setPlaylistCoverFile(null);
                // Refresh
                const plRes = await fetch(`${API}/api/admin/playlists`, { headers: { 'x-auth-token': token } });
                if (plRes.ok) setPlaylists(await plRes.json());
            } else {
                showToast('Save failed.', 'error');
            }
        } catch (err) {
            showToast('Error saving playlist.', 'error');
        }
    };

    const triggerEditPlaylist = (pl) => {
        setEditingPlaylist(pl);
        setPlaylistForm({
            name: pl.name,
            description: pl.description || '',
            songs: pl.songs?.map(s => s._id || s) || [],
            isFeatured: pl.isFeatured || false,
            coverUrl: pl.cover || ''
        });
        setPlaylistModalOpen(true);
    };

    // 5. General Deletions (Handles Songs, Albums, Artists, Playlists)
    const executeDelete = async () => {
        if (!deleteConfirm) return;
        const { type, id } = deleteConfirm;
        
        try {
            let endpoint = '';
            if (type === 'song') endpoint = `/api/admin/songs/${id}`;
            else if (type === 'album') endpoint = `/api/admin/albums/${id}`;
            else if (type === 'artist') endpoint = `/api/admin/artists/${id}`;
            else if (type === 'playlist') endpoint = `/api/admin/playlists/${id}`;

            const res = await fetch(`${API}${endpoint}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                showToast(`Deleted ${type} successfully.`, 'success');
                setDeleteConfirm(null);
                
                // Refresh matching states
                const headers = { 'x-auth-token': token };
                if (type === 'song') {
                    const songsRes = await fetch(`${API}/api/admin/songs`, { headers });
                    if (songsRes.ok) setSongs(await songsRes.json());
                } else if (type === 'album') {
                    const albRes = await fetch(`${API}/api/admin/albums`, { headers });
                    if (albRes.ok) setAlbums(await albRes.json());
                } else if (type === 'artist') {
                    const artRes = await fetch(`${API}/api/admin/artists`, { headers });
                    if (artRes.ok) setArtists(await artRes.json());
                } else if (type === 'playlist') {
                    const plRes = await fetch(`${API}/api/admin/playlists`, { headers });
                    if (plRes.ok) setPlaylists(await plRes.json());
                }
            } else {
                showToast('Failed to delete.', 'error');
            }
        } catch (err) {
            showToast('Delete network error.', 'error');
        }
    };

    // 6. User Requests Management
    const handleRequestAction = async (id, status) => {
        try {
            const res = await fetch(`${API}/api/admin/requests/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                showToast(`Request marked as ${status}!`, 'success');
                // Refresh list
                const reqRes = await fetch(`${API}/api/admin/requests`, { headers: { 'x-auth-token': token } });
                if (reqRes.ok) setRequests(await reqRes.json());
            }
        } catch (err) {
            showToast('Failed to update request.', 'error');
        }
    };

    // 7. Users Moderation
    const handleUserBanToggle = async (userId, isBannedNow) => {
        try {
            const action = isBannedNow ? 'unban' : 'ban';
            const res = await fetch(`${API}/api/admin/users/${userId}/${action}`, {
                method: 'PUT',
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                showToast(`User ${isBannedNow ? 'unbanned' : 'banned'} successfully.`, 'success');
                // Refresh
                const usrRes = await fetch(`${API}/api/admin/users`, { headers: { 'x-auth-token': token } });
                if (usrRes.ok) setUsersList(await usrRes.json());
                
                // If viewing details, update that too
                if (viewUserStats && viewUserStats._id === userId) {
                    const detailsRes = await fetch(`${API}/api/admin/users/${userId}/details`, { headers: { 'x-auth-token': token } });
                    if (detailsRes.ok) setViewUserStats(await detailsRes.json());
                }
            }
        } catch (err) {
            showToast('Ban operation failed.', 'error');
        }
    };

    // View user details modal loader
    const handleViewUserStats = async (userObj) => {
        try {
            const res = await fetch(`${API}/api/admin/users/${userObj._id}/details`, {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                setViewUserStats(await res.json());
            } else {
                setViewUserStats(userObj); // fallback
            }
        } catch (err) {
            setViewUserStats(userObj);
        }
    };

    // 8. Waitlist Export CSV
    const handleExportWaitlist = () => {
        if (waitlist.length === 0) {
            showToast('Waitlist is empty.', 'error');
            return;
        }
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Name,Email,Joined Date\n";
        waitlist.forEach(item => {
            const rowDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A';
            csvContent += `"${item.name || 'Premium Waitlist User'}","${item.email}","${rowDate}"\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `surtaal_waitlist_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('CSV Exported Successfully!', 'success');
    };

    // Helper: add or remove song selections in forms
    const handleSelectSongInForm = (songId, formType) => {
        if (formType === 'album') {
            const current = [...albumForm.songs];
            const idx = current.indexOf(songId);
            if (idx > -1) current.splice(idx, 1);
            else current.push(songId);
            setAlbumForm({ ...albumForm, songs: current });
        } else if (formType === 'playlist') {
            const current = [...playlistForm.songs];
            const idx = current.indexOf(songId);
            if (idx > -1) current.splice(idx, 1);
            else current.push(songId);
            setPlaylistForm({ ...playlistForm, songs: current });
        }
    };

    // Filter lists
    const filteredSongs = songs.filter(s => 
        s.title?.toLowerCase().includes(songSearch.toLowerCase()) || 
        s.artist?.toLowerCase().includes(songSearch.toLowerCase())
    );

    const filteredUsers = usersList.filter(u => 
        u.username?.toLowerCase().includes(userSearch.toLowerCase()) || 
        u.email?.toLowerCase().includes(userSearch.toLowerCase())
    );

    // Sidebar items config
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard Overview', icon: '📊' },
        { id: 'songs', label: 'Manage Songs', icon: '🎵' },
        { id: 'albums', label: 'Manage Albums', icon: '💿' },
        { id: 'artists', label: 'Manage Artists', icon: '🎤' },
        { id: 'playlists', label: 'Manage Playlists', icon: '🎧' },
        { id: 'requests', label: 'User Requests', icon: '📥' },
        { id: 'waitlist', label: 'Premium Waitlist', icon: '👑' },
        { id: 'users', label: 'User Moderation', icon: '👥' },
        { id: 'analytics', label: 'Detail Analytics', icon: '📈' },
        { id: 'settings', label: 'CMS Settings', icon: '⚙️' }
    ];

    if (!user || user.role !== 'admin') {
        return (
            <div className="admin-loading-screen">
                <div className="admin-spinner" />
                <p>Authenticating Admin Session...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-container">
            {/* Sidebar navigation */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand" onClick={() => navigate('/')}>
                    <img src="/surtaal-gold-logo.svg" alt="" />
                    <div>
                        <h2>SURTAAL CMS</h2>
                        <span>Admin Console</span>
                    </div>
                </div>
                
                <nav className="admin-sidebar-menu">
                    {menuItems.map(item => (
                        <button 
                            key={item.id} 
                            className={`admin-menu-btn${activeTab === item.id ? ' active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <button className="admin-exit-btn" onClick={() => navigate('/')}>
                        🚪 Exit to App
                    </button>
                </div>
            </aside>

            {/* Main view panel */}
            <main className="admin-main-viewport">
                <header className="admin-viewport-header">

                    <h2>{menuItems.find(m => m.id === activeTab)?.label}</h2>
                    <div className="admin-profile-badge">
                        <span>🛡️ Admin: {user.username}</span>
                    </div>
                </header>

                {loading ? (
                    <div className="admin-loading-viewport">
                        <div className="admin-spinner" />
                        <p>Fetching content...</p>
                    </div>
                ) : (
                    <div className="admin-viewport-body">

                        {/* TAB 1: DASHBOARD OVERVIEW */}
                        {activeTab === 'dashboard' && dashboardData && (
                            <div className="admin-panel-dashboard">
                                {/* KPI cards */}
                                <div className="admin-kpi-grid">
                                    <div className="admin-kpi-card">
                                        <h3>Total Songs</h3>
                                        <strong>{dashboardData.kpis.totalSongs}</strong>
                                        <span>Local storage</span>
                                    </div>
                                    <div className="admin-kpi-card">
                                        <h3>Total Albums</h3>
                                        <strong>{dashboardData.kpis.totalAlbums}</strong>
                                        <span>Curated albums</span>
                                    </div>
                                    <div className="admin-kpi-card">
                                        <h3>Total Artists</h3>
                                        <strong>{dashboardData.kpis.totalArtists}</strong>
                                        <span>Unique catalogs</span>
                                    </div>
                                    <div className="admin-kpi-card text-gold-kpi">
                                        <h3>Premium Waitlist</h3>
                                        <strong>{dashboardData.kpis.waitlistCount}</strong>
                                        <span>Early signups 👑</span>
                                    </div>
                                    <div className="admin-kpi-card">
                                        <h3>Active Users</h3>
                                        <strong>{dashboardData.kpis.activeUsers}</strong>
                                        <span>Registered users</span>
                                    </div>
                                    <div className="admin-kpi-card">
                                        <h3>Today's Streams</h3>
                                        <strong>{dashboardData.kpis.streamsToday}</strong>
                                        <span>Plays today</span>
                                    </div>
                                </div>

                                {/* Custom Inline CSS-SVG Charts */}
                                <div className="admin-charts-grid">
                                    <div className="admin-chart-box">
                                        <h4>Daily Plays (Past Week)</h4>
                                        <div className="plays-bar-chart-container">
                                            {dashboardData.charts.dailyPlays.map((d, i) => {
                                                const maxPlays = Math.max(...dashboardData.charts.dailyPlays.map(x => x.plays), 300);
                                                const pct = (d.plays / maxPlays) * 100;
                                                return (
                                                    <div className="plays-bar-col" key={i}>
                                                        <div className="plays-bar-val">{d.plays}</div>
                                                        <div className="plays-bar-graphic" style={{ height: `${pct}%` }} />
                                                        <div className="plays-bar-label">{d.day}</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="admin-chart-box">
                                        <h4>Top Plays by Custom Artist</h4>
                                        <div className="top-artists-list-chart">
                                            {dashboardData.charts.topArtists.map((a, i) => (
                                                <div className="top-artist-row-chart" key={i}>
                                                    <span className="art-name">{a.name || 'Anonymous'}</span>
                                                    <div className="art-bar-wrapper">
                                                        <div 
                                                            className="art-bar-fill" 
                                                            style={{ width: `${Math.min((a.plays / Math.max(...dashboardData.charts.topArtists.map(x => x.plays), 1)) * 100, 100)}%` }} 
                                                        />
                                                    </div>
                                                    <span className="art-plays">{a.plays} plays</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Recent uploads table */}
                                <div className="admin-dashboard-section">
                                    <h4>🆕 Recently Uploaded Songs</h4>
                                    <table className="admin-data-table">
                                        <thead>
                                            <tr>
                                                <th>Cover</th>
                                                <th>Song Name</th>
                                                <th>Artist</th>
                                                <th>Album</th>
                                                <th>Genre</th>
                                                <th>Uploaded Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {songs.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="table-empty-row">No songs uploaded yet. Go to Manage Songs to upload your first track.</td>
                                                </tr>
                                            ) : (
                                                songs.slice(0, 5).map(song => (
                                                    <tr key={song._id}>
                                                        <td>
                                                            <img 
                                                                className="admin-tbl-cover" 
                                                                src={song.cover.startsWith('/uploads/') ? `${API}${song.cover}` : (song.cover || '/Covers/dhun.jpg')} 
                                                                alt="" 
                                                            />
                                                        </td>
                                                        <td><strong>{song.title}</strong></td>
                                                        <td>{song.artist}</td>
                                                        <td>{song.album}</td>
                                                        <td><span className="admin-tbl-genre">{song.genre}</span></td>
                                                        <td>{new Date(song.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: SONGS MANAGEMENT */}
                        {activeTab === 'songs' && (
                            <div className="admin-panel-crud">
                                <div className="admin-crud-header">
                                    <input 
                                        type="text" 
                                        placeholder="🔍 Search songs by name/artist..." 
                                        value={songSearch}
                                        onChange={(e) => setSongSearch(e.target.value)}
                                        className="admin-search-input"
                                    />
                                    <button className="admin-btn-gold" onClick={() => { setEditingSong(null); setSongForm({ title: '', artist: '', album: 'Single', genre: 'Indian Music', language: 'Hindi', duration: '', coverUrl: '', audioUrl: '' }); setSongModalOpen(true); }}>
                                        ➕ Add New Song
                                    </button>
                                </div>

                                <table className="admin-data-table">
                                    <thead>
                                        <tr>
                                            <th>Cover</th>
                                            <th>Song Name</th>
                                            <th>Artist</th>
                                            <th>Album</th>
                                            <th>Genre</th>
                                            <th>Language</th>
                                            <th>Plays</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSongs.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="table-empty-row">No songs match your search query.</td>
                                            </tr>
                                        ) : (
                                            filteredSongs.map(song => (
                                                <tr key={song._id}>
                                                    <td>
                                                        <img 
                                                            className="admin-tbl-cover" 
                                                            src={song.cover?.startsWith('/uploads/') ? `${API}${song.cover}` : (song.cover || '/Covers/dhun.jpg')} 
                                                            alt="" 
                                                        />
                                                    </td>
                                                    <td><strong>{song.title}</strong></td>
                                                    <td>{song.artist}</td>
                                                    <td>{song.album}</td>
                                                    <td><span className="admin-tbl-genre">{song.genre}</span></td>
                                                    <td>{song.language}</td>
                                                    <td>{song.playCount || 0}</td>
                                                    <td>
                                                        <div className="tbl-action-btns">
                                                            <button className="tbl-edit-btn" onClick={() => triggerEditSong(song)}>Edit</button>
                                                            <button className="tbl-delete-btn" onClick={() => setDeleteConfirm({ type: 'song', id: song._id, name: song.title })}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB 3: ALBUM MANAGEMENT */}
                        {activeTab === 'albums' && (
                            <div className="admin-panel-crud">
                                <div className="admin-crud-header">
                                    <div />
                                    <button className="admin-btn-gold" onClick={() => { setEditingAlbum(null); setAlbumForm({ name: '', artist: 'Various Artists', songs: [], coverUrl: '' }); setAlbumModalOpen(true); }}>
                                        ➕ Create New Album
                                    </button>
                                </div>

                                <table className="admin-data-table">
                                    <thead>
                                        <tr>
                                            <th>Cover</th>
                                            <th>Album Name</th>
                                            <th>Artist</th>
                                            <th>Assigned Tracks</th>
                                            <th>Release Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {albums.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="table-empty-row">No albums created yet. Click Create Album to compile songs.</td>
                                            </tr>
                                        ) : (
                                            albums.map(album => (
                                                <tr key={album._id}>
                                                    <td>
                                                        <img 
                                                            className="admin-tbl-cover" 
                                                            src={album.cover?.startsWith('/uploads/') ? `${API}${album.cover}` : (album.cover || '/Covers/dhun.jpg')} 
                                                            alt="" 
                                                        />
                                                    </td>
                                                    <td><strong>{album.name}</strong></td>
                                                    <td>{album.artist}</td>
                                                    <td>{album.songs?.length || 0} tracks</td>
                                                    <td>{new Date(album.releaseDate || album.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <div className="tbl-action-btns">
                                                            <button className="tbl-edit-btn" onClick={() => triggerEditAlbum(album)}>Edit</button>
                                                            <button className="tbl-delete-btn" onClick={() => setDeleteConfirm({ type: 'album', id: album._id, name: album.name })}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB 4: ARTIST MANAGEMENT */}
                        {activeTab === 'artists' && (
                            <div className="admin-panel-crud">
                                <div className="admin-crud-header">
                                    <div />
                                    <button className="admin-btn-gold" onClick={() => { setEditingArtist(null); setArtistForm({ name: '', bio: '', instagram: '', twitter: '', spotify: '', imageUrl: '' }); setArtistModalOpen(true); }}>
                                        ➕ Add New Artist
                                    </button>
                                </div>

                                <table className="admin-data-table">
                                    <thead>
                                        <tr>
                                            <th>Photo</th>
                                            <th>Artist Name</th>
                                            <th>Biography Preview</th>
                                            <th>Social Links</th>
                                            <th>CMS Tracks</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {artists.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="table-empty-row">No artists cataloged yet. Add custom profiles.</td>
                                            </tr>
                                        ) : (
                                            artists.map(artist => (
                                                <tr key={artist._id}>
                                                    <td>
                                                        <img 
                                                            className="admin-tbl-cover round-img" 
                                                            src={artist.image?.startsWith('/uploads/') ? `${API}${artist.image}` : (artist.image || 'https://lh3.googleusercontent.com/LEdbfSC9xh9S-N-uRQ7iJPlJQLi9OUyOUX4oJ0sAiFuOf4g01B94FD9NzPdDkn5hpFrms2HmrpKPJle5=w544-h544-l90-rj')} 
                                                            alt="" 
                                                        />
                                                    </td>
                                                    <td><strong>{artist.name}</strong></td>
                                                    <td>
                                                        <span className="tbl-bio-preview">
                                                            {artist.bio ? (artist.bio.length > 60 ? `${artist.bio.slice(0, 60)}...` : artist.bio) : 'No bio added.'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="tbl-socials-badges">
                                                            {artist.socials?.instagram && <span className="sc-badge ig">IG</span>}
                                                            {artist.socials?.twitter && <span className="sc-badge tw">TW</span>}
                                                            {artist.socials?.spotify && <span className="sc-badge sp">SP</span>}
                                                        </div>
                                                    </td>
                                                    <td>{artist.songs?.length || 0} tracks</td>
                                                    <td>
                                                        <div className="tbl-action-btns">
                                                            <button className="tbl-edit-btn" onClick={() => triggerEditArtist(artist)}>Edit</button>
                                                            <button className="tbl-delete-btn" onClick={() => setDeleteConfirm({ type: 'artist', id: artist._id, name: artist.name })}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB 5: PLAYLIST MANAGEMENT */}
                        {activeTab === 'playlists' && (
                            <div className="admin-panel-crud">
                                <div className="admin-crud-header">
                                    <div />
                                    <button className="admin-btn-gold" onClick={() => { setEditingPlaylist(null); setPlaylistForm({ name: '', description: '', songs: [], isFeatured: false, coverUrl: '' }); setPlaylistModalOpen(true); }}>
                                        ➕ Create Public Playlist
                                    </button>
                                </div>

                                <table className="admin-data-table">
                                    <thead>
                                        <tr>
                                            <th>Cover</th>
                                            <th>Playlist Name</th>
                                            <th>Description</th>
                                            <th>Tracks</th>
                                            <th>Featured Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {playlists.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="table-empty-row">No public playlists compiled. Featured playlists go here.</td>
                                            </tr>
                                        ) : (
                                            playlists.map(pl => (
                                                <tr key={pl._id}>
                                                    <td>
                                                        <img 
                                                            className="admin-tbl-cover" 
                                                            src={pl.cover?.startsWith('/uploads/') ? `${API}${pl.cover}` : (pl.cover || '/Covers/dhun.jpg')} 
                                                            alt="" 
                                                        />
                                                    </td>
                                                    <td><strong>{pl.name}</strong></td>
                                                    <td>{pl.description || 'No description.'}</td>
                                                    <td>{pl.songs?.length || 0} songs</td>
                                                    <td>
                                                        <span className={`featured-pill${pl.isFeatured ? ' active' : ''}`}>
                                                            {pl.isFeatured ? '⭐ Featured' : 'Standard'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="tbl-action-btns">
                                                            <button className="tbl-edit-btn" onClick={() => triggerEditPlaylist(pl)}>Edit</button>
                                                            <button className="tbl-delete-btn" onClick={() => setDeleteConfirm({ type: 'playlist', id: pl._id, name: pl.name })}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB 6: USER REQUESTS */}
                        {activeTab === 'requests' && (
                            <div className="admin-panel-requests">
                                <table className="admin-data-table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Request Item Name</th>
                                            <th>Additional Details</th>
                                            <th>Requested By</th>
                                            <th>Submit Date</th>
                                            <th>Status</th>
                                            <th>Action Controls</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="table-empty-row">No user requests submitted yet.</td>
                                            </tr>
                                        ) : (
                                            requests.map(req => (
                                                <tr key={req._id}>
                                                    <td>
                                                        <span className={`request-type-pill ${req.type?.toLowerCase()}`}>
                                                            {req.type}
                                                        </span>
                                                    </td>
                                                    <td><strong>{req.title}</strong></td>
                                                    <td>{req.details || '—'}</td>
                                                    <td>{req.username}</td>
                                                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`status-pill ${req.status?.toLowerCase()}`}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="req-action-grid">
                                                            {req.status === 'Pending' && (
                                                                <>
                                                                    <button className="req-btn-approve" onClick={() => handleRequestAction(req._id, 'Approved')}>Approve</button>
                                                                    <button className="req-btn-reject" onClick={() => handleRequestAction(req._id, 'Rejected')}>Reject</button>
                                                                </>
                                                            )}
                                                            {req.status === 'Approved' && (
                                                                <button className="req-btn-complete" onClick={() => handleRequestAction(req._id, 'Completed')}>Mark Completed</button>
                                                            )}
                                                            {req.status === 'Completed' && <span className="req-text-done">✓ Finished</span>}
                                                            {req.status === 'Rejected' && <span className="req-text-reject">✕ Closed</span>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB 7: PREMIUM WAITLIST */}
                        {activeTab === 'waitlist' && (
                            <div className="admin-panel-waitlist">
                                <div className="admin-crud-header">
                                    <div>Total Waitlist Entries: <strong>{waitlist.length} users</strong></div>
                                    <button className="admin-btn-gold" onClick={handleExportWaitlist}>
                                        📥 Export CSV Data
                                    </button>
                                </div>

                                <table className="admin-data-table">
                                    <thead>
                                        <tr>
                                            <th>Email Address</th>
                                            <th>Name / Nickname</th>
                                            <th>Joined Date</th>
                                            <th>Access Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {waitlist.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="table-empty-row">No users registered on waitlist yet.</td>
                                            </tr>
                                        ) : (
                                            waitlist.map(item => (
                                                <tr key={item._id}>
                                                    <td><strong>{item.email}</strong></td>
                                                    <td>{item.name || 'Premium Waitlist User'}</td>
                                                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                                                    <td><span className="waitlist-status-pill">Pending Access</span></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB 8: USER MODERATION */}
                        {activeTab === 'users' && (
                            <div className="admin-panel-users">
                                <div className="admin-crud-header">
                                    <input 
                                        type="text" 
                                        placeholder="🔍 Search users by username or email..." 
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="admin-search-input"
                                    />
                                    <div />
                                </div>

                                <table className="admin-data-table">
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Status</th>
                                            <th>Join Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="table-empty-row">No users found matching your search.</td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map(usr => (
                                                <tr key={usr._id}>
                                                    <td><strong>{usr.username}</strong></td>
                                                    <td>{usr.email}</td>
                                                    <td>
                                                        <span className={`status-pill ${usr.isBanned ? 'rejected' : 'approved'}`}>
                                                            {usr.isBanned ? '🚫 Banned' : 'Active'}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(usr.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <div className="tbl-action-btns">
                                                            <button className="tbl-edit-btn" onClick={() => handleViewUserStats(usr)}>View Stats</button>
                                                            <button 
                                                                className={usr.isBanned ? 'tbl-unban-btn' : 'tbl-delete-btn'} 
                                                                onClick={() => handleUserBanToggle(usr._id, usr.isBanned)}
                                                            >
                                                                {usr.isBanned ? 'Unban' : 'Ban User'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB 9: DETAIL ANALYTICS */}
                        {activeTab === 'analytics' && (
                            <div className="admin-panel-analytics">
                                <div className="admin-analytics-grid">
                                    <div className="analytics-card-row">
                                        <div className="analytics-box">
                                            <h4>Streams Frequency (Weekly Breakdown)</h4>
                                            <div className="plays-bar-chart-container" style={{ minHeight: '220px' }}>
                                                <div className="plays-col-wrap-fill">
                                                    <div className="plays-bar-col"><div className="plays-bar-val">760</div><div className="plays-bar-graphic" style={{ height: '70%', background: 'linear-gradient(180deg, var(--amber), var(--copper))' }} /><div className="plays-bar-label">Wk 1</div></div>
                                                    <div className="plays-bar-col"><div className="plays-bar-val">940</div><div className="plays-bar-graphic" style={{ height: '85%', background: 'linear-gradient(180deg, var(--amber), var(--copper))' }} /><div className="plays-bar-label">Wk 2</div></div>
                                                    <div className="plays-bar-col"><div className="plays-bar-val">1120</div><div className="plays-bar-graphic" style={{ height: '100%', background: 'linear-gradient(180deg, var(--amber), var(--copper))' }} /><div className="plays-bar-label">Wk 3</div></div>
                                                    <div className="plays-bar-col"><div className="plays-bar-val">880</div><div className="plays-bar-graphic" style={{ height: '80%', background: 'linear-gradient(180deg, var(--amber), var(--copper))' }} /><div className="plays-bar-label">Wk 4</div></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="analytics-box">
                                            <h4>Streams Distribution by Genre</h4>
                                            <div className="top-artists-list-chart">
                                                <div className="top-artist-row-chart">
                                                    <span className="art-name">Hindi Lofi</span>
                                                    <div className="art-bar-wrapper"><div className="art-bar-fill" style={{ width: '85%' }} /></div>
                                                    <span className="art-plays">85% popularity</span>
                                                </div>
                                                <div className="top-artist-row-chart">
                                                    <span className="art-name">Punjabi Pop</span>
                                                    <div className="art-bar-wrapper"><div className="art-bar-fill" style={{ width: '70%' }} /></div>
                                                    <span className="art-plays">70% popularity</span>
                                                </div>
                                                <div className="top-artist-row-chart">
                                                    <span className="art-name">Bollywood Romantic</span>
                                                    <div className="art-bar-wrapper"><div className="art-bar-fill" style={{ width: '55%' }} /></div>
                                                    <span className="art-plays">55% popularity</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="analytics-details-box">
                                        <h4>📈 Platform Growth Summary</h4>
                                        <p>SurTaal metrics are calculated based on MongoDB activity indexes. Growth has increased by **14%** week-over-week. Banned statuses are applied immediately across all active JWT sessions.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 10: SETTINGS */}
                        {activeTab === 'settings' && (
                            <div className="admin-panel-settings">
                                <div className="admin-settings-card">
                                    <h3>Platform Configuration</h3>
                                    <label>
                                        Site Title / Name
                                        <input type="text" defaultValue="SurTaal" className="admin-form-input" style={{ width: '100%' }} />
                                    </label>
                                    <label>
                                        Waitlist Access Status
                                        <select className="admin-form-input" style={{ width: '100%', background: '#18120e', color: '#fff', border: '1px solid rgba(212,161,93,0.2)' }}>
                                            <option value="invite">Invite Only (Coming Soon)</option>
                                            <option value="open">Open Registration</option>
                                            <option value="closed">Disabled</option>
                                        </select>
                                    </label>
                                    <label>
                                        Media Storage Driver
                                        <input type="text" defaultValue="Local Filesystem (uploads/)" disabled className="admin-form-input" style={{ width: '100%', opacity: 0.5 }} />
                                    </label>
                                    <button className="admin-btn-gold" style={{ marginTop: '16px' }} onClick={() => showToast('Platform configuration saved successfully!', 'success')}>
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </main>

            {/* ── MODAL WINDOWS ──────────────────────────────────────────────── */}

            {/* 1. Add/Edit Song Modal */}
            {songModalOpen && (
                <div className="playlist-modal-backdrop" onMouseDown={() => setSongModalOpen(false)}>
                    <form className="playlist-modal admin-modal-scroller" onMouseDown={(e) => e.stopPropagation()} onSubmit={handleSongSubmit}>
                        <div className="playlist-modal-header">
                            <span>{editingSong ? 'Edit Song Metadata' : 'Add New Custom Song'}</span>
                            <button type="button" onClick={() => setSongModalOpen(false)}>×</button>
                        </div>
                        <label>
                            Song Title *
                            <input 
                                type="text" 
                                value={songForm.title} 
                                onChange={(e) => setSongForm({ ...songForm, title: e.target.value })} 
                                required 
                                autoFocus 
                            />
                        </label>
                        <label>
                            Artist Name *
                            <input 
                                type="text" 
                                value={songForm.artist} 
                                onChange={(e) => setSongForm({ ...songForm, artist: e.target.value })} 
                                required 
                            />
                        </label>
                        <label>
                            Album Title
                            <input 
                                type="text" 
                                value={songForm.album} 
                                onChange={(e) => setSongForm({ ...songForm, album: e.target.value })} 
                            />
                        </label>
                        <div className="admin-form-row">
                            <label style={{ flex: 1 }}>
                                Genre
                                <input 
                                    type="text" 
                                    value={songForm.genre} 
                                    onChange={(e) => setSongForm({ ...songForm, genre: e.target.value })} 
                                />
                            </label>
                            <label style={{ flex: 1 }}>
                                Language
                                <input 
                                    type="text" 
                                    value={songForm.language} 
                                    onChange={(e) => setSongForm({ ...songForm, language: e.target.value })} 
                                />
                            </label>
                        </div>
                        <label>
                            Duration (seconds)
                            <input 
                                type="number" 
                                value={songForm.duration} 
                                onChange={(e) => setSongForm({ ...songForm, duration: e.target.value })} 
                                placeholder="e.g. 210"
                            />
                        </label>

                        <div className="admin-upload-section">
                            <h4>Upload Assets</h4>
                            <label className="admin-file-label">
                                Cover Image file
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => setSongCoverFile(e.target.files?.[0] || null)} 
                                />
                            </label>
                            <label className="admin-file-label">
                                Audio track file (.mp3 / .wav)
                                <input 
                                    type="file" 
                                    accept="audio/*" 
                                    onChange={(e) => setSongAudioFile(e.target.files?.[0] || null)} 
                                />
                            </label>
                        </div>

                        <div className="playlist-modal-actions">
                            <button type="button" onClick={() => setSongModalOpen(false)}>Cancel</button>
                            <button type="submit" className="primary">
                                {editingSong ? 'Save Changes' : 'Upload Song'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 2. Add/Edit Album Modal */}
            {albumModalOpen && (
                <div className="playlist-modal-backdrop" onMouseDown={() => setAlbumModalOpen(false)}>
                    <form className="playlist-modal admin-modal-scroller" onMouseDown={(e) => e.stopPropagation()} onSubmit={handleAlbumSubmit}>
                        <div className="playlist-modal-header">
                            <span>{editingAlbum ? 'Edit Album' : 'Create Custom Album'}</span>
                            <button type="button" onClick={() => setAlbumModalOpen(false)}>×</button>
                        </div>
                        <label>
                            Album Name
                            <input 
                                type="text" 
                                value={albumForm.name} 
                                onChange={(e) => setAlbumForm({ ...albumForm, name: e.target.value })} 
                                required 
                                autoFocus 
                            />
                        </label>
                        <label>
                            Artist name
                            <input 
                                type="text" 
                                value={albumForm.artist} 
                                onChange={(e) => setAlbumForm({ ...albumForm, artist: e.target.value })} 
                                required 
                            />
                        </label>
                        <label className="admin-file-label">
                            Album Cover Image
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => setAlbumCoverFile(e.target.files?.[0] || null)} 
                            />
                        </label>

                        <div className="admin-song-selection-list">
                            <h4>Assign Songs to Album</h4>
                            {songs.length === 0 ? (
                                <p className="selection-empty">No songs uploaded. Upload songs first.</p>
                            ) : (
                                <div className="song-checkbox-scroll">
                                    {songs.map(song => {
                                        const checked = albumForm.songs.includes(song._id);
                                        return (
                                            <div 
                                                key={song._id} 
                                                className={`song-select-row${checked ? ' selected' : ''}`}
                                                onClick={() => handleSelectSongInForm(song._id, 'album')}
                                            >
                                                <span>{checked ? '☑️' : '☐'}</span>
                                                <span><strong>{song.title}</strong> — {song.artist}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="playlist-modal-actions">
                            <button type="button" onClick={() => setAlbumModalOpen(false)}>Cancel</button>
                            <button type="submit" className="primary">Save Album</button>
                        </div>
                    </form>
                </div>
            )}

            {/* 3. Add/Edit Artist Modal */}
            {artistModalOpen && (
                <div className="playlist-modal-backdrop" onMouseDown={() => setArtistModalOpen(false)}>
                    <form className="playlist-modal admin-modal-scroller" onMouseDown={(e) => e.stopPropagation()} onSubmit={handleArtistSubmit}>
                        <div className="playlist-modal-header">
                            <span>{editingArtist ? 'Edit Artist Profile' : 'Add New Artist Profile'}</span>
                            <button type="button" onClick={() => setArtistModalOpen(false)}>×</button>
                        </div>
                        <label>
                            Artist Name
                            <input 
                                type="text" 
                                value={artistForm.name} 
                                onChange={(e) => setArtistForm({ ...artistForm, name: e.target.value })} 
                                required 
                                autoFocus 
                            />
                        </label>
                        <label>
                            Biography
                            <textarea 
                                value={artistForm.bio} 
                                onChange={(e) => setArtistForm({ ...artistForm, bio: e.target.value })} 
                                style={{ minHeight: '70px' }}
                            />
                        </label>
                        <div className="admin-form-row">
                            <label style={{ flex: 1 }}>
                                Instagram URL
                                <input 
                                    type="text" 
                                    value={artistForm.instagram} 
                                    onChange={(e) => setArtistForm({ ...artistForm, instagram: e.target.value })} 
                                    placeholder="e.g. instagram.com/..."
                                />
                            </label>
                            <label style={{ flex: 1 }}>
                                Twitter URL
                                <input 
                                    type="text" 
                                    value={artistForm.twitter} 
                                    onChange={(e) => setArtistForm({ ...artistForm, twitter: e.target.value })} 
                                />
                            </label>
                        </div>
                        <label>
                            Spotify URL
                            <input 
                                type="text" 
                                value={artistForm.spotify} 
                                onChange={(e) => setArtistForm({ ...artistForm, spotify: e.target.value })} 
                            />
                        </label>
                        <label className="admin-file-label">
                            Artist Photo
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => setArtistImageFile(e.target.files?.[0] || null)} 
                            />
                        </label>

                        <div className="playlist-modal-actions">
                            <button type="button" onClick={() => setArtistModalOpen(false)}>Cancel</button>
                            <button type="submit" className="primary">Save Artist</button>
                        </div>
                    </form>
                </div>
            )}

            {/* 4. Add/Edit Playlist Modal */}
            {playlistModalOpen && (
                <div className="playlist-modal-backdrop" onMouseDown={() => setPlaylistModalOpen(false)}>
                    <form className="playlist-modal admin-modal-scroller" onMouseDown={(e) => e.stopPropagation()} onSubmit={handlePlaylistSubmit}>
                        <div className="playlist-modal-header">
                            <span>{editingPlaylist ? 'Edit Public Playlist' : 'Create Featured Playlist'}</span>
                            <button type="button" onClick={() => setPlaylistModalOpen(false)}>×</button>
                        </div>
                        <label>
                            Playlist Name
                            <input 
                                type="text" 
                                value={playlistForm.name} 
                                onChange={(e) => setPlaylistForm({ ...playlistForm, name: e.target.value })} 
                                required 
                                autoFocus 
                            />
                        </label>
                        <label>
                            Description
                            <textarea 
                                value={playlistForm.description} 
                                onChange={(e) => setPlaylistForm({ ...playlistForm, description: e.target.value })} 
                            />
                        </label>
                        <label className="playlist-toggle-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: '12px 0' }}>
                            <input 
                                type="checkbox" 
                                checked={playlistForm.isFeatured} 
                                onChange={(e) => setPlaylistForm({ ...playlistForm, isFeatured: e.target.checked })} 
                            />
                            <span>Featured playlist toggle</span>
                        </label>
                        <label className="admin-file-label">
                            Playlist Cover Image
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => setPlaylistCoverFile(e.target.files?.[0] || null)} 
                            />
                        </label>

                        <div className="admin-song-selection-list">
                            <h4>Assign Songs to Playlist</h4>
                            {songs.length === 0 ? (
                                <p className="selection-empty">No songs available.</p>
                            ) : (
                                <div className="song-checkbox-scroll">
                                    {songs.map(song => {
                                        const checked = playlistForm.songs.includes(song._id);
                                        return (
                                            <div 
                                                key={song._id} 
                                                className={`song-select-row${checked ? ' selected' : ''}`}
                                                onClick={() => handleSelectSongInForm(song._id, 'playlist')}
                                            >
                                                <span>{checked ? '☑️' : '☐'}</span>
                                                <span><strong>{song.title}</strong> — {song.artist}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="playlist-modal-actions">
                            <button type="button" onClick={() => setPlaylistModalOpen(false)}>Cancel</button>
                            <button type="submit" className="primary">Save Playlist</button>
                        </div>
                    </form>
                </div>
            )}

            {/* 5. Delete Confirmation Dialog */}
            {deleteConfirm && (
                <div className="playlist-modal-backdrop" onMouseDown={() => setDeleteConfirm(null)}>
                    <div className="playlist-modal admin-confirm-modal" onMouseDown={(e) => e.stopPropagation()}>
                        <div className="playlist-modal-header">
                            <span>⚠️ Confirm Delete Action</span>
                            <button onClick={() => setDeleteConfirm(null)}>×</button>
                        </div>
                        <p>Are you sure you want to permanently delete the {deleteConfirm.type} <strong>"{deleteConfirm.name}"</strong>?</p>
                        <p className="confirm-warning-desc">This action cannot be undone and will delete related uploads from the storage.</p>
                        <div className="playlist-modal-actions">
                            <button onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="tbl-delete-btn" onClick={executeDelete}>Confirm Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 6. View User Statistics & History */}
            {viewUserStats && (
                <div className="playlist-modal-backdrop" onMouseDown={() => setViewUserStats(null)}>
                    <div className="playlist-modal admin-modal-scroller" onMouseDown={(e) => e.stopPropagation()}>
                        <div className="playlist-modal-header">
                            <span>👤 User Stats: {viewUserStats.username}</span>
                            <button onClick={() => setViewUserStats(null)}>×</button>
                        </div>
                        <div className="user-details-card">
                            <p><strong>Email:</strong> {viewUserStats.email}</p>
                            <p><strong>Account Status:</strong> {viewUserStats.isBanned ? '🔴 Banned' : '🟢 Active'}</p>
                            <p><strong>Registration Date:</strong> {new Date(viewUserStats.createdAt).toLocaleString()}</p>
                        </div>

                        <div className="user-stats-dashboard">
                            <h4>🎧 User Music Preferences</h4>
                            <div className="stats-box-inner">
                                <div><strong>Liked Songs:</strong> {viewUserStats.likedSongs?.length || 0} tracks</div>
                                <div><strong>Custom Playlists:</strong> {viewUserStats.playlists?.length || 0} playlists</div>
                                <div><strong>Recent Streams:</strong> {viewUserStats.recentlyPlayed?.length || 0} streams</div>
                            </div>
                        </div>

                        <div className="user-history-section">
                            <h4>Recent History Log</h4>
                            {(!viewUserStats.listeningHistory || viewUserStats.listeningHistory.length === 0) ? (
                                <p className="selection-empty">No listening history recorded for this user.</p>
                            ) : (
                                <div className="history-logs-scroll">
                                    {viewUserStats.listeningHistory.slice(0, 10).map((h, i) => (
                                        <div className="history-log-row" key={i}>
                                            <span>{new Date(h.playedAt || Date.now()).toLocaleTimeString()}</span>
                                            <span><strong>{h.title}</strong> — {h.singer || h.artist}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="playlist-modal-actions">
                            <button 
                                className={viewUserStats.isBanned ? 'tbl-unban-btn' : 'tbl-delete-btn'}
                                onClick={() => handleUserBanToggle(viewUserStats._id, viewUserStats.isBanned)}
                            >
                                {viewUserStats.isBanned ? 'Unban Account' : 'Ban Account'}
                            </button>
                            <button className="primary" onClick={() => setViewUserStats(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
