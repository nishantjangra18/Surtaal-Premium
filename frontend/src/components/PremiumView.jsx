import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MusicContext } from '../context/MusicContext';


const SoundwaveIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5v14M22 9v6M7 8v8M2 10v4" />
    </svg>
);

const DownloadIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
);

const PlaylistIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
);

const SparklesIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" />
    </svg>
);

const BarChartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const MicIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" />
    </svg>
);

const SpeakerOffIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
);

const CrownIcon = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-icon">
        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill="currentColor"/>
        <path d="M5 20h14"/>
    </svg>
);

const HeadphonesIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide-icon">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
        <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
    </svg>
);

const CloudDownloadIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide-icon">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
);

const SparklesIconMobile = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-icon">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" fill="currentColor"/>
    </svg>
);

const ZapIconMobile = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-icon">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor"/>
    </svg>
);

const ArrowRightIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide-icon">
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
    </svg>
);

const FlameIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-icon">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
    </svg>
);

const PremiumView = () => {
    const navigate = useNavigate();
    const { showToast } = useContext(MusicContext);
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 767);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/');
        }
    };

    const handleWaitlistSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !email.includes('@')) {
            showToast('Please enter a valid email address.', 'error');
            return;
        }
        try {
            const API = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${API}/api/admin/waitlist/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name: 'Premium Waitlist User' })
            });
            if (response.ok) {
                setIsSubmitted(true);
                showToast("Welcome to the list! You'll be notified soon.", 'success');
            } else {
                const data = await response.json();
                showToast(data.message || 'Waitlist registration failed.', 'error');
            }
        } catch (err) {
            showToast('Network error, please try again.', 'error');
        }
    };


    const featuresList = [
        {
            title: "High Quality Audio",
            desc: "Immerse yourself in 320kbps lossless audio quality for pure music satisfaction.",
            icon: <SoundwaveIcon />
        },
        {
            title: "Offline Downloads",
            desc: "Download your favorite tracks directly to your device and listen without internet constraints.",
            icon: <DownloadIcon />
        },
        {
            title: "Unlimited Playlists",
            desc: "Create, share, and customize as many playlists as your mood demands.",
            icon: <PlaylistIcon />
        },
        {
            title: "AI Recommendations",
            desc: "Discover fresh songs tailored to your exact taste, updated live every single day.",
            icon: <SparklesIcon />
        },
        {
            title: "Advanced Listening Insights",
            desc: "Deep dive into your music analytics, personal charts, and custom acoustic preferences.",
            icon: <BarChartIcon />
        },
        {
            title: "Voice Search",
            desc: "Navigate, play, and search hands-free using high-accuracy speech recognition.",
            icon: <MicIcon />
        },
        {
            title: "Ad-Free Listening",
            desc: "Experience pure, uninterrupted sound, without single pop-up or audio distraction.",
            icon: <SpeakerOffIcon />
        }
    ];

    if (isMobile) {
        return (
            <div className="premium-view-container mobile-premium-redesign">
                <button className="premium-mobile-back" onClick={handleBack} aria-label="Back">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                {/* 1. Premium Hero Card */}
                <header className="premium-hero">
                    <div className="premium-hero-glow" />
                    <div className="premium-mobile-crown-container">
                        <CrownIcon />
                    </div>
                    <span className="premium-badge">Coming Soon</span>
                    <h1>SurTaal Premium</h1>
                    <p>Experience music without limits. Unlock studio quality sound, offline access, and smart discovery tools.</p>
                    
                    <div className="premium-waitlist-wrapper">
                        {!isSubmitted ? (
                            <form className="premium-waitlist-form" onSubmit={handleWaitlistSubmit}>
                                <input 
                                    type="email" 
                                    placeholder="Enter your email to join the waitlist..." 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <button type="submit">Join Waitlist</button>
                            </form>
                        ) : (
                            <div className="premium-waitlist-success">
                                <strong>You're on the list!</strong>
                                <small>We'll notify you as soon as early access begins.</small>
                            </div>
                        )}
                    </div>
                </header>

                {/* 2. Premium Features Section */}
                <section className="premium-features-section">
                    <h2 className="premium-section-title">Premium Features</h2>
                    <div className="premium-features-grid">
                        {featuresList.map((feat) => (
                            <div className="premium-feature-card" key={feat.title}>
                                <div className="premium-feature-card-glow" />
                                <span className="premium-feature-badge">Soon</span>
                                <div className="premium-feature-icon-wrap">
                                    {feat.icon}
                                </div>
                                <div className="premium-feature-text">
                                    <h3>{feat.title}</h3>
                                    <p>{feat.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Pricing Section */}
                <section className="premium-pricing-section">
                    <h2 className="premium-section-title">Pricing</h2>
                    <div className="premium-pricing-card">
                        <span className="premium-pricing-badge">Launching Soon</span>
                        <div className="premium-pricing-price">
                            ₹99<span>/month</span>
                        </div>
                        <p>Get unlimited access to all premium features, high-fidelity audio, and ad-free playback.</p>
                        <button type="button" disabled>Get Started — Coming Soon</button>
                    </div>
                </section>

                {/* 4. SurTaal Rewind Section */}
                <section className="premium-rewind-section">
                    <h2 className="premium-section-title">SurTaal Rewind</h2>
                    <div className="premium-rewind-grid">
                        {/* Card 1: Listening Streak */}
                        <div className="premium-rewind-card">
                            <div className="premium-rewind-card-blur-overlay">
                                <span>Coming Soon</span>
                                <p>Unlock your recap</p>
                            </div>
                            <div className="premium-rewind-header">
                                <div className="premium-rewind-icon-wrap">
                                    <FlameIcon />
                                </div>
                                <h4>Listening Streaks</h4>
                            </div>
                            <div className="premium-rewind-streak">
                                <span className="premium-rewind-streak-number">42</span>
                                <span className="premium-rewind-streak-text">Days active listening streak. Keep the rhythm going!</span>
                            </div>
                        </div>

                        {/* Card 2: Top Songs */}
                        <div className="premium-rewind-card">
                            <div className="premium-rewind-card-blur-overlay">
                                <span>Coming Soon</span>
                                <p>Unlock your top tracks</p>
                            </div>
                            <div className="premium-rewind-header">
                                <div className="premium-rewind-icon-wrap">
                                    <PlaylistIcon />
                                </div>
                                <h4>Your Top Songs</h4>
                            </div>
                            <div className="premium-rewind-preview-list">
                                <div className="premium-rewind-preview-item">
                                    <img src="https://i.scdn.co/image/ab67616d00001e02edff6e4b971e46f6f9661d9a" alt="" />
                                    <div className="premium-rewind-preview-item-text">
                                        <strong>Apna Bana Le</strong>
                                        <small>Arijit Singh • 120 plays</small>
                                    </div>
                                </div>
                                <div className="premium-rewind-preview-item">
                                    <img src="https://i.scdn.co/image/ab67616d00001e02203e6495a78184970ab274ac" alt="" />
                                    <div className="premium-rewind-preview-item-text">
                                        <strong>Azul</strong>
                                        <small>Guru Randhawa • 98 plays</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Top Artists */}
                        <div className="premium-rewind-card">
                            <div className="premium-rewind-card-blur-overlay">
                                <span>Coming Soon</span>
                                <p>Unlock your top creators</p>
                            </div>
                            <div className="premium-rewind-header">
                                <div className="premium-rewind-icon-wrap">
                                    <MicIcon />
                                </div>
                                <h4>Your Top Artists</h4>
                            </div>
                            <div className="premium-rewind-preview-list">
                                <div className="premium-rewind-preview-item">
                                    <div className="premium-rewind-icon-wrap" style={{ borderRadius: '50%', fontSize: '12px' }}>1</div>
                                    <div className="premium-rewind-preview-item-text">
                                        <strong>Karan Aujla</strong>
                                        <small>320 total plays</small>
                                    </div>
                                </div>
                                <div className="premium-rewind-preview-item">
                                    <div className="premium-rewind-icon-wrap" style={{ borderRadius: '50%', fontSize: '12px' }}>2</div>
                                    <div className="premium-rewind-preview-item-text">
                                        <strong>Diljit Dosanjh</strong>
                                        <small>245 total plays</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="premium-view-container">

            {/* 1. Premium Hero */}
            <header className="premium-hero">
                <div className="premium-hero-glow" />
                <span className="premium-badge">Coming Soon</span>
                <h1>SurTaal Premium 👑</h1>
                <p>Experience music without limits. Unlock studio quality sound, offline access, and smart discovery tools.</p>
                
                <div className="premium-waitlist-wrapper">
                    {!isSubmitted ? (
                        <form className="premium-waitlist-form" onSubmit={handleWaitlistSubmit}>
                            <input 
                                type="email" 
                                placeholder="Enter your email to join the waitlist..." 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit">Join Waitlist</button>
                        </form>
                    ) : (
                        <div className="premium-waitlist-success">
                            <strong>You're on the list! ✨</strong>
                            <small>We'll notify you as soon as early access begins.</small>
                        </div>
                    )}
                </div>
            </header>

            {/* 2. Features Grid */}
            <section className="premium-features-section">
                <h2 className="premium-section-title">Premium Features</h2>
                <div className="premium-features-grid">
                    {featuresList.map((feat) => (
                        <div className="premium-feature-card" key={feat.title}>
                            <div className="premium-feature-card-glow" />
                            <span className="premium-feature-badge">Soon</span>
                            <div className="premium-feature-icon-wrap">
                                {feat.icon}
                            </div>
                            <div className="premium-feature-text">
                                <h3>{feat.title}</h3>
                                <p>{feat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. Pricing Section */}
            <section className="premium-pricing-section">
                <h2 className="premium-section-title">Pricing</h2>
                <div className="premium-pricing-card">
                    <span className="premium-pricing-badge">Launching Soon</span>
                    <div className="premium-pricing-price">
                        ₹99<span>/month</span>
                    </div>
                    <p>Get unlimited access to all premium features, high-fidelity audio, and ad-free playback.</p>
                    <button type="button" disabled>Get Started — Coming Soon</button>
                </div>
            </section>

            {/* 4. SurTaal Rewind Section */}
            <section className="premium-rewind-section">
                <h2 className="premium-section-title">SurTaal Rewind</h2>
                <div className="premium-rewind-grid">
                    {/* Card 1: Listening Streak */}
                    <div className="premium-rewind-card">
                        <div className="premium-rewind-card-blur-overlay">
                            <span>Coming Soon</span>
                            <p>Unlock your annual recap</p>
                        </div>
                        <div className="premium-rewind-header">
                            <div className="premium-rewind-icon-wrap">🔥</div>
                            <h4>Listening Streaks</h4>
                        </div>
                        <div className="premium-rewind-streak">
                            <span className="premium-rewind-streak-number">42</span>
                            <span className="premium-rewind-streak-text">Days active listening streak. Keep the rhythm going!</span>
                        </div>
                    </div>

                    {/* Card 2: Top Songs */}
                    <div className="premium-rewind-card">
                        <div className="premium-rewind-card-blur-overlay">
                            <span>Coming Soon</span>
                            <p>Unlock your top tracks</p>
                        </div>
                        <div className="premium-rewind-header">
                            <div className="premium-rewind-icon-wrap">🎵</div>
                            <h4>Your Top Songs</h4>
                        </div>
                        <div className="premium-rewind-preview-list">
                            <div className="premium-rewind-preview-item">
                                <img src="https://i.scdn.co/image/ab67616d00001e02edff6e4b971e46f6f9661d9a" alt="" />
                                <div className="premium-rewind-preview-item-text">
                                    <strong>Apna Bana Le</strong>
                                    <small>Arijit Singh • 120 plays</small>
                                </div>
                            </div>
                            <div className="premium-rewind-preview-item">
                                <img src="https://i.scdn.co/image/ab67616d00001e02203e6495a78184970ab274ac" alt="" />
                                <div className="premium-rewind-preview-item-text">
                                    <strong>Azul</strong>
                                    <small>Guru Randhawa • 98 plays</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Top Artists */}
                    <div className="premium-rewind-card">
                        <div className="premium-rewind-card-blur-overlay">
                            <span>Coming Soon</span>
                            <p>Unlock your top creators</p>
                        </div>
                        <div className="premium-rewind-header">
                            <div className="premium-rewind-icon-wrap">🎤</div>
                            <h4>Your Top Artists</h4>
                        </div>
                        <div className="premium-rewind-preview-list">
                            <div className="premium-rewind-preview-item">
                                <div className="premium-rewind-icon-wrap" style={{ borderRadius: '50%', fontSize: '12px' }}>1</div>
                                <div className="premium-rewind-preview-item-text">
                                    <strong>Karan Aujla</strong>
                                    <small>320 total plays</small>
                                </div>
                            </div>
                            <div className="premium-rewind-preview-item">
                                <div className="premium-rewind-icon-wrap" style={{ borderRadius: '50%', fontSize: '12px' }}>2</div>
                                <div className="premium-rewind-preview-item-text">
                                    <strong>Diljit Dosanjh</strong>
                                    <small>245 total plays</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PremiumView;
