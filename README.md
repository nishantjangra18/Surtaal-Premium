# SurTaal Premium 🎵

SurTaal Premium is a modern, responsive web application for music streaming, featuring a premium design with local search, dynamic styling, real-time lyrics synchronization, and a custom modal overlay player.

---

## 📂 Project Structure

```
SurTaal/
├── backend/            # Express.js backend API
│   ├── models/         # Mongoose database schemas
│   ├── routes/         # API endpoints
│   ├── scratch/        # Developer utilities and database seeding scripts
│   ├── server.js       # Main server file
│   └── .env            # Backend configuration (ignored by Git)
├── frontend/           # React + Vite frontend SPA
│   ├── src/            # Components, context, and styles
│   └── public/         # Static assets (images, audio covers, track files)
└── README.md           # This instructions guide
```

---

## 🛠️ Environment Setup

Before starting the backend, create a `.env` file inside the `backend/` folder:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.p5phkoi.mongodb.net/surtaal?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret_key

# Optional: Spotify API keys (if external Spotify fetch integrations are used)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_MARKET=IN
```

> [!WARNING]
> Never commit your `.env` file to Git. The project contains root-level `.gitignore` rules that prevent tracking environment configuration files and `node_modules` folders.

---

## 🚀 How to Run the Project

Follow these steps to get both servers running locally:

### 1. Start the Backend Server

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Run the development server (uses nodemon for auto-restart)
npm run dev
```

* The backend API server will run on `http://localhost:5000` (or the custom port specified in your `.env` file).
* It will connect to your MongoDB database using the `MONGO_URI`.

---

### 2. Start the Frontend Server

```bash
# Navigate to the frontend directory (from the root folder)
cd frontend

# Install dependencies
npm install

# Run the React/Vite development server
npm run dev
```

* The frontend application will run on `http://localhost:5173`.
* Open your browser and navigate to `http://localhost:5173` to explore SurTaal.

---

## ✨ Key Technical Features

1. **Overlay-Based Desktop Now Playing Player**:
   * Desktop version does not use route navigation for Now Playing (`/now-playing`).
   * Clicking on the cover art or song info slides up a fixed modal overlay player with `backdrop-filter: blur(20px)` and dynamic colored radial backgrounds matching the active track.
   * Restores user state gracefully on refresh (browser refresh safety returns the user to the active screen).
2. **Infinite Horizontal Marquee Animation**:
   * Overflowing long titles and artist names in the PC Now Playing overlay continuously scroll horizontally with a smooth infinite loop and no sudden jumps.
   * Animations activate dynamically only when the text length overflows its container.
3. **Synchronized Lyrics Scrolling**:
   * Interactive lyrics panel matches the premium gold visual theme.
   * Auto-scrolling and live line-by-line highlighting based on track playback `currentTime`.
4. **100% Local Search & Database Fallback**:
   * Searches songs locally using static index and database queries to avoid external API delays.
5. **Global Auth Guard**:
   * Protected routes (Library, History, Profile settings, etc.) present custom styled login prompts rather than default popups.
