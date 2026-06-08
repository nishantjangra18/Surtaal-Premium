import React, { useContext, useState } from 'react';
import { MusicContext } from '../context/MusicContext';
import { AuthContext } from '../context/AuthContext';

const readImageFile = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsDataURL(file);
};

const PlaylistModals = () => {
    const { user, token } = useContext(AuthContext);
    const {
        customPlaylists, createPlaylistOpen, playlistPickerSong,
        setCreatePlaylistOpen, setPlaylistPickerSong,
        createPlaylist, addSongToPlaylist,
        requestModalOpen, setRequestModalOpen, showToast
    } = useContext(MusicContext);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [cover, setCover] = useState('');
    const [fileName, setFileName] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = React.useRef(null);

    const handleFileChange = (file) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            showToast('File size must be under 5MB', 'error');
            return;
        }
        setFileName(file.name);
        readImageFile(file, setCover);
    };

    const [pickerCreateOpen, setPickerCreateOpen] = useState(false);
    const [pickerName, setPickerName] = useState('');

    // Request fields state
    const [requestType, setRequestType] = useState('Song');
    const [requestTitle, setRequestTitle] = useState('');
    const [requestDetails, setRequestDetails] = useState('');
    const [requestSubmitting, setRequestSubmitting] = useState(false);

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        if (!requestTitle.trim()) {
            showToast('Please specify the title/name of your request.', 'error');
            return;
        }
        setRequestSubmitting(true);
        try {
            const API = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${API}/api/admin/requests/submit`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    type: requestType,
                    title: requestTitle.trim(),
                    details: requestDetails.trim(),
                    username: user?.username || 'Anonymous'
                })
            });

            if (response.ok) {
                showToast('✓ Request submitted successfully!', 'success');
                setRequestTitle('');
                setRequestDetails('');
                setRequestModalOpen(false);
            } else {
                const data = await response.json();
                showToast(data.message || 'Submission failed.', 'error');
            }
        } catch (err) {
            showToast('Network error submitting request.', 'error');
        } finally {
            setRequestSubmitting(false);
        }
    };


    const resetCreateForm = () => {
        setName('');
        setDescription('');
        setCover('');
        setFileName('');
    };

    const handleCreate = () => {
        const playlist = createPlaylist({ name, description, cover });
        if (playlist) {
            resetCreateForm();
            setCreatePlaylistOpen(false);
        }
    };

    const handleCreateAndAdd = () => {
        const playlist = createPlaylist({
            name: pickerName,
            songs: playlistPickerSong ? [playlistPickerSong] : [],
            cover: playlistPickerSong?.cover || '',
        });
        if (playlist) {
            setPickerName('');
            setPickerCreateOpen(false);
            setPlaylistPickerSong(null);
        }
    };

    const closePicker = () => {
        setPlaylistPickerSong(null);
        setPickerCreateOpen(false);
        setPickerName('');
    };

    return (
        <>
            {createPlaylistOpen && (
                <div className="playlist-modal-backdrop" onMouseDown={() => setCreatePlaylistOpen(false)}>
                    <div className="playlist-modal" onMouseDown={(e) => e.stopPropagation()}>
                        <div className="playlist-modal-header">
                            <span>Create Playlist</span>
                            <button onClick={() => setCreatePlaylistOpen(false)}>×</button>
                        </div>
                        <label>Playlist Name<input value={name} onChange={(e) => setName(e.target.value)} autoFocus /></label>
                        <label>Description <small>Optional</small><textarea value={description} onChange={(e) => setDescription(e.target.value)} /></label>
                        <div className="playlist-cover-upload-section">
                            <span className="playlist-upload-label">Cover Image <small>Optional</small></span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileChange(e.target.files?.[0])}
                            />
                            {!cover ? (
                                <div
                                    className={`st-cover-upload-card ${isDragOver ? 'drag-over' : ''}`}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDragOver(true);
                                    }}
                                    onDragLeave={() => setIsDragOver(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDragOver(false);
                                        if (e.dataTransfer.files?.[0]) {
                                            handleFileChange(e.dataTransfer.files[0]);
                                        }
                                    }}
                                >
                                    <div className="st-upload-placeholder">
                                        <div className="st-upload-icon" aria-hidden="true">
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                                <circle cx="12" cy="13" r="4"/>
                                            </svg>
                                        </div>
                                        <span className="st-upload-title">Upload Cover Image</span>
                                        <span className="st-upload-subtitle">PNG, JPG up to 5MB</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="st-cover-preview-card">
                                    <img className="st-cover-preview-thumbnail" src={cover} alt="Cover Preview" />
                                    <div className="st-cover-preview-details">
                                        <span className="st-cover-filename" title={fileName}>{fileName || 'Cover Image'}</span>
                                        <div className="st-cover-preview-actions">
                                            <button type="button" className="st-cover-btn-change" onClick={() => fileInputRef.current?.click()}>Change Cover</button>
                                            <button type="button" className="st-cover-btn-remove" onClick={() => { setCover(''); setFileName(''); }}>Remove</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="playlist-modal-actions">
                            <button onClick={() => setCreatePlaylistOpen(false)}>Cancel</button>
                            <button className="primary" onClick={handleCreate}>Create Playlist</button>
                        </div>
                    </div>
                </div>
            )}

            {playlistPickerSong && (
                <div className="playlist-modal-backdrop" onMouseDown={closePicker}>
                    <div className="playlist-modal playlist-picker-modal" onMouseDown={(e) => e.stopPropagation()}>
                        <div className="playlist-modal-header">
                            <span>Add to Playlist</span>
                            <button onClick={closePicker}>×</button>
                        </div>
                        <div className="picker-song-preview">
                            <img src={playlistPickerSong.cover} alt={playlistPickerSong.title} />
                            <div>
                                <strong>{playlistPickerSong.title}</strong>
                                <span>{playlistPickerSong.singer}</span>
                            </div>
                        </div>
                        <div className="playlist-picker-list">
                            <button onClick={() => { addSongToPlaylist('liked', playlistPickerSong); closePicker(); }}>
                                <span className="picker-liked-icon">✓</span>
                                <div><strong>Liked Songs</strong><span>Default collection</span></div>
                            </button>
                            {customPlaylists.length > 0 && <p className="picker-group-label">Recently Used Playlists</p>}
                            {customPlaylists.map((playlist) => (
                                <button key={playlist.id} onClick={() => { addSongToPlaylist(playlist.id, playlistPickerSong); closePicker(); }}>
                                    {playlist.cover ? <img src={playlist.cover} alt={playlist.name} /> : <span className="picker-cover-fallback">♫</span>}
                                    <div><strong>{playlist.name}</strong><span>{playlist.songs.length} songs</span></div>
                                </button>
                            ))}
                            {customPlaylists.length === 0 && !pickerCreateOpen && (
                                <button className="picker-create-fallback-btn" onClick={() => setPickerCreateOpen(true)}>
                                    <span className="picker-cover-fallback">+</span>
                                    <div><strong>Create New Playlist</strong><span>No playlists exist yet. Tap to create one!</span></div>
                                </button>
                            )}
                        </div>
                        {pickerCreateOpen ? (
                            <div className="picker-create-inline">
                                <input value={pickerName} onChange={(e) => setPickerName(e.target.value)} placeholder="New playlist name" autoFocus />
                                <button className="primary" onClick={handleCreateAndAdd}>Create & Add</button>
                            </div>
                        ) : (
                            <button className="create-inline-trigger" onClick={() => setPickerCreateOpen(true)}>Create New Playlist</button>
                        )}
                    </div>
                </div>
            )}

            {requestModalOpen && (
                <div className="playlist-modal-backdrop" onMouseDown={() => setRequestModalOpen(false)}>
                    <form className="playlist-modal" onMouseDown={(e) => e.stopPropagation()} onSubmit={handleRequestSubmit}>
                        <div className="playlist-modal-header">
                            <span>Request Music / Feature</span>
                            <button type="button" onClick={() => setRequestModalOpen(false)}>×</button>
                        </div>
                        <label>
                            Request Type
                            <select value={requestType} onChange={(e) => setRequestType(e.target.value)} style={{ background: '#1c1612', color: '#fff', border: '1px solid rgba(212,161,93,0.3)', padding: '10px', borderRadius: '8px', width: '100%', outline: 'none' }}>
                                <option value="Song">Song</option>
                                <option value="Artist">Artist</option>
                                <option value="Album">Album</option>
                                <option value="Feature">Feature Request</option>
                            </select>
                        </label>
                        <label>
                            Title / Name
                            <input 
                                value={requestTitle} 
                                onChange={(e) => setRequestTitle(e.target.value)} 
                                placeholder="Song title, artist name, feature description..."
                                required 
                                autoFocus 
                            />
                        </label>
                        <label>
                            Details <small>Optional</small>
                            <textarea 
                                value={requestDetails} 
                                onChange={(e) => setRequestDetails(e.target.value)} 
                                placeholder="Provide extra details (artist names, links, feature specs...)"
                                style={{ minHeight: '80px' }}
                            />
                        </label>
                        <div className="playlist-modal-actions">
                            <button type="button" onClick={() => setRequestModalOpen(false)}>Cancel</button>
                            <button type="submit" className="primary" disabled={requestSubmitting}>
                                {requestSubmitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default PlaylistModals;
