import React, { useContext, useState } from 'react';
import { MusicContext } from '../context/MusicContext';
import { AuthContext } from '../context/AuthContext';


const RequestSongView = () => {
    const { user, token } = useContext(AuthContext);
    const { showToast, navigateBack } = useContext(MusicContext);

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
                // Smooth back transition after success
                setTimeout(() => {
                    navigateBack();
                }, 800);
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

    return (
        <div className="request-song-view-container detail-view">

            
            <div className="request-song-card">
                <div className="request-song-card-header">
                    <h2>Request Music / Feature 📥</h2>
                    <p>Suggest new tracks, artists, albums, or premium features you'd like to see on SurTaal.</p>
                </div>

                <form className="request-song-form" onSubmit={handleRequestSubmit}>
                    <label>
                        Request Type
                        <select value={requestType} onChange={(e) => setRequestType(e.target.value)}>
                            <option value="Song">Song</option>
                            <option value="Artist">Artist</option>
                            <option value="Album">Album</option>
                            <option value="Feature">Feature Request</option>
                        </select>
                    </label>

                    <label>
                        Title / Name
                        <input 
                            type="text"
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
                        />
                    </label>

                    <div className="request-song-form-actions">
                        <button type="submit" disabled={requestSubmitting}>
                            {requestSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestSongView;
