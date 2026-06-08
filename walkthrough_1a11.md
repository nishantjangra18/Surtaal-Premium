# SurTaal Feature Walkthrough

We have successfully integrated a fully functional **Synchronized Lyrics Experience**, a **Global Back Button Navigation System** with refined drill-down visibility gates, completed a comprehensive **Mobile UX Polish Pass**, and implemented a thorough **Profile & Settings Overhaul** with dynamic variable-driven visual themes.

---

## 🎨 Back Button Navigation System (Refactored)

We refined the floating back button logic and layout to make it feel like premium native applications (Spotify, Apple Music, and YouTube Music).

### 1. Drill-Down Visibility Gates
- **Show Rules**: The back button now renders **only** on:
  - Playlist Details Page (`playlist`)
  - Album Details Page (`album`)
  - Artist Details Page (`artist`)
  - See All / Category Results Pages (`mood`, `language`, `trending-collection`)
  - Now Playing Page (route `/now-playing`)
- **History Rule**: On the detail/collection views, the button only appears if there is actual history to navigate back to (`viewHistory.length > 0`), ensuring it doesn't show up on initial loads or root landing pages.
- **Exclusion List**: The button is strictly hidden on:
  - Home, Search, Library, Premium, Request Song, Profile, and Settings tabs.
  - Any bottom navigation tabs.
  - The Admin Panel.

### 2. Layout Overlap Prevention (Zero Layout Shifting)
- **Desktop Position**: Placed at `top: 6px; left: calc(var(--sidebar-width) + 20px);`. This aligns the back button's Y center perfectly with the search bar's Y center, shifting it safely out of the sidebar boundary to avoid overlapping the desktop logo.
- **Desktop Navbar Shift**: When the back button is visible, the outer App container is marked with `.has-floating-back`, which automatically adds `padding-left: 80px` to the global `.navbar`. This shifts the search input to the right, creating a clean gap and avoiding any overlap.
- **Mobile Position**: Placed at `top: 14px; left: 14px;`.
- **Mobile Logo Toggle**: When the back button is visible on mobile, the `.mobile-brand` logo and text are hidden inside [MobileHeader.jsx](file:///d:/Nishant%20Jangra/Coding/Projects/SurTaal/frontend/src/components/MobileHeader.jsx). This cleanly swaps the brand logo for the floating back button at the exact same top-left coordinates, matching native app patterns.

### 3. Glassmorphic Gold Styling
- **Aesthetic**: styled with a circular gold-border design, soft-blur glassmorphic background, gold chevron icon, and subtle golden drop glow.
- **Micro-Animations**: Hover increases scale to `1.05` and brightens the gold glow (desktop). Active click compresses the button down to `0.94` for press feedback.
- **Z-Index**: Elevated to `10000` so it always stays locked in a fixed layer above scrolling detail views.

---

## 📱 Mobile UI & UX Polish Pass (Spotify / YT Music / Apple Music Style)

We polished the entire mobile web experience to resolve layout and functional issues, bringing it in line with premium native music streaming applications:

### 1. Home Page Greeting, Recommendations & Redundancy Fixes
- **Smart Display Names**: Added a `getDisplayName` helper inside [ProfileViews.jsx](file:///d:/Nishant Jangra/Coding/Projects/SurTaal/frontend/src/components/ProfileViews.jsx) and used it inside [HomeView.jsx](file:///d:/Nishant Jangra/Coding/Projects/SurTaal/frontend/src/components/HomeView.jsx). Long names or emails are parsed gracefully (e.g. taking the first word or name, handling CamelCase boundaries, stripping trailing digits, and keeping a clean `8` character maximum) to prevent truncation or cutting off.
- **Removed Duplicate Strip**: Eliminated the redundant "Recently Played" strip on mobile. Mobile home screens now keep only the dedicated "Continue Listening" vertical/horizontal layout, preventing identical content from rendering twice.
- **Recommended For You Polish**: Removed the subtitle text "Based on your listening history" from the "Recommended For You" section in [HomeView.jsx](file:///d:/Nishant Jangra/Coding/Projects/SurTaal/frontend/src/components/HomeView.jsx) to establish a cleaner premium music-app aesthetic. Increased the spacing slightly between the section title and the cards.

### 2. Now Playing Page Viewport Gaps & Spacing Fixes
- **Full Viewport Layout (`100dvh`)**: Updated `.now-playing-page` to use `position: fixed; top: 0; left: 0; height: 100dvh !important; width: 100vw !important; z-index: 9999;` in [mobile-premium.css](file:///d:/Nishant Jangra/Coding/Projects/SurTaal/frontend/src/styles/mobile-premium.css). This ensures the player occupies exactly 100% of the screen height, resolving gaps on tall screens.
- **Vertical Flex Distribution**: Balanced flex weights inside the mobile core container: `.np-visual-section` (flex: 1.1) and `.np-details-section` (flex: 1.4). Removed empty black spacing and margin paddings below controls to let the queue preview sit cleanly without overflow.
- **Desktop Design Preservation**: Removed the animated equalizer indicator above the track metadata completely. Configured the "Up Next" queue preview section to render strictly in mobile viewports (breakpoint `<= 768px`) using a responsive React state listener. The desktop player layout remains clean, premium, and free of queue elements.

### 3. Local-Only Instant Search & Browse Albums
- **100% Local Search**: Rewrote `searchSongs` in [musicService.js](file:///d:/Nishant Jangra/Coding/Projects/SurTaal/frontend/src/services/musicService.js) to query only local sources: client-side static `allSongs` array and local MongoDB database documents. No external Spotify APIs are called during search, resolving rate-limits and delays.
- **Mock Local Tracks**: Added mock entries for `Raataan Lambiyan` and `Raabta` under `newReleases` in [data.js](file:///d:/Nishant Jangra/Coding/Projects/SurTaal/frontend/src/data.js). Queries for these songs instantly return matching results that fallback to play active local audio files.
- **Browse Categories & Albums Carousel**: Separated search categories from actual albums on the landing page of [SearchView.jsx](file:///d:/Nishant Jangra/Coding/Projects/SurTaal/frontend/src/components/SearchView.jsx). Renamed the categories grid to "Browse Categories" and added a dedicated horizontal scrollable "Browse Albums" carousel to explore local albums with their own play buttons.

---

## 🎵 Synchronized Synced Lyrics Support

### 1. Synced Highlight & Centered Auto-Scroll
- **Database Schema**: Supported the `lyrics` property as `[{ time: Number, text: String }]` in the MongoDB model [Song.js](file:///d:/Nishant Jangra/Coding/Projects/SurTaal/backend/models/Song.js).
- **Real-Time Tracking**: Matches active lyric lines using `currentTime` inside [NowPlayingView.jsx](file:///d:/Nishant Jangra/Coding/Projects/SurTaal/frontend/src/components/NowPlayingView.jsx).
- **Active Glow & Dim**: The active line scales up to `1.05` and highlights with a gold glow, while inactive lines are set to `opacity: 0.32`.
- **Auto-Scroll**: Anchors a scroll ref to scroll the active line to the center of the lyrics panel.
- **Interactive Seek**: Clicking on any line of text seeks playback immediately to that timestamp.

---

## 🔒 Home Page Logged-Out Experience & Premium Auth Guard

We improved the logged-out state for guests on Desktop to protect user-specific features and keep the layout extremely clean:
- **Removed Top Charts Section**: Completely removed the "Top Charts" section, including state variables, cards, rankings, play handlers, and associated fetching logic, from [HomeView.jsx](file:///d:/Nishant%20Jangra/Coding/Projects/SurTaal/frontend/src/components/HomeView.jsx).
- **Protected Liked Songs Quick Action**: When logged out, clicking the Liked Songs quick action prevents navigation and prompts the Login modal with a contextual message: *"Login to access your liked songs."*
- **Protected Create Playlist Quick Action**: When logged out, clicking the Create Playlist quick action blocks the modal and prompts the Login modal with: *"Login to create playlists."*
- **Removed Trending Quick Action**: Completely removed the "Trending" button from the quick action row to prevent unnecessary API searches.
- **Global Auth Guard**: Intercepted all user-specific view requests (`library`, `history`, `edit-profile`, `settings`, `profile`) globally in the `navigateTo` router inside [MusicContext.jsx](file:///d:/Nishant%20Jangra/Coding/Projects/SurTaal/frontend/src/context/MusicContext.jsx). If a guest attempts to visit these views, navigation is blocked and they receive the Login modal with the reusable message: *"Please login to continue."*
- **Premium Auth Prompt Modal UI**: Designed a styled prompt screen inside [LoginModal.jsx](file:///d:/Nishant%20Jangra/Coding/Projects/SurTaal/frontend/src/components/LoginModal.jsx) and [mobile-premium.css](file:///d:/Nishant%20Jangra/Coding/Projects/SurTaal/frontend/src/styles/mobile-premium.css). Instead of generic browser alert popups, guests see a `🔒 Login Required` modal with a dark gold border, custom buttons (`Cancel` and `Login`), and smooth transition animations.

---

## 🛠️ Profile & Settings Overhaul (Spotify Style)

We completed a comprehensive settings redesign and profile persistence pass to make SurTaal feel like a real, feature-rich music platform.

### 1. User-Keyed Profile Persistence
- **State Partitioning**: Refactored the `useProfileSettings` hook in [ProfileViews.jsx](file:///d:/Nishant%20Jangra/Coding/Projects/SurTaal/frontend/src/components/ProfileViews.jsx) to load and save data from `st-profile-${userId}` in `localStorage`, falling back to `st-profile-guest` if logged out.
- **State Integrity**: Editing settings saves Display Name, Bio, Profile Image, and custom Username. Changes are retained across browser refreshes, and when logging out and logging back in as the same user.
- **Username Session Propagations**: Changes to the custom username propagate to `user.username` in `AuthContext` via a new `updateUser` function. Display names/usernames automatically fall back on custom fields or database claims.
- **Reset Capability**: Exported a `resetProfile` action that clears user-specific local preferences and sets profile details back to default values.

### 2. Multi-Panel Settings Hub
- **Unified Navigation Header**: Added a sleek `.settings-subnav` tab system at the top of the settings viewport. This allows users to jump between sections while staying correctly routed under `activeView` context.
- **Panel A: Account Settings**:
  - *Profile Section*: Styled drag-and-drop avatar uploader supporting base64 previews, image removals, and validation checks, with text inputs for Name, Username, and Bio.
  - *Account Section*: Shows email, registration timestamp, and a premium yellow badge indicating `Free (Premium Coming Soon)`.
  - *Security*: Change Password forms (functional mock verification showing toasts) and mock `Logout All Devices` buttons.
  - *Danger Zone*: Red outline container containing red logout and delete account triggers.
  - *Delete Account Confirm Modal*: A custom styled glassmorphic modal overlay (red highlights and alert warning symbol `⚠️`) asking for confirmation. Confirms trigger a mock deletion, clean profile resets, and logs the guest out.
- **Panel B: Privacy Settings**:
  - iOS-style switches to control: *Share Listening Activity*, *Public Profile Toggle*, *Show Recently Played Toggle*, and *Share Statistics Toggle*. Toggles trigger instant state writes and toasts.
- **Panel C: Notification Settings**:
  - Switches to control: *New Music Alerts*, *Playlist Updates*, *Feature Announcements*, and *Email Updates*. Auto-saves on change.

### 3. Dynamic Visual Themes & Canvas Variations
- **Theme Selection Board**: Selectable themes are presented in a grid of glassmorphic Cards under Appearance Settings. Cards render typography preview strings (`Aa`), color palette dots, and detailed summaries.
- **Theme Overrides**: Selecting a card triggers an instant write and updates the document root’s attribute `[data-theme-variant]`. Overrides in [index.css](file:///d:/Nishant%20Jangra/Coding/Projects/SurTaal/frontend/src/index.css) swap color variables globally.
- **Theme Catalog**:
  1. **SurTaal Gold (Default)**: Warm gold accents, dark wood tones, and luxury glass backgrounds.
  2. **Midnight Black**: High-contrast, pitch-black canvases (`#000000`), white typography, and gold glows.
  3. **Royal Purple**: Violet deep backgrounds (`#0f081c`), electric violet borders, text highlights, neon details, and purple player elements.
  4. **Light Theme**: Off-white cream backgrounds (`#faf9f6`), dark charcoal typography, and soft bronze/amber accents.
- **Dynamic player bar/modal consoles**: Modified class properties in [app.css](file:///d:/Nishant%20Jangra/Coding/Projects/SurTaal/frontend/src/styles/app.css) to support variables like `--bg-playbar`, `--border-playbar`, and `--bg-modal-gradient`. Player consoles and modal cards adapt to light/dark/purple backgrounds cleanly, preventing text blending.
