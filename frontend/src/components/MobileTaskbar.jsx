import React, { useContext } from 'react';
import { MusicContext } from '../context/MusicContext';

const MobileTaskbar = () => {
    const { activeView, navigateTo } = useContext(MusicContext);

    const tabs = [
        {
            id: 'home',
            label: 'Home',
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        },
        {
            id: 'search',
            label: 'Search',
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        },
        {
            id: 'library',
            label: 'Library',
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v15H6.5A2.5 2.5 0 0 1 4 16.5v-10ZM6.5 6a.5.5 0 0 0 0 1H18V6H6.5ZM6 16.5a.5.5 0 0 0 .5.5H18V9H6.5c-.17 0-.34-.02-.5-.05v7.55Z"/></svg>
        },
        {
            id: 'premium',
            label: 'Premium',
            icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="m12 3 2.5 5.4 5.9.7-4.35 4 1.15 5.8L12 16l-5.2 2.9 1.15-5.8-4.35-4 5.9-.7L12 3Z"/></svg>
        },
    ];

    return (
        <div className="mobile-taskbar">
            {tabs.map(tab => (
                <div
                    key={tab.id}
                    className={`tab ${activeView === tab.id ? 'active' : ''}`}
                    onClick={() => {
                        if (tab.id === 'search') {
                            navigateTo('search', { query: '' });
                        } else {
                            navigateTo(tab.id);
                        }
                    }}
                >
                    {tab.icon}
                    <span>{tab.label}</span>
                </div>
            ))}
        </div>
    );
};

export default MobileTaskbar;
