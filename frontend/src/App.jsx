import React, { useContext, useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import { AuthContext } from './context/AuthContext';
import { MusicContext } from './context/MusicContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';
import Playbar from './components/Playbar';
import MobilePlaybar from './components/MobilePlaybar';
import MobileTaskbar from './components/MobileTaskbar';
import MobileHeader from './components/MobileHeader';
import AuthPage from './pages/AuthPage';
import Toast from './components/Toast';
import PlaylistModals from './components/PlaylistModals';
import LoginModal from './components/LoginModal';
import AdminDashboard from './components/AdminDashboard';
import NowPlayingView from './components/NowPlayingView';


/**
 * PendingActionHandler
 *
 * After a successful login via LoginModal, replay the interrupted action.
 * The key insight: we call the *internal* playback functions directly so we
 * bypass the `!user` auth-gate (the user has just logged in; we don't need
 * to re-check). We use `playDirectly` — an internal context function that
 * skips the auth guard.
 */
const PendingActionHandler = () => {
    const { pendingAction, setPendingAction }         = useContext(AuthContext);
    const {
        playDirectly, playSpotifyDirectly,
        setCreatePlaylistOpen, toggleLike, setRequestModalOpen,
    } = useContext(MusicContext);

    const handleLoginSuccess = useCallback(() => {
        if (!pendingAction) return;
        const { type, payload } = pendingAction;
        setPendingAction(null);

        // Delay slightly so AuthContext user state fully propagates to MusicContext
        setTimeout(() => {
            if (type === 'playSong' && payload) {
                playDirectly(payload.playlist, payload.index, payload.playlistName);
            } else if (type === 'playSpotifySong' && payload) {
                playSpotifyDirectly(payload.song, payload.playlistName, payload.playlist, payload.index);
            } else if (type === 'createPlaylist') {
                setCreatePlaylistOpen(true);
            } else if (type === 'toggleLike' && payload?.song) {
                toggleLike(payload.song);
            } else if (type === 'openRequestModal') {
                setRequestModalOpen(true);
            }
        }, 150);
    }, [pendingAction, setPendingAction, playDirectly, playSpotifyDirectly, setCreatePlaylistOpen, toggleLike, setRequestModalOpen]);


    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
};

const useIsMobile = () => {
    const getIsMobile = () => typeof window !== 'undefined'
        && window.matchMedia('(max-width: 767px)').matches;
    const [isMobile, setIsMobile] = useState(getIsMobile);

    useEffect(() => {
        const media = window.matchMedia('(max-width: 767px)');
        const handleChange = () => setIsMobile(media.matches);
        handleChange();
        media.addEventListener?.('change', handleChange);
        return () => media.removeEventListener?.('change', handleChange);
    }, []);

    return isMobile;
};

const HomeLayout = () => {
    const { user } = useContext(AuthContext);
    const { activeView, navigateBack, viewHistory, isNowPlayingExpanded } = useContext(MusicContext);
    const isMobile = useIsMobile();
    const location = useLocation();
    const navigate = useNavigate();
    const isNowPlaying = location.pathname === '/now-playing';

    // Redirect /now-playing to / to prevent black reload screen
    useEffect(() => {
        if (location.pathname === '/now-playing') {
            navigate('/', { replace: true });
        }
    }, [location.pathname, navigate]);

    if (!user && isMobile) {
        return <AuthPage />;
    }

    const allowedViews = ['playlist', 'album', 'artist', 'mood', 'language', 'trending-collection'];
    // Don't show floating back button on now playing page
    const showFloatingBack = (allowedViews.includes(activeView) && viewHistory.length > 0) && !isNowPlaying && !(isMobile && isNowPlayingExpanded);

    const handleBackClick = () => {
        if (isNowPlaying) {
            navigate(-1);
        } else {
            navigateBack();
        }
    };

    return (
        <div className={`App ${isNowPlaying ? 'now-playing-active' : ''} ${showFloatingBack && !isNowPlaying ? 'has-floating-back' : ''}`}>
            {showFloatingBack && (
                <button 
                    className="surtaal-floating-back-btn" 
                    onClick={handleBackClick} 
                    aria-label="Go Back"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
            )}
            <div className="app-shell">
                <Sidebar />
                <div className="app-body">
                    {!isNowPlaying && <MobileHeader />}
                    {!isNowPlaying && <Navbar />}
                    <div className="content-wrapper">
                        <MainContent />
                        {!isNowPlaying && <RightSidebar />}
                    </div>
                </div>
            </div>
            {!isNowPlaying && <Playbar />}
            {!isNowPlaying && !['profile', 'edit-profile', 'settings', 'appearance', 'account', 'privacy', 'notifications'].includes(activeView) && !(isMobile && isNowPlayingExpanded) && <MobilePlaybar />}
            {!isNowPlaying && !(isMobile && isNowPlayingExpanded) && <MobileTaskbar />}
            <PlaylistModals />
            <Toast />
            <PendingActionHandler />
            {isNowPlayingExpanded && <NowPlayingView />}
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <MusicProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/*"     element={<HomeLayout />} />
                    </Routes>
                </Router>
            </MusicProvider>
        </AuthProvider>
    );
}

export default App;
