import React, { useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MusicContext } from '../context/MusicContext';
import HomeView from './HomeView';
import AlbumView from './AlbumView';
import SearchView from './SearchView';
import ArtistView from './ArtistView';
import CollectionView from './CollectionView';
import QueueView from './QueueView';
import HistoryView from './HistoryView';
import LibraryView from './LibraryView';
import PremiumView from './PremiumView';
import NowPlayingView from './NowPlayingView';
import RequestSongView from './RequestSongView';
import { EditProfilePage, ProfilePage, SettingsPage } from './ProfileViews';

const MainContent = () => {
    const { activeView, activeViewData } = useContext(MusicContext);
    const location = useLocation();
    const mainContentRef = useRef(null);

    // Scroll to top on mobile when navigating to detail views
    useEffect(() => {
        // Only on mobile (max-width: 768px)
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (!isMobile) return;

        // Detail views that should scroll to top
        const detailViews = [
            'playlist',
            'album',
            'artist',
            'mood',
            'language',
            'trending-collection',
            'queue',
            'history',
            'library',
            'search',
            'premium',
            'request-song',
            'profile',
            'edit-profile',
            'settings',
            'appearance',
            'account',
            'privacy',
            'notifications'
        ];

        if (detailViews.includes(activeView)) {
            // Scroll the main-content container to top
            if (mainContentRef.current) {
                mainContentRef.current.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'instant'
                });
            }

            // Also scroll window as fallback
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant'
            });
        }
    }, [activeView, activeViewData]);

    const renderView = () => {

        switch (activeView) {
            case 'home':
                return <HomeView />;
            case 'album':
            case 'playlist':
                return <AlbumView />;
            case 'artist':
                return <ArtistView />;
            case 'request-song':
                return <RequestSongView />;
            case 'mood':
            case 'language':
            case 'trending-collection':
                return <CollectionView />;
            case 'search':
                return <SearchView />;
            case 'queue':
                return <QueueView />;
            case 'history':
                return <HistoryView />;
            case 'library':
                return <LibraryView />;
            case 'premium':
                return <PremiumView />;
            case 'profile':
                return <ProfilePage />;
            case 'edit-profile':
                return <EditProfilePage />;
            case 'settings':
                return <SettingsPage panel="settings" />;
            case 'appearance':
                return <SettingsPage panel="appearance" />;
            case 'account':
                return <SettingsPage panel="account" />;
            case 'privacy':
                return <SettingsPage panel="privacy" />;
            case 'notifications':
                return <SettingsPage panel="notifications" />;
            default:
                return <HomeView />;
        }
    };

    return (
        <div className="main-content" ref={mainContentRef}>
            {renderView()}
        </div>
    );
};

export default MainContent;
