import React, { useContext, useMemo, useRef, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MusicContext } from '../context/MusicContext';
import { GeneratedAvatar, profileName, useProfileSettings } from './ProfileViews';

const splitArtists = (name = '') => name
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

const MobileHeader = () => {
    const { user } = useContext(AuthContext);
    const { navigateTo, activeView, viewHistory } = useContext(MusicContext);
    const [profile] = useProfileSettings();

    const isDrillDownView = ['playlist', 'album', 'artist', 'mood', 'language', 'trending-collection'].includes(activeView);
    const showBackButton = isDrillDownView && viewHistory && viewHistory.length > 0;

    return (
        <header className="mobile-app-header">
            {!showBackButton ? (
                <button className="mobile-brand" onClick={() => navigateTo('home')} aria-label="Go home">
                    <img src="/surtaal-gold-logo.svg" alt="" />
                    <span>
                        <strong>SURTAAL</strong>
                        <small>Suron Ka Safar</small>
                    </span>
                </button>
            ) : (
                <div style={{ width: '44px', height: '44px' }} /> // Spacer to balance layout and maintain profile button on the right
            )}
            <button className="mobile-avatar-button" onClick={() => navigateTo('profile')} aria-label="Open profile">
                <GeneratedAvatar user={user} profile={profile} size="small" />
            </button>
        </header>
    );
};

export default MobileHeader;
