console.log("Lets Write Java Script");
let currentPlaylist = [];
let currentPlaylistName = "";
let currentSongIndex = 0;
let currentSongSrc = ""; // âœ… NEW

async function getsongs() {
  let a = await fetch("http://127.0.0.1:3000/songs/");
  let response = await a.text();
  console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href);
    }
  }
  return songs;
}

async function main() {
  console.log("Frontend only music player running...");

  // Dummy songs (frontend only)

  let albums = {
    Saiyaara: {
      cover: "https://i.scdn.co/image/ab67616d00001e02a7e251b543c77a6ed356dfbe",
      songs: [
        {
          src: "Songs/Albums/Saiyaara/Saiyaara.mp3",
          cover:
            "https://i.scdn.co/image/ab67616d00001e02a7e251b543c77a6ed356dfbe",
          singer: "Faheem Abdullah",
        },
        {
          src: "Songs/Albums/Saiyaara/Barbaad.mp3",
          cover: "Covers/barbaad.jpg",
          singer: "Jubin Nautiyal",
        },
        {
          src: "Songs/Albums/Saiyaara/Dhun.mp3",
          cover: "Covers/dhun.jpg",
          singer: "Arijit Singh",
        },
        {
          src: "Songs/Albums/Saiyaara/Tum Ho Toh.mp3",
          cover: "Covers/tum ho toh.jpg",
          singer: "Vishal Mishra, Hansika Pareek",
        },
        {
          src: "Songs/Albums/Saiyaara/Humsafar.mp3",
          cover: "Covers/humsafar.jpg",
          singer: "Sachet Tandon, Parampara Tandon",
        },
      ],
    },
    "The Glory": {
      cover: "glory.jpg",
      songs: [
        {
          src: "Songs/Albums/The Glory/Millionaire.mp3",
          cover: "glory.jpg",
          singer: "Yo Yo Honey Singh",
        },
        {
          src: "Songs/Albums/The Glory/High On Me.mp3",
          cover: "glory.jpg",
          singer: "Yo Yo Honey Singh, Talwiinder",
        },
        {
          src: "Songs/Albums/The Glory/Bonita.mp3",
          cover: "glory.jpg",
          singer: "Yo Yo Honey Singh, The Shams",
        },
        {
          src: "Songs/Albums/The Glory/Payal.mp3",
          cover: "glory.jpg",
          singer: "Yo Yo Honey Singh, Paradox",
        },
      ],
    },
    "51 Glorious Days": {
      cover: "https://i.scdn.co/image/ab67616d00001e028fa95e3e74799cb0b2a1fb57",
      songs: [
        {
          src: "Songs/Albums/51 Glorious Days/Mafia.mp3",
          cover:
            "https://i.scdn.co/image/ab67616d00001e028fa95e3e74799cb0b2a1fb57",
          singer: "Yo Yo Honey Singh",
        },
        {
          src: "Songs/Albums/51 Glorious Days/Glorious Days.mp3",
          cover:
            "https://i.scdn.co/image/ab67616d00001e028fa95e3e74799cb0b2a1fb57",
          singer: "Yo Yo Honey Singh",
        },
        {
          src: "Songs/Albums/51 Glorious Days/Aadat.mp3",
          cover:
            "https://i.scdn.co/image/ab67616d00001e028fa95e3e74799cb0b2a1fb57",
          singer: "Yo Yo Honey Singh, AP Dhillon",
        },
        {
          src: "Songs/Albums/51 Glorious Days/Compro.mp3",
          cover:
            "https://i.scdn.co/image/ab67616d00001e028fa95e3e74799cb0b2a1fb57",
          singer: "Yo Yo Honey Singh, Alfaaz",
        },
      ],
    },
    "Haryanvi Workout": {
      cover: "https://i.scdn.co/image/ab67706f00000002902ab96d7cae873f5c253fff",
      songs: [
        {
          src: "Songs/Albums/Haryanvi Workout/2 Numbari.mp3",
          cover: "Covers/2 numbari.jpg",
          singer: "Masoom Sharma, Manisha Sharma",
        },
        {
          src: "Songs/Albums/Haryanvi Workout/No Fluke.mp3",
          cover: "Covers/no fluke.jpg",
          singer: "Dhanda Nyoliwala",
        },
        {
          src: "Songs/Albums/Haryanvi Workout/Russian Bandana.mp3",
          cover: "Covers/russian bhandana.jpg",
          singer: "Dhanda Nyoliwala",
        },
        {
          src: "Songs/Albums/Haryanvi Workout/Haryana Hood.mp3",
          cover: "Covers/haryana hood.jpg",
          singer: "Irshad Khan",
        },
      ],
    },
    "Bollywood & Chill": {
      cover: "https://i.scdn.co/image/ab67706f0000000203b72ae3caf435bd1f95fbd5",
      songs: [
        {
          src: "Songs/Albums/Bollywood & Chills/Pardesiya.mp3",
          cover: "Covers/pardesiya.jpg",
          singer: "Sonu Nigam, Krishnakali Saha",
        },
        {
          src: "Songs/Albums/Bollywood & Chills/Maiyya Mainu.mp3",
          cover: "Covers/maiyya mainu.jpg",
          singer: "Sachet Tandon",
        },
        {
          src: "Songs/Albums/Bollywood & Chills/Deewaniyat.mp3",
          cover: "Covers/deewaniyat.jpg",
          singer: "Vishal Mishra",
        },
        {
          src: "Songs/Albums/Bollywood & Chills/Bol Kaffara Kya Hoga.mp3",
          cover: "Covers/bol.jpg",
          singer: "Neha Kakkar, Farhan Sabri",
        },
      ],
    },
    Haseen: {
      cover:
        "https://lh3.googleusercontent.com/LEdbfSC9xh9S-N-uRQ7iJPlJQLi9OUyOUX4oJ0sAiFuOf4g01B94FD9NzPdDkn5hpFrms2HmrpKPJle5=w544-h544-l90-rj",
      songs: [
        {
          src: "Songs/New Releases/Haseen.mp3",
          cover:
            "https://lh3.googleusercontent.com/LEdbfSC9xh9S-N-uRQ7iJPlJQLi9OUyOUX4oJ0sAiFuOf4g01B94FD9NzPdDkn5hpFrms2HmrpKPJle5=w544-h544-l90-rj",
          singer: "Talwinder",
        },
      ],
    },
    Bijuria: {
      cover:
        "https://pagalnew.com/coverimages/bijuria-sunny-sanskari-ki-tulsi-kumari-500-500.jpg",
      songs: [
        {
          src: "Songs/New Releases/Bijuria.mp3",
          cover: "Covers/bijuria.jpg",
          singer: "Sonu Nigam, Asees Kaur",
        },
      ],
    },
    Panwadi: {
      cover:
        "https://lh3.googleusercontent.com/p2-NRHoGI6J_-_tCSCFOt9N-PodFYHrTwWf2xKax1dEa35gsfhvcLZwUxNflxOROjgW9_6Sed9Va8o8bCg=w544-h544-l90-rj",
      songs: [
        {
          src: "Songs/New Releases/Panwadi.mp3",
          cover: "Covers/panwadi.jpg",
          singer: "Khesari Lal Yadav",
        },
      ],
    },
    Azul: {
      cover: "https://i.scdn.co/image/ab67616d00001e02203e6495a78184970ab274ac",
      songs: [
        {
          src: "Songs/New Releases/Azul.mp3",
          cover: "Covers/azul.jpeg",
          singer: "Guru Randhawa",
        },
      ],
    },
    Perfect: {
      cover:
        "https://pagalnew.com/coverimages/perfect-sunny-sanskari-ki-tulsi-kumari-500-500.jpg",
      songs: [
        {
          src: "Songs/New Releases/Perfect.mp3",
          cover: "Covers/perfect.jpg",
          singer: "Guru Randhawa",
        },
      ],
    },
  };

  let playlists = {
    "Liked Songs": {
      cover:
        "https://www.gstatic.com/youtube/media/ytm/images/pbg/liked-music-@1200.png",
      songs: [
        {
          src: "Songs/Liked Songs/Ghafoor.mp3",
          cover: "Covers/ghafoor.jpg",
          singer: "Shilpa Rao, Ujwal Gupta",
        },
      ],
    },
    "P-POP CULTURE": {
      cover: "popculture.jpg",
      songs: [
        {
          src: "Songs/P-POP CULTURE/Mf Gabhru.mp3",
          cover: "Covers/mfgabhru.png",
          singer: "Karan Aujla",
        },
        {
          src: "Songs/P-POP CULTURE/7.7 Magnitude.mp3",
          cover: "popculture.jpg",
          singer: "Karan Aujla",
        },
        {
          src: "Songs/P-POP CULTURE/Boyfriend.mp3",
          cover: "popculture.jpg",
          singer: "Karan Aujla",
        },
        {
          src: "Songs/P-POP CULTURE/Daytona.mp3",
          cover: "popculture.jpg",
          singer: "Karan Aujla",
        },
        {
          src: "Songs/P-POP CULTURE/Flip Side (Sandy's Interlude).mp3",
          cover: "popculture.jpg",
          singer: "Karan Aujla",
        },
        {
          src: "Songs/P-POP CULTURE/For A Reason.mp3",
          cover: "popculture.jpg",
          singer: "Karan Aujla",
        },
        {
          src: "Songs/P-POP CULTURE/HIM.mp3",
          cover: "popculture.jpg",
          singer: "Karan Aujla",
        },
        {
          src: "Songs/P-POP CULTURE/I'ma Do My Thiiing.mp3",
          cover: "popculture.jpg",
          singer: "Karan Aujla",
        },
        {
          src: "Songs/P-POP CULTURE/I Really Do....mp3",
          cover: "popculture.jpg",
          singer: "Karan Aujla",
        },
        {
          src: "Songs/P-POP CULTURE/P-POP CULTURE.mp3",
          cover: "popculture.jpg",
          singer: "Karan Aujla",
        },
        {
          src: "Songs/P-POP CULTURE/You're U Tho.mp3",
          cover: "popculture.jpg",
          singer: "Karan Aujla",
        },
      ],
    },
    "Ishq aur Tanhai": {
      cover:
        "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000d72c9ae67d801ce4b277bc9a0160",
      songs: [
        {
          src: "Songs/Ishq aur Tanhai/Isq Risk.mp3",
          cover: "Covers/isq.jpg",
          singer: "Sohail Sen, Rahat Fateh Ali Khan",
        },
        {
          src: "Songs/Ishq aur Tanhai/Phir Mohabbat.mp3",
          cover: "Covers/phir.jpg",
          singer: "Mohammed Irfan, Arijit Singh",
        },
        {
          src: "Songs/Ishq aur Tanhai/Maula Mere Maula.mp3",
          cover: "Covers/maula.jpg",
          singer: "Roopkumar Rathod",
        },
        {
          src: "Songs/Ishq aur Tanhai/O Re Piya.mp3",
          cover: "Covers/o re.jpg",
          singer: "Rahat Fateh Ali Khan, Salim-Sulaiman, Jaideep Sahni",
        },
      ],
    },
    "80's-90's": {
      cover: "80's.jpg",
      songs: [
        {
          src: "Songs/old/Ruk Ja O Dil Deewane.mp3",
          cover: "Covers/ruk.jpg",
          singer: "Udit Narayan",
        },
        {
          src: "Songs/old/Dil Ne Yeh Kaha Hain Dil Se.mp3",
          cover: "Covers/dil.jpg",
          singer: "Udit Narayan, Alka Yagnik",
        },
        {
          src: "Songs/old/Aankhein Khuli.mp3",
          cover: "Covers/aankhein.jpg",
          singer: "Lata Mangeshkar, Udit Narayan, Shweta Pandit",
        },
        {
          src: "Songs/old/O Meri Mehbooba.mp3",
          cover: "Covers/o meri.jpg",
          singer: "Mohammed Rafi",
        },
      ],
    },
    "Punjabi Pump": {
      cover: "https://i.scdn.co/image/ab67706f00000002d5d2003959d642758be307d6",
      songs: [
        {
          src: "Songs/Punjabi Pump/0008.mp3",
          cover: "Covers/0008.jpg",
          singer: "Sidhu Moose Wala, Jenny Johal",
        },
        {
          src: "Songs/Punjabi Pump/Greatest.mp3",
          cover: "Covers/greatest.jpg",
          singer: "Arjan Dhillon",
        },
        {
          src: "Songs/Punjabi Pump/Gunda.mp3",
          cover: "Covers/gunda.jpg",
          singer: "Varinder Brar, Rav Dhaliwal",
        },
        {
          src: "Songs/Punjabi Pump/Wavy.mp3",
          cover: "Covers/wavy.jpg",
          singer: "Karan Aujla",
        },
      ],
    },
  };

  let currentPlaylist = [];
  let currentSongIndex = 0;
  let audio = new Audio();

  function formatTime(seconds) {
    if(isNaN(seconds)) return "0:00";
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return min + ":" + (sec < 10 ? "0" : "") + sec;
  }

  audio.addEventListener("timeupdate", () => {
    let currentTimeSpan = document.getElementById("current-time");
    let totalTimeSpan = document.getElementById("total-time");
    let seekBar = document.getElementById("seek-bar");
    if(currentTimeSpan && totalTimeSpan && seekBar && !isNaN(audio.duration)) {
      currentTimeSpan.innerText = formatTime(audio.currentTime);
      totalTimeSpan.innerText = formatTime(audio.duration);
      if(document.activeElement !== seekBar) {
        seekBar.value = (audio.currentTime / audio.duration) * 100;
      }
    }
  });

  function playSong(index) {
    if (!currentPlaylist || currentPlaylist.length === 0) return;

    currentSongIndex = index;
    let song = currentPlaylist[currentSongIndex];
    audio.src = song.src;
    audio.play().catch((err) => {
      console.error("Playback failed:", err);
    });

    audio.onended = () => {
      if (currentSongIndex < currentPlaylist.length - 1) {
        currentSongIndex++;
        playSong(currentSongIndex);
      }
    };

    // Save playlist + src
    // Save playlist/album name + src
    let foundPlaylist = Object.keys(playlists).find(
      (key) => playlists[key].songs === currentPlaylist
    );
    let foundAlbum = Object.keys(albums).find(
      (key) => albums[key].songs === currentPlaylist
    );

    if (foundPlaylist || foundAlbum) {
      currentPlaylistName = foundPlaylist || foundAlbum;
    } else {
      currentPlaylistName = "New Releases"; // ✅ fallback name
    }
    currentSongSrc = song.src;

    // Update playbar UI
    document.querySelector(".playbar").innerHTML = `
        <div style="display:flex; align-items:center; gap:15px; position:absolute; left:20px; max-width:25%;">
            <img src="${song.cover}" id="playbar-cover" style="cursor:pointer; height:50px; border-radius:8px;">
            <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                <p1 style="color:white; font-weight:bold; margin:0;">
                    ${decodeURIComponent(song.src.split("/").pop().replace(".mp3", ""))}
                </p1>
                <p style="color:rgb(180,180,180); font-size:12px; margin:0;">
                    ${song.singer}
                </p>
            </div>
        </div>
        <div class="songbut" style="display:flex; flex-direction:column; align-items:center; gap:5px; flex:1;">
            <div style="display:flex; align-items:center;">
                <img src="prev.png" id="prev" style="cursor:pointer">
                <img src="pause.png" id="playpause" style="cursor:pointer">
                <img src="next.png" id="next" style="cursor:pointer">
            </div>
            <div style="display:flex; align-items:center; gap: 10px; width: 400px; font-size: 12px; color: #b3b3b3;">
                <span id="current-time">0:00</span>
                <input type="range" id="seek-bar" value="0" max="100" style="width: 100%; cursor: pointer;">
                <span id="total-time">0:00</span>
            </div>
        </div>
        <div style="position:absolute; right:20px; display:flex; align-items:center; gap:10px;">
            <img src="play.png" height="20" style="filter: invert(1);" id="mute-btn" alt="Volume">
            <input type="range" id="volume-bar" value="${audio.volume * 100}" max="100" style="cursor: pointer; width: 100px;">
        </div>
    `;

    addControls(); // âœ… important: reconnect buttons

    // --- Reset all song items ---
    document.querySelectorAll(".song-item").forEach((item, i) => {
      item.classList.remove("active");
      let oldEq = item.querySelector(".equalizer");
      if (oldEq) {
        // replace equalizer with play button again
        let playBtn = document.createElement("img");
        playBtn.src = "playbutt.png";
        playBtn.className = "play-song";
        playBtn.height = 40;
        playBtn.style.cursor = "pointer";
        playBtn.setAttribute("data-index", i);

        playBtn.addEventListener("click", () => {
          playSong(i);
        });

        oldEq.replaceWith(playBtn);
      }
    });

    // âœ… Highlight current song
    let activeItem = document.querySelectorAll(".song-item")[currentSongIndex];
    if (activeItem) {
      activeItem.classList.add("active");
      let eq = document.createElement("div");
      eq.className = "equalizer";
      eq.innerHTML = `<span></span><span></span><span></span>`;
      let oldBtn = activeItem.querySelector("img.play-song");
      if (oldBtn) {
        oldBtn.replaceWith(eq);
      }
    }
    // ✅ Full view on playbar cover click
    document.getElementById("playbar-cover").addEventListener("click", () => {
      showNowPlaying(currentPlaylist[currentSongIndex]);
    });

    if (isFullViewOpen) {
      showNowPlaying(currentPlaylist[currentSongIndex], true);
    }
  }

  let isFullViewOpen = false; // globally define

  function getBrightness([r, g, b]) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  function showNowPlaying(song, forceUpdate = false) {
    const rightDiv = document.querySelector(".right");

    // ✅ Agar full view open hai aur sirf update karna hai (song change hua)
    if (isFullViewOpen && forceUpdate) {
      const cover = document.getElementById("np-cover");
      const title = rightDiv.querySelector(".now-playing h2");
      const singer = rightDiv.querySelector(".now-playing p");

      if (cover) cover.src = song.cover;
      if (title)
        title.textContent = decodeURIComponent(
          song.src.split("/").pop().replace(".mp3", "")
        );
      if (singer) singer.textContent = song.singer;
      return;
    }

    // ✅ Agar full view open hai aur user cover pe click kare → toggle off
    if (isFullViewOpen && !forceUpdate) {
      showHomeUI();
      isFullViewOpen = false;
      return;
    }

    // ✅ Pehli baar open karna ho toh full UI inject karo
    rightDiv.innerHTML = `
    <div class="now-playing" id="np-container">
        <img src="${song.cover}" class="now-playing-cover" id="np-cover">
        <h2>${decodeURIComponent(
          song.src.split("/").pop().replace(".mp3", "")
        )}</h2>
        <p>${song.singer}</p> <!-- ✅ singer name add -->
    </div>
  `;

    requestAnimationFrame(() => {
      const coverImg = document.getElementById("np-cover");
      const npContainer = document.getElementById("np-container");
      if (!coverImg || !npContainer) return;

      coverImg.crossOrigin = "anonymous";

      const applyGradient = () => {
        try {
          const colorThief = new ColorThief();
          const palette = colorThief.getPalette(coverImg, 2);
          if (palette) {
            const [c1, c2] = palette;
            npContainer.style.background = `linear-gradient(to bottom, rgb(${c1.join(
              ","
            )}), rgb(${c2.join(",")}))`;
          }
        } catch (err) {
          npContainer.style.background =
            "linear-gradient(to bottom, #1e1e1e, black)";
        }
      };

      if (coverImg.complete) {
        applyGradient();
      } else {
        coverImg.onload = applyGradient;
      }
    });

    isFullViewOpen = true;
  }

  // Function to handle playlist clicks and update UI
  function setupPlaylistClicks() {
    document.querySelectorAll(".addplaylists ul li").forEach((item) => {
      item.addEventListener("click", () => {
        // Remove 'active-playlist' class from all list items first
        document.querySelectorAll(".addplaylists ul li").forEach((li) => {
          li.classList.remove("active-playlist");
        });

        // Add 'active-playlist' class to the clicked list item
        item.classList.add("active-playlist");

        let playlistName = item.innerText.trim().split("\n")[0];
        if (playlists[playlistName]) {
          currentPlaylist = playlists[playlistName];
          showPlaylistUI(playlistName);
        }
      });
    });
  }

  function setupAlbumClicks() {
    document.querySelectorAll(".card").forEach((card) => {
      const title = card.querySelector("h3").innerText.trim();

      // Agar title albums me mila → Album UI kholo
      if (albums[title]) {
        card.addEventListener("click", () => {
          showAlbumUI(title);
        });
      }
      // Agar title newReleases me mila → direct play
      else if (newReleases[title]) {
        card.addEventListener("click", () => {
          let song = newReleases[title];
          currentPlaylist = [song]; // ek hi song ka playlist
          playSong(0);
        });
      }
    });
  }

  // Playbar controls
  function addControls() {
    document.getElementById("playpause").addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
        document.getElementById("playpause").src = "pause.png";
      } else {
        audio.pause();
        document.getElementById("playpause").src = "play.png";
      }
    });

    document.getElementById("next").addEventListener("click", () => {
      currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
      playSong(currentSongIndex);
    });

    document.getElementById("prev").addEventListener("click", () => {
      currentSongIndex =
        (currentSongIndex - 1 + currentPlaylist.length) %
        currentPlaylist.length;
      playSong(currentSongIndex);
    });

    let seekBar = document.getElementById("seek-bar");
    if(seekBar) {
      seekBar.addEventListener("input", (e) => {
        if(!isNaN(audio.duration)) {
          audio.currentTime = (e.target.value / 100) * audio.duration;
        }
      });
    }

    let volumeBar = document.getElementById("volume-bar");
    if(volumeBar) {
      volumeBar.addEventListener("input", (e) => {
        audio.volume = e.target.value / 100;
      });
    }
  }

  // Attach click to playlists
  document.querySelectorAll(".addplaylists ul li").forEach((item) => {
    item.addEventListener("click", () => {
      let playlistName = item.innerText.trim().split("\n")[0];
      if (playlists[playlistName]) {
        currentPlaylist = playlists[playlistName];
        playSong(0);
      }
    });
  });

  setupPlaylistClicks();

  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      const albumName = card.querySelector("h3").innerText.trim();
      if (albums[albumName]) {
        showAlbumUI(albumName);
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault(); // scroll hone se rokne ke liye
      if (audio.paused) {
        audio.play();
        if (document.getElementById("playpause")) {
          document.getElementById("playpause").src = "pause.png";
        }
      } else {
        audio.pause();
        if (document.getElementById("playpause")) {
          document.getElementById("playpause").src = "play.png";
        }
      }
    }
  });

  // Desktop Search Setup
  const searchInput = document.querySelector('.search input[name="search"]');
  const searchContainer = document.querySelector('.search');
  if(searchInput && searchContainer) {
    const suggestionsBox = document.createElement('div');
    suggestionsBox.className = 'suggestions-box';
    suggestionsBox.style.display = 'none';
    suggestionsBox.style.position = 'absolute';
    suggestionsBox.style.top = '100%';
    suggestionsBox.style.left = '10px';
    suggestionsBox.style.width = 'calc(100% - 20px)';
    suggestionsBox.style.zIndex = '1000';
    searchContainer.appendChild(suggestionsBox);

    searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase().trim();
      if (query.length === 0) {
        suggestionsBox.style.display = 'none';
        return;
      }
      // using allSongs which is defined at the bottom
      const results = allSongs.filter(song => 
        song.title.toLowerCase().includes(query) || 
        song.artist.toLowerCase().includes(query)
      );

      if (results.length === 0) {
        suggestionsBox.innerHTML = '<div style="padding:10px; color:gray;">No results found</div>';
      } else {
        let resultsHTML = '';
        results.forEach((song, idx) => {
          resultsHTML += `
            <div class="suggestion-item" data-idx="${idx}" style="display:flex; align-items:center; gap:10px; padding:10px; cursor:pointer;">
              <img src="${song.cover}" style="height:40px; width:40px; border-radius:5px; object-fit:cover;">
              <div>
                <p style="margin:0; font-weight:bold; color:white; font-size:14px;">${song.title}</p>
                <p style="margin:0; font-size:12px; color:gray;">${song.artist}</p>
              </div>
            </div>
          `;
        });
        suggestionsBox.innerHTML = resultsHTML;

        suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
          item.addEventListener('click', function() {
            const songIdx = parseInt(this.getAttribute('data-idx'));
            const song = results[songIdx];
            currentPlaylist = [{ src: song.src, cover: song.cover, singer: song.artist }];
            playSong(0);
            suggestionsBox.style.display = 'none';
            searchInput.value = '';
          });
        });
      }
      suggestionsBox.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
      if (!searchContainer.contains(e.target)) {
        suggestionsBox.style.display = 'none';
      }
    });
  }

  // SurTaal logo click = home
  document.querySelector(".img img").addEventListener("click", () => {
    showHome();
  });

  // Home icon click = home
  const homeIcon = document.querySelector(".homenav img");
  if (homeIcon) {
    homeIcon.addEventListener("click", () => {
      showHome();
    });
  }

  let homeContent = document.querySelector(".right").innerHTML;
  function showHome() {
    let rightDiv = document.querySelector(".right");
    rightDiv.innerHTML = homeContent;

    // âœ… Sabhi playlists se active class hatao
    document.querySelectorAll(".addplaylists ul li").forEach((li) => {
      li.classList.remove("active-playlist");
    });
  }

  function showHomeUI() {
    const rightDiv = document.querySelector(".right");
    rightDiv.innerHTML = `
    <div class="playlist">
      <div class="playhead">
        <h1>Top Weekly Album's</h1>
      </div>

      <div class="cardcontainer">
        <div class="card">
          <div class="playbut">
            <img src="playbutt.png" height="50" alt="play">
          </div>
          <img src="https://i.scdn.co/image/ab67616d00001e02a7e251b543c77a6ed356dfbe" alt="">
          <h3>Saiyaara</h3>
          <p>Album</p>
        </div>
        <div class="card">
          <div class="playbut">
            <img src="playbutt.png" height="50" alt="play">
          </div>
          <img src="glory.jpg" alt="">
          <h3>The Glory</h3>
          <p>Album</p>
        </div>
        <div class="card">
            <div class="playbut">
                <img src="playbutt.png" height="50px">
            </div>
                <img src="https://i.scdn.co/image/ab67616d00001e028fa95e3e74799cb0b2a1fb57">
                <h3>51 Glorious Days</h3>
                <p>Album</p>

        </div>

        <div class="card">
            <div class="playbut">
                <img src="playbutt.png" height="50px">
            </div>
                <img src="https://i.scdn.co/image/ab67706f00000002902ab96d7cae873f5c253fff">
                <h3>Haryanvi Workout</h3>
                <p>Album</p>

        </div>

        <div class="card">
            <div class="playbut">
                <img src="playbutt.png" height="50px">
            </div>
            <img src="https://i.scdn.co/image/ab67706f0000000203b72ae3caf435bd1f95fbd5">
            <h3>Bollywood & Chill</h3>
            <p>Album</p>

        </div>
      </div>

      <div class="playhead">
        <h1>New Releases</h1>
      </div>

      <div class="cardcontainer">
        <div class="card">
          <div class="playbut">
            <img src="playbutt.png" height="50" alt="play">
          </div>
          <img src="https://lh3.googleusercontent.com/LEdbfSC9xh9S-N-uRQ7iJPlJQLi9OUyOUX4oJ0sAiFuOf4g01B94FD9NzPdDkn5hpFrms2HmrpKPJle5=w544-h544-l90-rj" alt="">
          <h3>Haseen</h3>
          <p>Talwinder</p>
        </div>
        <div class="card">
          <div class="playbut">
            <img src="playbutt.png" height="50" alt="play">
          </div>
          <img src="https://pagalnew.com/coverimages/bijuria-sunny-sanskari-ki-tulsi-kumari-500-500.jpg" alt="">
          <h3>Bijuria</h3>
          <p>Sonu Nigam, Asees Kaur</p>
        </div>
        <div class="card">
            <div class="playbut">
                <img src="playbutt.png" height="50px">
            </div>
                <img src="https://lh3.googleusercontent.com/p2-NRHoGI6J_-_tCSCFOt9N-PodFYHrTwWf2xKax1dEa35gsfhvcLZwUxNflxOROjgW9_6Sed9Va8o8bCg=w544-h544-l90-rj">
                <h3>Panwadi</h3>
                <p>Khesari Lal Yadav</p>

        </div>

        <div class="card">
            <div class="playbut">
                <img src="playbutt.png" height="50px">
            </div>
                <img src="https://i.scdn.co/image/ab67616d00001e02203e6495a78184970ab274ac">
                <h3>Azul</h3>
                <p>Guru Randhawa</p>

        </div>

        <div class="card">
            <div class="playbut">
                <img src="playbutt.png" height="50px">
            </div>
            <img src="https://pagalnew.com/coverimages/perfect-sunny-sanskari-ki-tulsi-kumari-500-500.jpg">
            <h3>Perfect</h3>
            <p>Guru Randhawa</p>

        </div>
      </div>
    </div>
  `;
    // ✅ Reset active-playlist highlight
    document.querySelectorAll(".addplaylists ul li").forEach((li) => {
      li.classList.remove("active-playlist");
    });

    // ✅ Reattach album & playlist clicks
    setupAlbumClicks();
    setupPlaylistClicks();
  }

  // Home click
  document.querySelectorAll(".img img, .homenav img").forEach((el) => {
    el.addEventListener("click", () => {
      showHomeUI(); // <-- agar reload use kar rahe ho, toh isme dobara main() chalega aur setupAlbumClicks() bhi chalega
    });
  });

  function showPlaylistUI(playlistName) {
    let playlist = playlists[playlistName];
    if (!playlist) return;

    // Playlist cover (ab alag property hai)
    let coverImg = playlist.cover;

    let rightDiv = document.querySelector(".right");
    rightDiv.innerHTML = `
    <div class="playlist-header">
        <img src="${coverImg}" class="playlist-cover">
        <div class="playlist-info">
            <p style="font-size:12px; color:gray; margin:0;">Playlist</p>
            <h1 style="margin:5px 0; font-size:40px;">${playlistName}</h1>
            <p style="margin:0; color:gray; font-size:14px;">${playlist.songs.length} songs</p>
            
            <!-- Play All Button -->
            <img src="playbutt.png" id="play-all" height="60" style="margin-top:20px; cursor:pointer;">
        </div>
    </div>
    <div class="song-list"></div>
    `;

    let songListDiv = rightDiv.querySelector(".song-list");

    playlist.songs.forEach((song, index) => {
      let songItem = document.createElement("div");
      songItem.classList.add("song-item");
      songItem.innerHTML = `
        <img src="${song.cover}" height="50" style="border-radius:6px;">
        <div style="flex:1; margin-left:10px;">
            <p style="margin:0; color:white; font-weight:bold;">
                ${decodeURIComponent(
                  song.src.split("/").pop().replace(".mp3", "")
                )}
            </p>
            <p style="margin:0; color:gray; font-size:12px;">
                ${song.singer}
            </p>
        </div>
      `;

      let playBtn = document.createElement("img");
      playBtn.src = "playbutt.png";
      playBtn.className = "play-song";
      playBtn.height = 40;
      playBtn.style.cursor = "pointer";
      playBtn.setAttribute("data-index", index);

      // Yahi pe listener laga do ðŸ‘‡
      playBtn.addEventListener("click", () => {
        currentPlaylist = playlist.songs;
        playSong(index);
      });

      songItem.appendChild(playBtn);

      songListDiv.appendChild(songItem);
    });

    // âœ… Restore active song state if this playlist is currently playing
    // âœ… Restore playing effect if this playlist is active
    if (playlistName === currentPlaylistName) {
      let allItems = rightDiv.querySelectorAll(".song-item");
      allItems.forEach((item, i) => {
        let song = playlist.songs[i];
        if (song.src === currentSongSrc) {
          // âœ… exact src match
          item.classList.add("active");

          let eq = document.createElement("div");
          eq.className = "equalizer";
          eq.innerHTML = `<span></span><span></span><span></span>`;

          let oldBtn = item.querySelector("img.play-song");
          if (oldBtn) {
            oldBtn.replaceWith(eq);
          }
        }
      });
    }

    // Play All button â†’ sidha playlist set karo aur pehla song bajao
    document.getElementById("play-all").addEventListener("click", () => {
      currentPlaylist = playlist.songs; // âœ… ab playlist set hogi
      currentPlaylistName = playlistName; // âœ… naam bhi save hoga
      currentSongIndex = 0; // âœ… index reset
      playSong(0); // âœ… pehla song bajega
    });

    // Play button listener
    document.querySelectorAll(".play-song").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        currentPlaylist = playlist.songs;
        playSong(parseInt(e.target.getAttribute("data-index")));
      });
    });
  }

  function showAlbumUI(albumName) {
    const album = albums[albumName];
    if (!album) return;

    currentPlaylist = album.songs;
    currentPlaylistName = albumName;

    const rightDiv = document.querySelector(".right");
    rightDiv.innerHTML = `
    <div class="playlist-header">
        <img src="${album.cover}" class="playlist-cover" />
        <div class="playlist-info">
            <p style="font-size:12px; color:gray; margin:0;">Album</p>
            <h1 style="margin:5px 0; font-size:40px;">${albumName}</h1>
            <p style="margin:0; color:gray; font-size:14px;">${album.songs.length} songs</p>
            <img src="playbutt.png" id="play-all" height="60" style="margin-top:20px; cursor:pointer;">
        </div>
    </div>
    <div class="song-list"></div>
  `;

    const songListDiv = rightDiv.querySelector(".song-list");
    album.songs.forEach((song, index) => {
      const songItem = document.createElement("div");
      songItem.className = "song-item";
      songItem.innerHTML = `
        <img src="${song.cover}" height="50" style="border-radius:6px;">
        <div style="flex:1; margin-left:10px;">
            <p style="margin:0; color:white; font-weight:bold;">
              ${decodeURIComponent(
                song.src.split("/").pop().replace(".mp3", "")
              )}
            </p>
            <p style="margin:0; color:gray; font-size:12px;">${song.singer}</p>
        </div>
    `;

      const playBtn = document.createElement("img");
      playBtn.src = "playbutt.png";
      playBtn.className = "play-song";
      playBtn.height = 40;
      playBtn.style.cursor = "pointer";
      playBtn.dataset.index = index;
      playBtn.onclick = () => {
        currentPlaylist = album.songs;
        playSong(index);
      };

      songItem.appendChild(playBtn);
      songListDiv.appendChild(songItem);
    });

    // Play all
    const playAll = document.getElementById("play-all");
    if (playAll)
      playAll.onclick = () => {
        currentPlaylist = album.songs;
        currentSongIndex = 0;
        playSong(0);
      };

    // ✅ Restore active song state if this album is currently playing
    if (albumName === currentPlaylistName) {
      let allItems = rightDiv.querySelectorAll(".song-item");
      allItems.forEach((item, i) => {
        let song = album.songs[i];
        if (song.src === currentSongSrc) {
          item.classList.add("active");

          let eq = document.createElement("div");
          eq.className = "equalizer";
          eq.innerHTML = `<span></span><span></span><span></span>`;

          let oldBtn = item.querySelector("img.play-song");
          if (oldBtn) {
            oldBtn.replaceWith(eq);
          }
        }
      });
    }
  }

  function setupSearch() {
    const searchInput = document.querySelector(".search input");
    if (!searchInput) return;

    // 🔥 Suggestions container
    const suggestionsBox = document.createElement("div");
    suggestionsBox.className = "suggestions-box";
    document.querySelector(".search").style.position = "relative"; // parent ko relative banaya
    document.querySelector(".search").appendChild(suggestionsBox);
    suggestionsBox.style.position = "absolute";
    suggestionsBox.style.background = "#1a1a1a";
    suggestionsBox.style.color = "white";
    suggestionsBox.style.width = "300px";
    suggestionsBox.style.maxHeight = "250px";
    suggestionsBox.style.overflowY = "auto";
    suggestionsBox.style.borderRadius = "8px";
    suggestionsBox.style.boxShadow = "0 4px 10px rgba(0,0,0,0.5)";
    suggestionsBox.style.display = "none";
    suggestionsBox.style.zIndex = "1000";
    document.querySelector(".search").appendChild(suggestionsBox);
    const inputRect = searchInput.getBoundingClientRect();
    suggestionsBox.style.width = searchInput.offsetWidth + "px";

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      suggestionsBox.innerHTML = "";
      if (!query) {
        suggestionsBox.style.display = "none";
        return;
      }

      let suggestions = [];

      // Albums
      Object.keys(albums).forEach((albumName) => {
        if (albumName.toLowerCase().includes(query)) {
          suggestions.push({
            type: "album",
            name: albumName,
            cover: albums[albumName].cover,
          });
        }
        albums[albumName].songs.forEach((song) => {
          if (
            song.src.toLowerCase().includes(query) ||
            song.singer.toLowerCase().includes(query)
          ) {
            suggestions.push({
              type: "song",
              name: song.src.split("/").pop().replace(".mp3", ""),
              singer: song.singer,
              cover: song.cover,
              src: song.src,
            });
          }
        });
      });

      // Playlists
      Object.keys(playlists).forEach((plistName) => {
        if (plistName.toLowerCase().includes(query)) {
          suggestions.push({
            type: "playlist",
            name: plistName,
            cover: playlists[plistName].cover,
          });
        }
        playlists[plistName].songs.forEach((song) => {
          if (
            song.src.toLowerCase().includes(query) ||
            song.singer.toLowerCase().includes(query)
          ) {
            suggestions.push({
              type: "song",
              name: song.src.split("/").pop().replace(".mp3", ""),
              singer: song.singer,
              cover: song.cover,
              src: song.src,
            });
          }
        });
      });

      // Suggestions UI
      if (suggestions.length > 0) {
        suggestionsBox.style.display = "block";
        suggestions.forEach((res) => {
          let item = document.createElement("div");
          item.style.padding = "10px";
          item.style.cursor = "pointer";
          item.style.display = "flex";
          item.style.alignItems = "center";
          item.style.gap = "10px";
          item.innerHTML = `<img src="${res.cover}" width="40" style="border-radius:6px;"> <span>${res.name}</span>`;

          item.addEventListener("click", () => {
            searchInput.value = "";
            suggestionsBox.style.display = "none";

            if (res.type === "song") {
              currentPlaylist = [res]; // ✅ direct song play
              playSong(0);
            } else if (res.type === "album") {
              showAlbumUI(res.name);
            } else if (res.type === "playlist") {
              showPlaylistUI(res.name);
            }
          });
          suggestionsBox.appendChild(item);
        });
      } else {
        suggestionsBox.style.display = "none";
      }
    });

    // Enter key → show full results page
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          showHomeUI();
          return;
        }

        let results = [];

        // Albums
        Object.keys(albums).forEach((albumName) => {
          if (albumName.toLowerCase().includes(query)) {
            results.push({
              type: "album",
              name: albumName,
              cover: albums[albumName].cover,
            });
          }
          albums[albumName].songs.forEach((song) => {
            if (
              song.src.toLowerCase().includes(query) ||
              song.singer.toLowerCase().includes(query)
            ) {
              results.push({
                type: "song",
                name: song.src.split("/").pop().replace(".mp3", ""),
                singer: song.singer,
                cover: song.cover,
                src: song.src,
              });
            }
          });
        });

        // Playlists
        Object.keys(playlists).forEach((plistName) => {
          if (plistName.toLowerCase().includes(query)) {
            results.push({
              type: "playlist",
              name: plistName,
              cover: playlists[plistName].cover,
            });
          }
          playlists[plistName].songs.forEach((song) => {
            if (
              song.src.toLowerCase().includes(query) ||
              song.singer.toLowerCase().includes(query)
            ) {
              results.push({
                type: "song",
                name: song.src.split("/").pop().replace(".mp3", ""),
                singer: song.singer,
                cover: song.cover,
                src: song.src,
              });
            }
          });
        });

        // ✅ Results page
        const rightDiv = document.querySelector(".right");
        rightDiv.innerHTML = `<div class="search-results"><h1>Search Results</h1><div class="cardcontainer"></div></div>`;
        const container = rightDiv.querySelector(".cardcontainer");

        if (results.length === 0) {
          container.innerHTML = `<p style="color:gray;">No results found</p>`;
        } else {
          results.forEach((res) => {
            let card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
            <img src="${res.cover}" />
            <h3>${res.name}</h3>
            <p>${res.singer || res.type}</p>
          `;
            card.addEventListener("click", () => {
              if (res.type === "song") {
                currentPlaylist = [res];
                playSong(0);
              } else if (res.type === "album") {
                showAlbumUI(res.name);
              } else if (res.type === "playlist") {
                showPlaylistUI(res.name);
              }
            });
            container.appendChild(card);
          });
        }
      }
    });
  }

  // 🔥 call this inside main()
  setupSearch();
}

// ===== HAMBURGER MENU FUNCTIONALITY =====

// Hamburger menu toggle functionality
function initHamburgerMenu() {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const leftSidebar = document.getElementById('left-sidebar');
    const closeSidebar = document.getElementById('close-sidebar');
    const body = document.body;

    // Toggle sidebar when hamburger is clicked
    hamburgerMenu.addEventListener('click', function() {
        leftSidebar.classList.toggle('sidebar-open');
        hamburgerMenu.classList.toggle('active');
        
        // Prevent body scroll when sidebar is open
        if (leftSidebar.classList.contains('sidebar-open')) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = 'auto';
        }
    });

    // Close sidebar when close button is clicked
    closeSidebar.addEventListener('click', function() {
        leftSidebar.classList.remove('sidebar-open');
        hamburgerMenu.classList.remove('active');
        body.style.overflow = 'auto';
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            if (!leftSidebar.contains(event.target) && 
                !hamburgerMenu.contains(event.target) && 
                leftSidebar.classList.contains('sidebar-open')) {
                leftSidebar.classList.remove('sidebar-open');
                hamburgerMenu.classList.remove('active');
                body.style.overflow = 'auto';
            }
        }
    });

    // Close sidebar on window resize if screen becomes larger
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            leftSidebar.classList.remove('sidebar-open');
            hamburgerMenu.classList.remove('active');
            body.style.overflow = 'auto';
        }
    });
}

// ===== MOBILE TASKBAR FUNCTIONALITY =====

// Initialize mobile taskbar
function initMobileTaskbar() {
    const taskbarTabs = document.querySelectorAll('.taskbar-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    taskbarTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            taskbarTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
        });
    });
}

// Populate mobile library with playlist data
function populateMobileLibrary() {
    const libraryPlaylists = document.querySelector('.library-playlists');
    
    const playlists = [
        {
            name: "Liked Songs",
            type: "Playlist",
            image: "https://www.gstatic.com/youtube/media/ytm/images/pbg/liked-music-@1200.png",
            songs: [
                { title: 'Ghafoor', artist: 'Various Artists', cover: 'Covers/ghafoor.jpg', src: 'Songs/Liked Songs/Ghafoor.mp3' }
            ]
        },
        {
            name: "P-POP CULTURE",
            type: "Playlist", 
            image: "popculture.jpg",
            songs: [
                { title: '7.7 Magnitude', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/7.7 Magnitude.mp3' },
                { title: 'Boyfriend', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/Boyfriend.mp3' },
                { title: 'Daytona', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/Daytona.mp3' },
                { title: 'Flip Side (Sandy\'s Interlude)', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/Flip Side (Sandy\'s Interlude).mp3' },
                { title: 'For A Reason', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/For A Reason.mp3' },
                { title: 'HIM', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/HIM.mp3' },
                { title: 'I Really Do....', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/I Really Do....mp3' },
                { title: 'I\'ma Do My Thiiing', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/I\'ma Do My Thiiing.mp3' },
                { title: 'Mf Gabhru', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/Mf Gabhru.mp3' },
                { title: 'P-POP CULTURE', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/P-POP CULTURE.mp3' },
                { title: 'You\'re U Tho', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/You\'re U Tho.mp3' }
            ]
        },
        {
            name: "Ishq aur Tanhai",
            type: "Playlist",
            image: "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000d72c9ae67d801ce4b277bc9a0160",
            songs: [
                { title: 'Isq Risk', artist: 'Various Artists', cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000d72c9ae67d801ce4b277bc9a0160', src: 'Songs/Ishq aur Tanhai/Isq Risk.mp3' },
                { title: 'Maula Mere Maula', artist: 'Various Artists', cover: 'Covers/maula.jpg', src: 'Songs/Ishq aur Tanhai/Maula Mere Maula.mp3' },
                { title: 'O Re Piya', artist: 'Various Artists', cover: 'Covers/o re.jpg', src: 'Songs/Ishq aur Tanhai/O Re Piya.mp3' },
                { title: 'Phir Mohabbat', artist: 'Various Artists', cover: 'Covers/phir.jpg', src: 'Songs/Ishq aur Tanhai/Phir Mohabbat.mp3' }
            ]
        },
        {
            name: "80's-90's",
            type: "Playlist",
            image: "80's.jpg",
            songs: [
                { title: 'Aankhein Khuli', artist: 'Various Artists', cover: 'Covers/aankhein.jpg', src: 'Songs/old/Aankhein Khuli.mp3' },
                { title: 'Dil Ne Yeh Kaha Hain Dil Se', artist: 'Various Artists', cover: 'Covers/dil.jpg', src: 'Songs/old/Dil Ne Yeh Kaha Hain Dil Se.mp3' },
                { title: 'O Meri Mehbooba', artist: 'Various Artists', cover: 'Covers/o meri.jpg', src: 'Songs/old/O Meri Mehbooba.mp3' },
                { title: 'Ruk Ja O Dil Deewane', artist: 'Various Artists', cover: 'Covers/ruk.jpg', src: 'Songs/old/Ruk Ja O Dil Deewane.mp3' }
            ]
        },
        {
            name: "Punjabi Pump",
            type: "Playlist",
            image: "https://i.scdn.co/image/ab67706f00000002d5d2003959d642758be307d6",
            songs: [
                { title: '0008', artist: 'Various Artists', cover: 'Covers/0008.jpg', src: 'Songs/Punjabi Pump/0008.mp3' },
                { title: 'Greatest', artist: 'Various Artists', cover: 'Covers/greatest.jpg', src: 'Songs/Punjabi Pump/Greatest.mp3' },
                { title: 'Gunda', artist: 'Various Artists', cover: 'Covers/gunda.jpg', src: 'Songs/Punjabi Pump/Gunda.mp3' },
                { title: 'Wavy', artist: 'Various Artists', cover: 'Covers/wavy.jpg', src: 'Songs/Punjabi Pump/Wavy.mp3' }
            ]
        }
    ];
    
    playlists.forEach(playlist => {
        const playlistItem = document.createElement('div');
        playlistItem.className = 'library-playlist-item';
        playlistItem.onclick = function() {
            loadPlaylistContent(playlist.name, playlist.songs);
        };
        playlistItem.innerHTML = `
            <img src="${playlist.image}" alt="${playlist.name}">
            <div class="library-playlist-info">
                <h3>${playlist.name}</h3>
                <p>${playlist.type}</p>
            </div>
        `;
        libraryPlaylists.appendChild(playlistItem);
    });
}

// Load playlist content
function loadPlaylistContent(playlistName, songs) {
    const libraryTab = document.getElementById('library-tab');
    
    // Set current playlist for next/prev functionality
    mobileCurrentPlaylist = songs;
    mobileCurrentPlaylistName = playlistName;
    
    let songsHTML = '';
    songs.forEach((song, index) => {
        songsHTML += `
            <div class="song-item" onclick="playSong('${song.title}', '${song.artist}', '${song.cover}', '${song.src}')">
                <img src="${song.cover}" alt="${song.title}">
                <div class="song-info">
                    <h3>${song.title}</h3>
                    <p>${song.artist}</p>
                </div>
            </div>
        `;
    });
    
    const playlistView = document.createElement('div');
    playlistView.className = 'mobile-album-view';
    playlistView.innerHTML = `
        <div class="album-header">
            <button class="back-btn" onclick="showLibraryContent()">← Back</button>
            <h1>${playlistName}</h1>
        </div>
        <div class="album-songs">
            ${songsHTML}
        </div>
    `;
    
    libraryTab.innerHTML = '';
    libraryTab.appendChild(playlistView);
}

// Show library content
function showLibraryContent() {
    const libraryTab = document.getElementById('library-tab');
    
    // Recreate the original library content
    libraryTab.innerHTML = `
        <div class="mobile-library-content">
            <h2>Your Library</h2>
            <div class="library-playlists">
                <!-- Playlists will be populated here -->
            </div>
        </div>
    `;
    
    // Repopulate the library
    populateMobileLibrary();
}

// Populate mobile home with main content
function populateMobileHome() {
    const homeContent = document.querySelector('.mobile-home-content');
    
    // Get the main content from the right div and move it to mobile home
    const rightDiv = document.querySelector('.right');
    if (rightDiv) {
        const playlistContent = rightDiv.innerHTML;
        homeContent.innerHTML = playlistContent;
        
        // Re-initialize card functionality for mobile
        initializeMobileCards();
        // Add side-scroll buttons for album rows
        initializeSideScroll();
    }
}

// Initialize mobile cards with PC functionality
function initializeMobileCards() {
    // Map of mobile new releases to their actual files
    const mobileNewReleases = {
        'Haseen': {
            title: 'Haseen',
            artist: 'Talwinder',
            cover: 'Covers/haseen.jpeg',
            src: 'Songs/New Releases/Haseen.mp3'
        },
        'Bijuria': {
            title: 'Bijuria',
            artist: 'Sonu Nigam, Asees Kaur',
            cover: 'Covers/bijuria.jpg',
            src: 'Songs/New Releases/Bijuria.mp3'
        },
        'Panwadi': {
            title: 'Panwadi',
            artist: 'Khesari Lal Yadav',
            cover: 'Covers/panwadi.jpg',
            src: 'Songs/New Releases/Panwadi.mp3'
        },
        'Azul': {
            title: 'Azul',
            artist: 'Guru Randhawa',
            cover: 'Covers/azul.jpeg',
            src: 'Songs/New Releases/Azul.mp3'
        },
        'Perfect': {
            title: 'Perfect',
            artist: 'Guru Randhawa',
            cover: 'Covers/perfect.jpg',
            src: 'Songs/New Releases/Perfect.mp3'
        }
    };

    const cards = document.querySelectorAll('.mobile-home-content .card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h3').textContent.trim();
            console.log('Mobile card clicked:', title);

            // If it's a New Release single, play directly
            if (mobileNewReleases[title]) {
                const s = mobileNewReleases[title];
                playSong(s.title, s.artist, s.cover, s.src);
                return;
            }

            // Otherwise treat as album and load album view
            loadAlbumContent(title);
        });
    });
}

// Global variables for mobile music player
let mobileCurrentPlaylist = [];
let mobileCurrentPlaylistName = "";
let mobileCurrentSongIndex = 0;
let mobileCurrentSongSrc = "";
let mobileAudio = null;

// Load album content (same as PC functionality)
function loadAlbumContent(albumName) {
    console.log('Loading album:', albumName);
    
    const homeTab = document.getElementById('home-tab');
    
    // Get album data with actual MP3 file paths
    const albums = {
        'Saiyaara': {
            cover: 'https://i.scdn.co/image/ab67616d00001e02a7e251b543c77a6ed356dfbe',
            songs: [
                { title: 'Saiyaara', artist: 'Faheem Abdullah', cover: 'https://i.scdn.co/image/ab67616d00001e02a7e251b543c77a6ed356dfbe', src: 'Songs/Albums/Saiyaara/Saiyaara.mp3' },
                { title: 'Barbaad', artist: 'Jubin Nautiyal', cover: 'Covers/barbaad.jpg', src: 'Songs/Albums/Saiyaara/Barbaad.mp3' },
                { title: 'Dhun', artist: 'Arijit Singh', cover: 'Covers/dhun.jpg', src: 'Songs/Albums/Saiyaara/Dhun.mp3' },
                { title: 'Tum Ho Toh', artist: 'Various Artists', cover: 'Covers/tum ho toh.jpg', src: 'Songs/Albums/Saiyaara/Tum Ho Toh.mp3' }
            ]
        },
        'The Glory': {
            cover: 'glory.jpg',
            songs: [
                { title: 'Bonita', artist: 'Various Artists', cover: 'glory.jpg', src: 'Songs/Albums/The Glory/Bonita.mp3' },
                { title: 'High On Me', artist: 'Various Artists', cover: 'glory.jpg', src: 'Songs/Albums/The Glory/High On Me.mp3' },
                { title: 'Millionaire', artist: 'Various Artists', cover: 'glory.jpg', src: 'Songs/Albums/The Glory/Millionaire.mp3' },
                { title: 'Payal', artist: 'Various Artists', cover: 'glory.jpg', src: 'Songs/Albums/The Glory/Payal.mp3' }
            ]
        },
        '51 Glorious Days': {
            cover: 'https://i.scdn.co/image/ab67616d00001e028fa95e3e74799cb0b2a1fb57',
            songs: [
                { title: 'Aadat', artist: 'Various Artists', cover: 'https://i.scdn.co/image/ab67616d00001e028fa95e3e74799cb0b2a1fb57', src: 'Songs/Albums/51 Glorious Days/Aadat.mp3' },
                { title: 'Compro', artist: 'Various Artists', cover: 'https://i.scdn.co/image/ab67616d00001e028fa95e3e74799cb0b2a1fb57', src: 'Songs/Albums/51 Glorious Days/Compro.mp3' },
                { title: 'Glorious Days', artist: 'Various Artists', cover: 'https://i.scdn.co/image/ab67616d00001e028fa95e3e74799cb0b2a1fb57', src: 'Songs/Albums/51 Glorious Days/Glorious Days.mp3' },
                { title: 'Mafia', artist: 'Various Artists', cover: 'https://i.scdn.co/image/ab67616d00001e028fa95e3e74799cb0b2a1fb57', src: 'Songs/Albums/51 Glorious Days/Mafia.mp3' }
            ]
        },
        'Haryanvi Workout': {
            cover: 'https://i.scdn.co/image/ab67706f00000002902ab96d7cae873f5c253fff',
            songs: [
                { title: '2 Numbari', artist: 'Various Artists', cover: 'Covers/2 numbari.jpg', src: 'Songs/Albums/Haryanvi Workout/2 Numbari.mp3' },
                { title: 'Haryana Hood', artist: 'Various Artists', cover: 'Covers/haryana hood.jpg', src: 'Songs/Albums/Haryanvi Workout/Haryana Hood.mp3' },
                { title: 'No Fluke', artist: 'Various Artists', cover: 'Covers/no fluke.jpg', src: 'Songs/Albums/Haryanvi Workout/No Fluke.mp3' },
                { title: 'Russian Bandana', artist: 'Various Artists', cover: 'Covers/russian bhandana.jpg', src: 'Songs/Albums/Haryanvi Workout/Russian Bandana.mp3' }
            ]
        },
        'Bollywood & Chill': {
            cover: 'https://i.scdn.co/image/ab67706f0000000203b72ae3caf435bd1f95fbd5',
            songs: [
                { title: 'Bol Kaffara Kya Hoga', artist: 'Various Artists', cover: 'Covers/bol.jpg', src: 'Songs/Albums/Bollywood & Chills/Bol Kaffara Kya Hoga.mp3' },
                { title: 'Deewaniyat', artist: 'Various Artists', cover: 'Covers/deewaniyat.jpg', src: 'Songs/Albums/Bollywood & Chills/Deewaniyat.mp3' },
                { title: 'Maiyya Mainu', artist: 'Various Artists', cover: 'Covers/maiyya mainu.jpg', src: 'Songs/Albums/Bollywood & Chills/Maiyya Mainu.mp3' },
                { title: 'Pardesiya', artist: 'Various Artists', cover: 'Covers/pardesiya.jpg', src: 'Songs/Albums/Bollywood & Chills/Pardesiya.mp3' }
            ]
        }
    };
    
    const album = albums[albumName];
    if (!album) {
        console.log('Album not found:', albumName);
        return;
    }
    
    // Create album view with all songs
    const albumView = document.createElement('div');
    albumView.className = 'mobile-album-view';
    
    // Set current playlist for next/prev functionality
    mobileCurrentPlaylist = album.songs;
    mobileCurrentPlaylistName = albumName;
    
    let songsHTML = '';
    album.songs.forEach((song, index) => {
        songsHTML += `
            <div class="song-item" onclick="playSong('${song.title}', '${song.artist}', '${song.cover}', '${song.src}')">
                <img src="${song.cover}" alt="${song.title}">
                <div class="song-info">
                    <h3>${song.title}</h3>
                    <p>${song.artist}</p>
                </div>
            </div>
        `;
    });
    
    albumView.innerHTML = `
        <div class="album-header">
            <button class="back-btn" onclick="showHomeContent()">← Back</button>
            <h1>${albumName}</h1>
        </div>
        <div class="album-songs">
            ${songsHTML}
        </div>
    `;
    
    homeTab.innerHTML = '';
    homeTab.appendChild(albumView);
}

// Play individual song with actual MP3 file
function playSong(songTitle, songArtist, songCover, songSrc) {
    console.log('Playing song:', songTitle, 'by', songArtist, 'from', songSrc);
    
    // Stop current audio if playing
    if (mobileAudio) {
        mobileAudio.pause();
        mobileAudio = null;
    }
    
    // Create new audio element
    mobileAudio = new Audio(songSrc);
    mobileCurrentSongSrc = songSrc;
    
    // Update mobile playbar
    updateMobilePlaybar(songTitle, songArtist, songCover);
    
    // Update full-screen player if open
    updateFullScreenPlayer(songTitle, songArtist, songCover);
    
    // Start playing
    mobileAudio.play().then(() => {
        const mobilePlayBtn = document.getElementById('mobile-play-btn');
        mobilePlayBtn.classList.add('playing');
        mobilePlayBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    }).catch(error => {
        console.error('Error playing song:', error);
    });
    
    // Handle song end
    mobileAudio.addEventListener('ended', function() {
        playNextSong();
    });
}

// Update full-screen player content
function updateFullScreenPlayer(songTitle, songArtist, songCover) {
    const fullScreenPlayer = document.querySelector('.fullscreen-player');
    if (fullScreenPlayer) {
        // Update cover image
        const coverImg = fullScreenPlayer.querySelector('.fullscreen-cover img');
        if (coverImg) {
            coverImg.src = songCover;
            coverImg.alt = songTitle;
        }
        
        // Update song info
        const songInfo = fullScreenPlayer.querySelector('.fullscreen-info');
        if (songInfo) {
            songInfo.innerHTML = `
                <h1>${songTitle}</h1>
                <p>${songArtist}</p>
            `;
        }
    }
}

// Play album functionality
function playAlbum(albumName) {
    console.log('Playing album:', albumName);
    
    // Get album data from PC albums object
    const albums = {
        'Saiyaara': {
            cover: 'https://i.scdn.co/image/ab67616d00001e02a7e251b543c77a6ed356dfbe',
            songs: [
                { title: 'Saiyaara', artist: 'Faheem Abdullah', cover: 'https://i.scdn.co/image/ab67616d00001e02a7e251b543c77a6ed356dfbe' },
                { title: 'Barbaad', artist: 'Jubin Nautiyal', cover: 'Covers/barbaad.jpg' },
                { title: 'Dhun', artist: 'Arijit Singh', cover: 'Covers/dhun.jpg' },
                { title: 'Tum Ho Toh', artist: 'Various Artists', cover: 'Covers/tum ho toh.jpg' }
            ]
        },
        'The Glory': {
            cover: 'glory.jpg',
            songs: [
                { title: 'Bonita', artist: 'Various Artists', cover: 'glory.jpg' },
                { title: 'High On Me', artist: 'Various Artists', cover: 'glory.jpg' },
                { title: 'Millionaire', artist: 'Various Artists', cover: 'glory.jpg' },
                { title: 'Payal', artist: 'Various Artists', cover: 'glory.jpg' }
            ]
        }
    };
    
    if (albums[albumName]) {
        const album = albums[albumName];
        const firstSong = album.songs[0];
        
        // Update mobile playbar with first song
        updateMobilePlaybar(firstSong.title, firstSong.artist, firstSong.cover);
        
        // Start playing
        const mobilePlayBtn = document.getElementById('mobile-play-btn');
        mobilePlayBtn.classList.add('playing');
        mobilePlayBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    }
}

// Show home content
function showHomeContent() {
    const homeTab = document.getElementById('home-tab');
    const rightDiv = document.querySelector('.right');
    
    if (rightDiv) {
        homeTab.innerHTML = `<div class="mobile-home-content">${rightDiv.innerHTML}</div>`;
        initializeMobileCards();
        // Add side-scroll buttons for album rows
        initializeSideScroll();
    }
}

// Add side scroll functionality
function initializeSideScroll() {
    const cardContainers = document.querySelectorAll('.mobile-home-content .cardcontainer');
    
    cardContainers.forEach(container => {
        // Add scroll indicators
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'scroll-container';
        
        const leftBtn = document.createElement('button');
        leftBtn.className = 'scroll-indicator scroll-left';
        leftBtn.innerHTML = '‹';
        leftBtn.onclick = () => scrollContainer.scrollBy({ left: -200, behavior: 'smooth' });
        
        const rightBtn = document.createElement('button');
        rightBtn.className = 'scroll-indicator scroll-right';
        rightBtn.innerHTML = '›';
        rightBtn.onclick = () => scrollContainer.scrollBy({ left: 200, behavior: 'smooth' });
        
        // Wrap container
        container.parentNode.insertBefore(scrollContainer, container);
        scrollContainer.appendChild(container);
        scrollContainer.appendChild(leftBtn);
        scrollContainer.appendChild(rightBtn);
    });
}

// Initialize mobile search functionality
function initializeMobileSearch() {
    const mobileSearchInput = document.querySelector('.mobile-search-input');
    const mobileSearchResults = document.getElementById('mobile-search-results');
    
    console.log('Initializing mobile search:', mobileSearchInput, mobileSearchResults);
    
    if (mobileSearchInput && mobileSearchResults) {
        mobileSearchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            console.log('Search query:', query);
            
            if (query.length > 2) {
                performMobileSearch(query, mobileSearchResults);
            } else if (query.length > 0) {
                mobileSearchResults.innerHTML = '<p>Type at least 3 characters to search...</p>';
            } else {
                mobileSearchResults.innerHTML = '';
            }
        });
    } else {
        console.error('Mobile search elements not found:', { mobileSearchInput, mobileSearchResults });
    }
}

// All songs database for search
const allSongs = [
    // Saiyaara Album
    { title: 'Saiyaara', artist: 'Faheem Abdullah', cover: 'https://i.scdn.co/image/ab67616d00001e02a7e251b543c77a6ed356dfbe', src: 'Songs/Albums/Saiyaara/Saiyaara.mp3' },
    { title: 'Barbaad', artist: 'Jubin Nautiyal', cover: 'Covers/barbaad.jpg', src: 'Songs/Albums/Saiyaara/Barbaad.mp3' },
    { title: 'Dhun', artist: 'Arijit Singh', cover: 'Covers/dhun.jpg', src: 'Songs/Albums/Saiyaara/Dhun.mp3' },
    { title: 'Tum Ho Toh', artist: 'Various Artists', cover: 'Covers/tum ho toh.jpg', src: 'Songs/Albums/Saiyaara/Tum Ho Toh.mp3' },
    
    // The Glory Album
    { title: 'Bonita', artist: 'Various Artists', cover: 'glory.jpg', src: 'Songs/Albums/The Glory/Bonita.mp3' },
    { title: 'High On Me', artist: 'Various Artists', cover: 'glory.jpg', src: 'Songs/Albums/The Glory/High On Me.mp3' },
    { title: 'Millionaire', artist: 'Various Artists', cover: 'glory.jpg', src: 'Songs/Albums/The Glory/Millionaire.mp3' },
    { title: 'Payal', artist: 'Various Artists', cover: 'glory.jpg', src: 'Songs/Albums/The Glory/Payal.mp3' },
    
    // 51 Glorious Days Album
    { title: 'Aadat', artist: 'Various Artists', cover: 'https://i.scdn.co/image/ab67616d00001e028fa95e3e74799cb0b2a1fb57', src: 'Songs/Albums/51 Glorious Days/Aadat.mp3' },
    { title: 'Compro', artist: 'Various Artists', cover: 'https://i.scdn.co/image/ab67616d00001e028fa95e3e74799cb0b2a1fb57', src: 'Songs/Albums/51 Glorious Days/Compro.mp3' },
    { title: 'Glorious Days', artist: 'Various Artists', cover: 'https://i.scdn.co/image/ab67616d00001e028fa95e3e74799cb0b2a1fb57', src: 'Songs/Albums/51 Glorious Days/Glorious Days.mp3' },
    { title: 'Mafia', artist: 'Various Artists', cover: 'https://i.scdn.co/image/ab67616d00001e028fa95e3e74799cb0b2a1fb57', src: 'Songs/Albums/51 Glorious Days/Mafia.mp3' },
    
    // Haryanvi Workout Album
    { title: '2 Numbari', artist: 'Various Artists', cover: 'Covers/2 numbari.jpg', src: 'Songs/Albums/Haryanvi Workout/2 Numbari.mp3' },
    { title: 'Haryana Hood', artist: 'Various Artists', cover: 'Covers/haryana hood.jpg', src: 'Songs/Albums/Haryanvi Workout/Haryana Hood.mp3' },
    { title: 'No Fluke', artist: 'Various Artists', cover: 'Covers/no fluke.jpg', src: 'Songs/Albums/Haryanvi Workout/No Fluke.mp3' },
    { title: 'Russian Bandana', artist: 'Various Artists', cover: 'Covers/russian bhandana.jpg', src: 'Songs/Albums/Haryanvi Workout/Russian Bandana.mp3' },
    
    // Bollywood & Chill Album
    { title: 'Bol Kaffara Kya Hoga', artist: 'Various Artists', cover: 'Covers/bol.jpg', src: 'Songs/Albums/Bollywood & Chills/Bol Kaffara Kya Hoga.mp3' },
    { title: 'Deewaniyat', artist: 'Various Artists', cover: 'Covers/deewaniyat.jpg', src: 'Songs/Albums/Bollywood & Chills/Deewaniyat.mp3' },
    { title: 'Maiyya Mainu', artist: 'Various Artists', cover: 'Covers/maiyya mainu.jpg', src: 'Songs/Albums/Bollywood & Chills/Maiyya Mainu.mp3' },
    { title: 'Pardesiya', artist: 'Various Artists', cover: 'Covers/pardesiya.jpg', src: 'Songs/Albums/Bollywood & Chills/Pardesiya.mp3' },
    
    // New Releases
    { title: 'Haseen', artist: 'Talwinder', cover: 'Covers/haseen.jpeg', src: 'Songs/New Releases/Haseen.mp3' },
    { title: 'Bijuria', artist: 'Sonu Nigam, Asees Kaur', cover: 'Covers/bijuria.jpg', src: 'Songs/New Releases/Bijuria.mp3' },
    { title: 'Panwadi', artist: 'Khesari Lal Yadav', cover: 'Covers/panwadi.jpg', src: 'Songs/New Releases/Panwadi.mp3' },
    { title: 'Azul', artist: 'Guru Randhawa', cover: 'Covers/azul.jpeg', src: 'Songs/New Releases/Azul.mp3' },
    { title: 'Perfect', artist: 'Guru Randhawa', cover: 'Covers/perfect.jpg', src: 'Songs/New Releases/Perfect.mp3' },
    
    // P-POP CULTURE Playlist
    { title: '7.7 Magnitude', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/7.7 Magnitude.mp3' },
    { title: 'Boyfriend', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/Boyfriend.mp3' },
    { title: 'Daytona', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/Daytona.mp3' },
    { title: 'Flip Side (Sandy\'s Interlude)', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/Flip Side (Sandy\'s Interlude).mp3' },
    { title: 'For A Reason', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/For A Reason.mp3' },
    { title: 'HIM', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/HIM.mp3' },
    { title: 'I Really Do....', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/I Really Do....mp3' },
    { title: 'I\'ma Do My Thiiing', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/I\'ma Do My Thiiing.mp3' },
    { title: 'Mf Gabhru', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/Mf Gabhru.mp3' },
    { title: 'P-POP CULTURE', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/P-POP CULTURE.mp3' },
    { title: 'You\'re U Tho', artist: 'Various Artists', cover: 'popculture.jpg', src: 'Songs/P-POP CULTURE/You\'re U Tho.mp3' },
    
    // Ishq aur Tanhai Playlist
    { title: 'Isq Risk', artist: 'Various Artists', cover: 'https://surtaalmusic.netlify.app/Covers/isq.jpg', src: 'Songs/Ishq aur Tanhai/Isq Risk.mp3' },
    { title: 'Maula Mere Maula', artist: 'Various Artists', cover: 'Covers/maula.jpg', src: 'Songs/Ishq aur Tanhai/Maula Mere Maula.mp3' },
    { title: 'O Re Piya', artist: 'Various Artists', cover: 'Covers/o re.jpg', src: 'Songs/Ishq aur Tanhai/O Re Piya.mp3' },
    { title: 'Phir Mohabbat', artist: 'Various Artists', cover: 'Covers/phir.jpg', src: 'Songs/Ishq aur Tanhai/Phir Mohabbat.mp3' },
    
    // 80's-90's Playlist
    { title: 'Aankhein Khuli', artist: 'Various Artists', cover: 'Covers/aankhein.jpg', src: "Songs/old/Aankhein Khuli.mp3" },
    { title: 'Dil Ne Yeh Kaha Hain Dil Se', artist: 'Various Artists', cover: 'Covers/dil.jpg', src: "Songs/old/Dil Ne Yeh Kaha Hain Dil Se.mp3" },
    { title: 'O Meri Mehbooba', artist: 'Various Artists', cover: 'Covers/o meri.jpg', src: "Songs/old/O Meri Mehbooba.mp3" },
    { title: 'Ruk Ja O Dil Deewane', artist: 'Various Artists', cover: 'Covers/ruk.jpg', src: "Songs/old/Ruk Ja O Dil Deewane.mp3" },
    
    // Punjabi Pump Playlist
    { title: '0008', artist: 'Various Artists', cover: 'Covers/0008.jpg', src: 'Songs/Punjabi Pump/0008.mp3' },
    { title: 'Greatest', artist: 'Various Artists', cover: 'Covers/greatest.jpg', src: 'Songs/Punjabi Pump/Greatest.mp3' },
    { title: 'Gunda', artist: 'Various Artists', cover: 'Covers/gunda.jpg', src: 'Songs/Punjabi Pump/Gunda.mp3' },
    { title: 'Wavy', artist: 'Various Artists', cover: 'Covers/wavy.jpg', src: 'Songs/Punjabi Pump/Wavy.mp3' },
    
    // Liked Songs
    { title: 'Ghafoor', artist: 'Various Artists', cover: 'Covers/ghafoor.jpg', src: 'Songs/Liked Songs/Ghafoor.mp3' },
    
    // Additional songs from Saiyaara album
    { title: 'Humsafar', artist: 'Various Artists', cover: 'Covers/humsafar.jpg', src: 'Songs/Albums/Saiyaara/Humsafar.mp3' },
    { title: 'Saiyaara', artist: 'Various Artists', cover: 'Covers/saiyaara.jpg', src: 'Songs/Albums/Saiyaara/Saiyaara.mp3' },
    
    // Additional songs from other albums
    { title: 'Aankhein Khuli', artist: 'Various Artists', cover: 'Covers/aankhein.jpg', src: "Songs/old/Aankhein Khuli.mp3" },
    { title: 'Dil Ne Yeh Kaha Hain Dil Se', artist: 'Various Artists', cover: 'Covers/dil.jpg', src: "Songs/old/Dil Ne Yeh Kaha Hain Dil Se.mp3" },
    { title: 'O Meri Mehbooba', artist: 'Various Artists', cover: 'Covers/o meri.jpg', src: "Songs/old/O Meri Mehbooba.mp3" },
    { title: 'Ruk Ja O Dil Deewane', artist: 'Various Artists', cover: 'Covers/ruk.jpg', src: "Songs/old/Ruk Ja O Dil Deewane.mp3" }
];

// Perform mobile search
function performMobileSearch(query, resultsContainer) {
    console.log('Searching for:', query);
    console.log('Total songs in database:', allSongs.length);
    
    const results = allSongs.filter(song => 
        song.title.toLowerCase().includes(query) || 
        song.artist.toLowerCase().includes(query)
    );
    
    console.log('Search results:', results);
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="search-result-item">
                <h3>No results found for "${query}"</h3>
                <p>Try searching for a different song or artist</p>
            </div>
        `;
        return;
    }
    
    let resultsHTML = '<h3>Search Results</h3>';
    results.forEach(song => {
        resultsHTML += `
            <div class="search-result-item" onclick="playSong('${song.title}', '${song.artist}', '${song.cover}', '${song.src}')">
                <img src="${song.cover}" alt="${song.title}">
                <div class="search-result-info">
                    <h4>${song.title}</h4>
                    <p>${song.artist}</p>
                </div>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = resultsHTML;
}

// Initialize mobile playbar with full PC functionality
function initMobilePlaybar() {
    const mobilePlayBtn = document.getElementById('mobile-play-btn');
    const mobilePrevBtn = document.getElementById('mobile-prev-btn');
    const mobileNextBtn = document.getElementById('mobile-next-btn');
    const mobileSongTitle = document.getElementById('mobile-song-title');
    const mobileSongArtist = document.getElementById('mobile-song-artist');
    const mobileSongCoverImg = document.getElementById('mobile-song-cover-img');
    
    // Set default state
    mobileSongTitle.textContent = 'No song playing';
    mobileSongArtist.textContent = 'SurTaal';
    
    // Play button functionality
    mobilePlayBtn.addEventListener('click', function() {
        const isPlaying = this.classList.contains('playing');
        
        if (isPlaying) {
            this.classList.remove('playing');
            this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
            // Pause functionality
            pauseCurrentSong();
        } else {
            this.classList.add('playing');
            this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
            // Play functionality
            playCurrentSong();
        }
    });
    
    // Previous button functionality
    mobilePrevBtn.addEventListener('click', function() {
        playPreviousSong();
    });
    
    // Next button functionality
    mobileNextBtn.addEventListener('click', function() {
        playNextSong();
    });
}

// Play current song
function playCurrentSong() {
    if (mobileAudio) {
        mobileAudio.play();
        const mobilePlayBtn = document.getElementById('mobile-play-btn');
        mobilePlayBtn.classList.add('playing');
        mobilePlayBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    }
}

// Pause current song
function pauseCurrentSong() {
    if (mobileAudio) {
        mobileAudio.pause();
        const mobilePlayBtn = document.getElementById('mobile-play-btn');
        mobilePlayBtn.classList.remove('playing');
        mobilePlayBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    }
}

// Play previous song
function playPreviousSong() {
    if (mobileCurrentPlaylist.length > 0) {
        mobileCurrentSongIndex = (mobileCurrentSongIndex - 1 + mobileCurrentPlaylist.length) % mobileCurrentPlaylist.length;
        const song = mobileCurrentPlaylist[mobileCurrentSongIndex];
        playSong(song.title, song.artist, song.cover, song.src);
    }
}

// Play next song
function playNextSong() {
    if (mobileCurrentPlaylist.length > 0) {
        mobileCurrentSongIndex = (mobileCurrentSongIndex + 1) % mobileCurrentPlaylist.length;
        const song = mobileCurrentPlaylist[mobileCurrentSongIndex];
        playSong(song.title, song.artist, song.cover, song.src);
    }
}

// Update mobile playbar with song info
function updateMobilePlaybar(songTitle, songArtist, songCover) {
    const mobileSongTitle = document.getElementById('mobile-song-title');
    const mobileSongArtist = document.getElementById('mobile-song-artist');
    const mobileSongCoverImg = document.getElementById('mobile-song-cover-img');
    
    mobileSongTitle.textContent = songTitle;
    mobileSongArtist.textContent = songArtist;
    
    if (songCover) {
        mobileSongCoverImg.src = songCover;
        mobileSongCoverImg.style.display = 'block';
    }
    
    // Add click event to cover for full-screen player
    const mobileSongCover = document.getElementById('mobile-song-cover');
    mobileSongCover.onclick = function() {
        showFullScreenPlayer(songTitle, songArtist, songCover);
    };
}

// Show full-screen player
function showFullScreenPlayer(songTitle, songArtist, songCover) {
    // Create full-screen player overlay
    const fullScreenPlayer = document.createElement('div');
    fullScreenPlayer.className = 'fullscreen-player';
    fullScreenPlayer.innerHTML = `
        <div class="fullscreen-content">
            <button class="close-fullscreen" onclick="closeFullScreenPlayer()">×</button>
            <div class="fullscreen-cover">
                <img src="${songCover}" alt="${songTitle}">
            </div>
            <div class="fullscreen-info">
                <h1>${songTitle}</h1>
                <p>${songArtist}</p>
            </div>
            <div class="fullscreen-controls">
                <button class="control-btn" onclick="playPreviousSong()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                    </svg>
                </button>
                <button class="play-btn-large" id="fullscreen-play-btn">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                </button>
                <button class="control-btn" onclick="playNextSong()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(fullScreenPlayer);
    
    // Update play button state
    const fullscreenPlayBtn = document.getElementById('fullscreen-play-btn');
    const mobilePlayBtn = document.getElementById('mobile-play-btn');
    
    if (mobilePlayBtn.classList.contains('playing')) {
        fullscreenPlayBtn.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    }
    
    fullscreenPlayBtn.onclick = function() {
        const isPlaying = mobilePlayBtn.classList.contains('playing');
        if (isPlaying) {
            pauseCurrentSong();
            fullscreenPlayBtn.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
        } else {
            playCurrentSong();
            fullscreenPlayBtn.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        }
    };
}

// Close full-screen player
function closeFullScreenPlayer() {
    const fullScreenPlayer = document.querySelector('.fullscreen-player');
    if (fullScreenPlayer) {
        fullScreenPlayer.remove();
    }
}

// Initialize hamburger menu when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initHamburgerMenu();
    initMobileTaskbar();
    initMobilePlaybar();
    initializeMobileSearch();
    populateMobileLibrary();
    populateMobileHome();
    initializeSideScroll();
});

main();
