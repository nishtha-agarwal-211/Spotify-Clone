// ============ Player State ============
const state = {
    isPlaying: false,
    currentTime: 24,     // seconds
    totalTime: 195,      // 3:15
    volume: 70,
    prevVolume: 70,
    isShuffle: false,
    isRepeat: false,
    isLiked: false,
    progressInterval: null,
};

// ============ Track Library ============
const tracks = [
    { title: 'Daily Mix 1',   artist: 'Made for Nishtha',       img: 'image/daily_mix_1.png',   duration: 195 },
    { title: 'Daily Mix 2',   artist: 'Hits from 2010s',        img: 'image/daily_mix_2.png',   duration: 210 },
    { title: 'Rock Classics', artist: 'Playlist • Spotify',     img: 'image/rock_classics.png', duration: 178 },
    { title: 'Chill Vibes',   artist: 'Lofi & Relaxing Beats',  img: 'image/chill_vibes.png',   duration: 222 },
    { title: 'Jazz for Study','artist': 'Focus & Flow',         img: 'image/jazz_study.png',    duration: 245 },
    { title: 'Pop Hits',      artist: 'Top Charting Songs',     img: 'image/pop_hits.png',      duration: 187 },
    { title: 'Daily Podcast', artist: 'Podcast • Technology',   img: 'image/daily_podcast.png', duration: 1800 },
    { title: 'Liked Songs',   artist: 'Your Favorites',         img: 'image/liked_songs.png',   duration: 240 },
];
let currentTrackIdx = 0;

// ============ DOM Elements ============
const $ = (sel) => document.getElementById(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const playPauseBtn   = $('play-pause-btn');
const prevBtn        = $('prev-btn');
const nextBtn        = $('next-btn');
const shuffleBtn     = $('shuffle-btn');
const repeatBtn      = $('repeat-btn');
const likeBtn        = $('like-btn');
const volumeBtn      = $('volume-btn');
const progressFill   = $('progress-fill');
const progressBar    = $('progress-bar');
const volumeFill     = $('volume-fill');
const volumeBar      = $('volume-progress-bar');
const timeCurrent    = $('time-current');
const timeTotal      = $('time-total');
const songTitle      = $('song-title');
const songArtist     = $('song-artist');
const playerImg      = $('player-img');
const greetingText   = $('greeting-text');
const searchInput    = $('search-input');

// ============ Helpers ============
function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

function updateProgress() {
    const pct = (state.currentTime / state.totalTime) * 100;
    progressFill.style.width = `${pct}%`;
    timeCurrent.textContent = formatTime(state.currentTime);
}

function updateVolumeUI() {
    volumeFill.style.width = `${state.volume}%`;
    const icon = volumeBtn.querySelector('i');
    icon.className = 'fa-solid';
    if (state.volume === 0)       icon.classList.add('fa-volume-xmark');
    else if (state.volume < 40)   icon.classList.add('fa-volume-low');
    else                           icon.classList.add('fa-volume-high');
}

function loadTrack(idx) {
    const t = tracks[idx];
    songTitle.textContent  = t.title;
    songArtist.textContent = t.artist;
    playerImg.src          = t.img;
    playerImg.alt          = t.title;
    state.totalTime        = t.duration;
    state.currentTime      = 0;
    state.isLiked          = false;

    likeBtn.classList.remove('liked');
    likeBtn.querySelector('i').className = 'fa-regular fa-heart';

    updateProgress();
    timeTotal.textContent = formatTime(state.totalTime);

    // Animate player image
    playerImg.style.transform = 'scale(0.92)';
    setTimeout(() => { playerImg.style.transform = 'scale(1)'; }, 250);
}

// ============ Play / Pause ============
function togglePlay() {
    state.isPlaying = !state.isPlaying;
    const icon = playPauseBtn.querySelector('i');

    if (state.isPlaying) {
        icon.className = 'fa-solid fa-pause';
        playPauseBtn.setAttribute('title', 'Pause');
        playPauseBtn.setAttribute('aria-label', 'Pause');
        startProgressSim();
    } else {
        icon.className = 'fa-solid fa-play';
        playPauseBtn.setAttribute('title', 'Play');
        playPauseBtn.setAttribute('aria-label', 'Play');
        stopProgressSim();
    }
}

function startProgressSim() {
    stopProgressSim();
    state.progressInterval = setInterval(() => {
        if (state.currentTime < state.totalTime) {
            state.currentTime++;
            updateProgress();
        } else {
            if (state.isRepeat) {
                state.currentTime = 0;
                updateProgress();
            } else {
                nextTrack();
            }
        }
    }, 1000);
}

function stopProgressSim() {
    clearInterval(state.progressInterval);
    state.progressInterval = null;
}

// ============ Track Navigation ============
function nextTrack() {
    if (state.isShuffle) {
        let rand;
        do { rand = Math.floor(Math.random() * tracks.length); }
        while (rand === currentTrackIdx && tracks.length > 1);
        currentTrackIdx = rand;
    } else {
        currentTrackIdx = (currentTrackIdx + 1) % tracks.length;
    }
    loadTrack(currentTrackIdx);
    if (state.isPlaying) startProgressSim();
    pulse(nextBtn);
}

function prevTrack() {
    if (state.currentTime > 3) {
        state.currentTime = 0;
        updateProgress();
    } else {
        currentTrackIdx = (currentTrackIdx - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrackIdx);
        if (state.isPlaying) startProgressSim();
    }
    pulse(prevBtn);
}

// ============ Events: Player Controls ============
playPauseBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

shuffleBtn.addEventListener('click', () => {
    state.isShuffle = !state.isShuffle;
    shuffleBtn.classList.toggle('active', state.isShuffle);
    shuffleBtn.setAttribute('aria-pressed', String(state.isShuffle));
    pulse(shuffleBtn);
});

repeatBtn.addEventListener('click', () => {
    state.isRepeat = !state.isRepeat;
    repeatBtn.classList.toggle('active', state.isRepeat);
    repeatBtn.setAttribute('aria-pressed', String(state.isRepeat));
    pulse(repeatBtn);
});

// Like toggle with heartbeat animation
likeBtn.addEventListener('click', () => {
    state.isLiked = !state.isLiked;
    likeBtn.classList.toggle('liked', state.isLiked);
    likeBtn.setAttribute('aria-pressed', String(state.isLiked));
    const icon = likeBtn.querySelector('i');
    icon.className = state.isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    heartbeat(likeBtn);
});

// ============ Progress Seeking ============
progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    state.currentTime = Math.floor(Math.max(0, Math.min(1, pct)) * state.totalTime);
    updateProgress();
});

// Drag progress
let isDraggingProgress = false;
progressBar.addEventListener('mousedown', (e) => {
    isDraggingProgress = true;
    seekTo(e);
});
document.addEventListener('mousemove', (e) => {
    if (isDraggingProgress) seekTo(e);
});
document.addEventListener('mouseup', () => { isDraggingProgress = false; });

function seekTo(e) {
    const rect = progressBar.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    state.currentTime = Math.floor(Math.max(0, Math.min(1, pct)) * state.totalTime);
    updateProgress();
}

// ============ Volume ============
volumeBtn.addEventListener('click', () => {
    if (state.volume > 0) {
        state.prevVolume = state.volume;
        state.volume = 0;
    } else {
        state.volume = state.prevVolume || 70;
    }
    updateVolumeUI();
});

volumeBar.addEventListener('click', (e) => {
    const rect = volumeBar.getBoundingClientRect();
    state.volume = Math.round(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 100);
    updateVolumeUI();
});

// Drag volume
let isDraggingVolume = false;
volumeBar.addEventListener('mousedown', () => { isDraggingVolume = true; });
document.addEventListener('mousemove', (e) => {
    if (isDraggingVolume) {
        const rect = volumeBar.getBoundingClientRect();
        state.volume = Math.round(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 100);
        updateVolumeUI();
    }
});
document.addEventListener('mouseup', () => { isDraggingVolume = false; });

// ============ Card / Quick-Card Clicks ============
function attachCardEvents() {
    // Quick cards
    $$('.quick-card').forEach((card) => {
        const playBtn = card.querySelector('.play-btn');
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            loadTrackFromCard(card);
        });
        card.addEventListener('click', () => loadTrackFromCard(card));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadTrackFromCard(card); }
        });
    });

    // Large cards
    $$('.card').forEach((card) => {
        const playBtn = card.querySelector('.card-play');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                loadTrackFromCard(card);
            });
        }
        card.addEventListener('click', () => loadTrackFromCard(card));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); loadTrackFromCard(card); }
        });
    });
}

function loadTrackFromCard(card) {
    const trackName = card.dataset.track;
    const artistName = card.dataset.artist;
    const img = card.querySelector('img');

    // Try finding in tracks array first
    const idx = tracks.findIndex(t => t.title === trackName);
    if (idx !== -1) {
        currentTrackIdx = idx;
        loadTrack(idx);
    } else {
        // Manual load from card data
        songTitle.textContent  = trackName || 'Unknown';
        songArtist.textContent = artistName || '';
        if (img) { playerImg.src = img.src; playerImg.alt = img.alt; }
        state.currentTime = 0;
        state.totalTime   = 195;
        updateProgress();
        timeTotal.textContent = formatTime(state.totalTime);
    }

    if (!state.isPlaying) togglePlay();
    else startProgressSim();

    // Visual feedback on card
    card.style.transform = 'scale(0.97)';
    setTimeout(() => { card.style.transform = ''; }, 180);
}

// ============ Keyboard Shortcuts ============
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;

    switch (e.code) {
        case 'Space':
            e.preventDefault();
            togglePlay();
            break;
        case 'ArrowRight':
            state.currentTime = Math.min(state.totalTime, state.currentTime + 5);
            updateProgress();
            break;
        case 'ArrowLeft':
            state.currentTime = Math.max(0, state.currentTime - 5);
            updateProgress();
            break;
        case 'ArrowUp':
            e.preventDefault();
            state.volume = Math.min(100, state.volume + 5);
            updateVolumeUI();
            break;
        case 'ArrowDown':
            e.preventDefault();
            state.volume = Math.max(0, state.volume - 5);
            updateVolumeUI();
            break;
        case 'KeyM':
            state.volume = state.volume > 0 ? 0 : (state.prevVolume || 70);
            updateVolumeUI();
            break;
        case 'KeyN':
            nextTrack();
            break;
        case 'KeyP':
            prevTrack();
            break;
    }
});

// ============ Search Interaction ============
searchInput.addEventListener('focus', () => {
    searchInput.parentElement.querySelector('.search-icon').style.color = '#fff';
});
searchInput.addEventListener('blur', () => {
    searchInput.parentElement.querySelector('.search-icon').style.color = '';
});
searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    $$('.card, .quick-card').forEach(card => {
        const name = (card.querySelector('h3, span') || card).textContent.toLowerCase();
        card.style.opacity = (!q || name.includes(q)) ? '1' : '0.3';
    });
});

// ============ Dynamic Greeting ============
function setGreeting() {
    const hour = new Date().getHours();
    let text;
    if      (hour < 5)  text = 'Night Owl 🌙';
    else if (hour < 12) text = 'Good Morning! ☀️';
    else if (hour < 17) text = 'Good Afternoon! 🎵';
    else if (hour < 21) text = 'Good Evening! 🎶';
    else                text = 'Good Night! 🌙';
    greetingText.textContent = text;
}

// ============ Top Bar Scroll Effect ============
const mainContent = document.querySelector('.page-content');
const topBar = $('top-bar');
if (mainContent && topBar) {
    mainContent.addEventListener('scroll', () => {
        if (mainContent.scrollTop > 20) {
            topBar.style.background = 'rgba(10,10,10,0.98)';
        } else {
            topBar.style.background = '';
        }
    });
}

// ============ Sidebar Nav Highlight ============
$$('#sidebar .menu li, #sidebar .playlist li').forEach(item => {
    item.addEventListener('click', function () {
        $$('#sidebar .menu li').forEach(li => li.classList.remove('active'));
        this.classList.add('active');
    });
});

// ============ Micro Animation Helpers ============
function pulse(el) {
    el.style.transform = 'scale(0.88)';
    setTimeout(() => { el.style.transform = ''; }, 120);
}

function heartbeat(el) {
    el.style.transform = 'scale(1.35)';
    setTimeout(() => { el.style.transform = 'scale(0.9)'; }, 130);
    setTimeout(() => { el.style.transform = ''; }, 250);
}

// ============ Horizontal Scroll with Mouse Wheel ============
$$('.cards-row').forEach(row => {
    row.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        e.preventDefault();
        row.scrollLeft += e.deltaY * 0.8;
    }, { passive: false });
});

// ============ Dynamic Background Gradient ============
const gradients = [
    'linear-gradient(180deg, #1a2a1a 0%, #121212 28%)',
    'linear-gradient(180deg, #2a1a1a 0%, #121212 28%)',
    'linear-gradient(180deg, #1a1a2a 0%, #121212 28%)',
    'linear-gradient(180deg, #2a201a 0%, #121212 28%)',
    'linear-gradient(180deg, #1e1a2a 0%, #121212 28%)',
];
let gradientIdx = 0;
const mainEl = document.querySelector('.main');

function cycleGradient() {
    gradientIdx = (gradientIdx + 1) % gradients.length;
    mainEl.style.background = gradients[gradientIdx];
}
setInterval(cycleGradient, 25000);

// ============ Init ============
function init() {
    setGreeting();
    updateProgress();
    updateVolumeUI();
    timeTotal.textContent = formatTime(state.totalTime);
    attachCardEvents();

    console.log('%c🎵 Spotify Clone Ready!', 'color:#1ed760;font-size:16px;font-weight:bold;');
    console.log('%c⌨️  Shortcuts: SPACE=play  ←→=seek  ↑↓=volume  M=mute  N=next  P=prev',
        'color:#b3b3b3;font-size:12px;');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
