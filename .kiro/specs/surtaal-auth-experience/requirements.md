# Requirements Document

## Introduction

This feature transforms SurTaal from an open music player into an authentication-first Indian music streaming platform. The changes are scoped to three concerns only: auth-gating (library, playlist creation, playback, stats), content strategy (Indian-only homepage), and real data (replacing hardcoded stats with user-activity-driven data). The existing UI layout, component structure, and visual design are not altered.

## Glossary

- **SurTaal**: The React + Node/Express music streaming web application being modified.
- **AuthContext**: The existing React context that holds `user`, `token`, `login`, `register`, and `logout`.
- **MusicContext**: The existing React context that manages player state, playlists, history, and liked songs.
- **AuthGate**: A UI pattern that intercepts a user action when the user is not logged in, shows a LoginModal, and optionally resumes the interrupted action after successful login.
- **LoginModal**: A centred modal overlay with blurred background that presents the SurTaal login/signup form. Triggered by auth-gated actions.
- **PlaybackModal**: A specialised LoginModal variant that additionally displays the song's cover art, title, and artist name before presenting the login/signup form.
- **LibraryPanel**: The "Your Library" section in Sidebar.jsx.
- **RightSidebar**: The right-hand panel currently showing hardcoded Listening Stats and Top Artists in RightSidebar.jsx.
- **HomeView**: The main discovery page (HomeView.jsx) showing recommendation sections and Top Charts.
- **RecommendationEngine**: The backend logic in spotifyService.js (`getRecommendations`) combined with the frontend `musicService.getRecommendations` call in HomeView.jsx.
- **HistoryService**: The backend `/api/songs/history` endpoint (POST for recording, GET for fetching) combined with the frontend `userLibraryService.saveHistory` call in MusicContext.jsx.
- **User**: The Mongoose User model in `backend/models/User.js` with fields `likedSongs`, `recentlyPlayed`, `listeningHistory`, `favoriteArtists`, `favoriteGenres`, `playlists`.
- **PendingActionContext**: A transient state value (stored in React state) that records which auth-gated action was interrupted so it can be replayed after login.
- **Indian Music Seed**: Any Spotify search query that targets Bollywood, Punjabi, Hindi Indie, Haryanvi, Lo-fi Hindi, Romantic Hindi, Punjabi Pop, or Punjabi Hip-Hop content.
- **Dummy Data**: Hardcoded statistics, counts, artist names, play counts, or listening times that do not originate from actual user activity.

---

## Requirements

### Requirement 1: Indian Music Homepage

**User Story:** As a user browsing SurTaal, I want the homepage to surface exclusively Indian music recommendations so that I am not shown western or English content by default.

#### Acceptance Criteria

1. WHEN the HomeView loads, THE RecommendationEngine SHALL query Spotify using only Indian Music Seeds for the default homepage sections.
2. THE RecommendationEngine SHALL provide the following named sections on the homepage: "Trending in India", "Punjabi Hits", "Bollywood Romance", "Desi Hip Hop", "Late Night Drive", "Made For You", and "Top Indian Artists".
3. WHEN no user is logged in, THE RecommendationEngine SHALL use generic Indian Music Seeds (Bollywood, Hindi, Punjabi) for all sections.
4. WHEN a user is logged in, THE RecommendationEngine SHALL personalise the "Made For You" section using the user's `favoriteArtists` and `favoriteGenres` stored in the User document.
5. THE HomeView SHALL NOT render any section whose seed query is exclusively English or western genre-based.
6. IF the Spotify API returns zero tracks for an Indian Music Seed query, THEN THE HomeView SHALL completely remove that section from the homepage layout without displaying any empty placeholder or error state to the user.

---

### Requirement 2: Library Auth Gate

**User Story:** As a user who is not logged in, I want the Library panel to show a clear empty state with a login prompt so that I understand I need to log in to access my playlists.

#### Acceptance Criteria

1. WHILE the user is not authenticated, THE LibraryPanel SHALL display both the empty-state message "Login to access your playlists" and a Login button together instead of playlist entries.
2. WHEN the Login button in the LibraryPanel is clicked while the user is not authenticated, THE AuthGate SHALL open the LoginModal.
3. WHILE the user is authenticated, THE LibraryPanel SHALL display the user's liked songs count, created playlists, and history-based playlists fetched from the backend.
4. THE LibraryPanel SHALL NOT display the static playlist and album entries from `frontend/src/data.js` to unauthenticated users.
5. WHEN the user successfully logs in from the LibraryPanel LoginModal, THE LibraryPanel SHALL render the user's actual library only after the user data has been fully loaded and is ready, without requiring a page reload.

---

### Requirement 3: Create Playlist Auth Gate

**User Story:** As a user who is not logged in, I want clicking "Create Playlist" to prompt me to log in so that I understand the feature requires an account.

#### Acceptance Criteria

1. WHEN an unauthenticated user clicks the Create Playlist button (the `+` icon in Sidebar.jsx), THE AuthGate SHALL open the LoginModal with the contextual message "Login to create and manage playlists."
2. THE AuthGate SHALL record the Create Playlist action as the PendingActionContext before opening the LoginModal.
3. WHEN the user successfully logs in from the Create Playlist LoginModal, THE AuthGate SHALL automatically open the playlist creation flow (set `createPlaylistOpen` to `true` in MusicContext) without requiring the user to click again.
4. WHILE the user is authenticated, THE Create Playlist button SHALL behave as it currently does (opens CreatePlaylistModal directly).

---

### Requirement 4: Playback Auth Gate

**User Story:** As a user who is not logged in, I want clicking any song to show a login prompt with the song's details so that I understand I need to log in to listen.

#### Acceptance Criteria

1. WHEN an unauthenticated user clicks a song or its play button anywhere in the app, THE AuthGate SHALL prevent audio playback from starting.
2. WHEN an unauthenticated user clicks a song, THE AuthGate SHALL open a PlaybackModal displaying the song's cover art, title, and artist name.
3. THE PlaybackModal SHALL include the message "Login to listen to this song" and two buttons: "Login" and "Sign Up".
4. THE PlaybackModal SHALL NOT call `playSong`, `playSpotifySong`, or any audio playback function whenever the user is unauthenticated, regardless of whether the PlaybackModal is currently open.
5. WHEN the user successfully logs in from the PlaybackModal, THE AuthGate SHALL resume playback of the interrupted song automatically.
6. WHILE the user is authenticated, THE playback functions SHALL behave as they currently do without any AuthGate interception.

---

### Requirement 5: Stats and History Auth Gate

**User Story:** As a user who is not logged in, I want the stats and history panels to show a login prompt so that I understand my listening activity is tracked only for logged-in users.

#### Acceptance Criteria

1. WHILE the user is not authenticated, THE RightSidebar SHALL display a single prompt section reading "Login to see your music journey" with a Login button in place of the Listening Stats and Top Artists sections.
2. WHILE the user is authenticated, THE RightSidebar SHALL display the Listening Stats and Top Artists sections populated with real data from the User document. WHEN authentication state is in transition, THE RightSidebar SHALL continue to display whatever data is currently available.
3. WHEN the Login button in the RightSidebar prompt is clicked, THE AuthGate SHALL open the LoginModal.
4. WHILE the user is not authenticated, THE HistoryView component SHALL display the message "Login to see your history" with a Login button instead of history entries.
5. WHEN the user successfully logs in from any stats-related LoginModal, THE RightSidebar and HistoryView SHALL render the user's actual data only after the user data has been fully loaded and is ready, ensuring no partial or stale state is displayed.

---

### Requirement 6: Remove Dummy Data

**User Story:** As a logged-in user, I want all statistics to reflect my real listening activity so that the numbers displayed are trustworthy and meaningful.

#### Acceptance Criteria

1. THE RightSidebar SHALL NOT render any hardcoded numeric values, artist names, song titles, play counts, or listening durations as static constants.
2. WHEN the user is authenticated, THE RightSidebar SHALL derive all displayed values exclusively from the User document fields: `listeningHistory`, `favoriteArtists`, `favoriteGenres`, `recentlyPlayed`, and `playlists`.
3. THE RightSidebar SHALL calculate "Today's Listening Time" by summing `duration` of all songs in `listeningHistory` where `playedAt` falls within the current calendar day.
4. THE RightSidebar SHALL display "Top Artist" as the first entry in the `favoriteArtists` array (highest play count) from the User document, or "—" if the array is empty.
5. THE RightSidebar SHALL display "Favorite Genre" as the first entry in the `favoriteGenres` array (highest play count) from the User document, or "—" if the array is empty.
6. THE RightSidebar SHALL display "Most Played Song" as the song title with the highest frequency in the `listeningHistory` array, or "—" if the array is empty.
7. IF the user has no listening history, THEN THE RightSidebar SHALL display "—" (em dash) for each computed stat value instead of zero or a hardcoded fallback.

---

### Requirement 7: Listening History System

**User Story:** As a logged-in user, I want every song I play to be recorded in my history so that my listening activity is available for stats, recommendations, and the History view.

#### Acceptance Criteria

1. WHEN an authenticated user begins playback of a song, THE HistoryService SHALL record the song in the user's `recentlyPlayed` array (capped at 30 entries, deduped by song identity) in the User document.
2. WHEN an authenticated user begins playback of a song, THE HistoryService SHALL append the song to the user's `listeningHistory` array (capped at 300 entries) in the User document.
3. WHEN a song is recorded, THE HistoryService SHALL increment the artist's count in `favoriteArtists` (capped at 25 entries, sorted descending by count) in the User document.
4. WHEN a song is recorded, THE HistoryService SHALL increment each of the song's genres in `favoriteGenres` (capped at 25 entries, sorted descending by count) in the User document.
5. WHILE the user is not authenticated, THE HistoryService SHALL NOT send any POST requests to `/api/songs/history`.
6. THE HistoryView SHALL display the user's `recentlyPlayed` entries with song title, artist, and relative timestamp (e.g., "2 hours ago") after successful login.
7. FOR ALL valid song objects recorded and then fetched from the backend, THE song identity (spotifyId or src or title) SHALL be preserved without mutation (round-trip property).

---

### Requirement 8: Activity-Driven Recommendation Engine

**User Story:** As a logged-in user, I want homepage recommendations to be generated from my actual listening activity so that I discover music relevant to my tastes.

#### Acceptance Criteria

1. WHEN a logged-in user loads the HomeView, THE RecommendationEngine SHALL fetch the user's `favoriteArtists[0].name` and `favoriteGenres[0].name` from the User document and pass them as `topArtist` and `favoriteGenre` query parameters to the backend `/api/music/recommendations` endpoint.
2. WHEN a logged-in user loads the HomeView, THE RecommendationEngine SHALL generate a personalised "Because You Like [Artist]" section using the user's top artist from `favoriteArtists`. WHEN the user is not logged in, THE RecommendationEngine SHALL NOT generate this personalised section.
3. THE RecommendationEngine SHALL generate a "Made For You" section using a Spotify query combining the user's top artist and top genre.
4. WHEN no listening history exists for a logged-in user, THE RecommendationEngine SHALL fall back to generic Indian Music Seeds (Arijit Singh, Bollywood Hindi) for personalised sections.
5. WHEN a guest user loads the HomeView, THE RecommendationEngine SHALL use only generic Indian Music Seeds without referencing any user-specific data.
6. THE RecommendationEngine SHALL NOT use any static, hardcoded artist names or song titles as personalisation inputs when user activity data is available.

---

### Requirement 9: Premium Login Modal Experience

**User Story:** As a user encountering an auth gate, I want a visually immersive login modal so that the login experience feels consistent with a premium streaming platform.

#### Acceptance Criteria

1. WHEN THE LoginModal is opened, THE LoginModal SHALL blur the background content of the application behind the modal overlay. WHEN THE LoginModal is closed, THE LoginModal SHALL remove the background blur and restore the normal view.
2. THE LoginModal SHALL display the SurTaal branding (logo and name) at the top of the modal.
3. THE LoginModal SHALL contain a login form with email and password fields and a "Login" submit button.
4. THE LoginModal SHALL contain a "Sign Up" toggle that switches the form to a registration view with username, email, and password fields.
5. WHEN a login or registration form is submitted and one or more required fields are empty, THE LoginModal SHALL display inline validation messages identifying each empty field without submitting the form. WHEN all required fields are filled, THE LoginModal SHALL submit the form without triggering validation messages.
6. WHEN a login attempt returns an error from the backend, THE LoginModal SHALL display the error message returned by the server beneath the form without closing the modal.
7. WHEN the user clicks outside the modal overlay or presses the Escape key, THE LoginModal SHALL close and discard any PendingActionContext.
8. THE PlaybackModal SHALL extend LoginModal by prepending a song info block (cover art 80×80 px, title, artist name) and the message "Login to listen to this song" above the login form.
9. WHEN a contextual message is provided to THE LoginModal (e.g., "Login to create and manage playlists"), THE LoginModal SHALL display that message beneath the SurTaal branding and above the form. WHEN no contextual message is provided, THE LoginModal SHALL not display any contextual message in that space.
10. THE LoginModal SHALL be accessible: the modal container SHALL have `role="dialog"` and `aria-modal="true"`, and focus SHALL be trapped within the modal while it is open.
