import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const tokenHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'x-auth-token': token } : null;
};

const request = async (config) => {
    const headers = tokenHeaders();
    if (!headers) {
        console.error('[SurTaal userLibraryService] No auth token found');
        return null;
    }
    try {
        const response = await axios({ baseURL: API_BASE_URL, ...config, headers: { ...headers, ...(config.headers || {}) } });
        return response.data;
    } catch (error) {
        console.error('[SurTaal userLibraryService] Request failed:', {
            url: config.url,
            method: config.method,
            error: error.response?.data || error.message
        });
        throw error;
    }
};

export const userLibraryService = {
    getLikedSongs:           () => request({ method: 'GET', url: '/api/songs/liked' }),
    toggleLike:              (song) => request({ method: 'POST', url: '/api/songs/like', data: { song } }),
    getPlaylists:            () => request({ method: 'GET', url: '/api/songs/playlists' }),
    createPlaylist:          (playlist) => request({ method: 'POST', url: '/api/songs/playlists', data: playlist }),
    updatePlaylist:          (id, updates) => request({ method: 'PATCH', url: `/api/songs/playlists/${id}`, data: updates }),
    deletePlaylist:          (id) => request({ method: 'DELETE', url: `/api/songs/playlists/${id}` }),
    addSongToPlaylist:       (id, song) => request({ method: 'POST', url: `/api/songs/playlists/${id}/songs`, data: { song } }),
    removeSongFromPlaylist:  (id, songId) => request({ method: 'DELETE', url: `/api/songs/playlists/${id}/songs/${encodeURIComponent(songId)}` }),
    saveHistory:             (song) => request({ method: 'POST', url: '/api/songs/history', data: { song } }),
    getHistory:              () => request({ method: 'GET', url: '/api/songs/history' }),
    getStats:                () => request({ method: 'GET', url: '/api/songs/stats' }),
};
