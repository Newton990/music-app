// ============================================
// NMstream – v1.5  (CORS Proxy + fetch)
// ============================================

const JAMENDO_CLIENT_ID = '56d30cce';
const JAMENDO_BASE      = 'https://api.jamendo.com/v3.0/tracks/';
const CORS_PROXY        = 'https://corsproxy.io/?';
const ROW_LIMIT         = 20;

// Genre rows shown on the home page
const DISCOVERY_GENRES = [
    { tag: '',           label: '🔥 Trending Now'      },
    { tag: 'pop',        label: '🎤 Pop Hits'          },
    { tag: 'rock',       label: '🎸 Rock Anthems'      },
    { tag: 'jazz',       label: '🎷 Jazz Vibes'        },
    { tag: 'lofi',       label: '☕ Lofi Chill'        },
    { tag: 'hiphop',     label: '🎧 Hip-Hop'           },
    { tag: 'electronic', label: '⚡ Electronic / EDM'  },
    { tag: 'ambient',    label: '🌙 Ambient / Relax'   },
    { tag: 'classical',  label: '🎻 Classical'          },
    { tag: 'reggae',     label: '🌴 Reggae'            },
];

// App state
let tracks       = [];
let currentTrack = null;
let isPlaying    = false;

// ============================================
// HELPERS
// ============================================
const getEl = id => document.getElementById(id);

function buildJamendoUrl(tag = '', query = '', limit = ROW_LIMIT, offset = 0) {
    let url = `${JAMENDO_BASE}?client_id=${JAMENDO_CLIENT_ID}`
            + `&format=json&limit=${limit}&offset=${offset}`
            + `&include=musicinfo&imagesize=400&order=popularity_total`;
    if (tag)   url += `&tags=${encodeURIComponent(tag)}`;
    if (query) url += `&search=${encodeURIComponent(query)}`;
    return url;
}

async function jamendoFetch(tag = '', query = '', limit = ROW_LIMIT, offset = 0) {
    const apiUrl   = buildJamendoUrl(tag, query, limit, offset);
    const proxyUrl = CORS_PROXY + encodeURIComponent(apiUrl);

    try {
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.results || [];
    } catch (err) {
        console.error('Jamendo fetch failed:', err);
        return null;   // null = network error
    }
}

function mapTrack(item) {
    return {
        id:     item.id,
        title:  item.name,
        artist: item.artist_name,
        cover:  item.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
        url:    item.audio
    };
}

// ============================================
// INIT
// ============================================
function initApp() {
    setupNavigation();
    setupAudioPlayer();
    setupSearch();
    setupForms();
    buildDiscoveryRows();
}

// ============================================
// DISCOVERY – horizontal genre rows
// ============================================
function buildDiscoveryRows() {
    const container = getEl('genreRows');
    if (!container) return;
    container.innerHTML = '';
    tracks = [];

    DISCOVERY_GENRES.forEach((genre, i) => {
        // Skeleton row
        const row = document.createElement('div');
        row.className = 'genre-row';
        row.innerHTML = `
            <div class="genre-row-header">
                <h3 class="genre-row-title">${genre.label}</h3>
            </div>
            <div class="genre-row-scroll" id="rowScroll-${i}">
                <div class="loading-row"><i class="fas fa-spinner fa-spin"></i> Loading…</div>
            </div>`;
        container.appendChild(row);

        // Stagger requests so we don't overload the proxy
        setTimeout(() => loadGenreRow(genre.tag, i), i * 400);
    });
}

async function loadGenreRow(tag, index) {
    const scroll = getEl(`rowScroll-${index}`);
    if (!scroll) return;

    const results = await jamendoFetch(tag);

    if (results === null) {
        scroll.innerHTML = '<div class="no-results">⚠️ Could not load – check your internet connection.</div>';
        return;
    }
    if (results.length === 0) {
        scroll.innerHTML = '<div class="no-results">No tracks found for this genre.</div>';
        return;
    }

    scroll.innerHTML = '';
    results.forEach(item => {
        const track = mapTrack(item);
        tracks.push(track);
        scroll.appendChild(buildHCard(track));
    });
}

function buildHCard(track) {
    const card = document.createElement('div');
    card.className = `track-card-h ${currentTrack?.id === track.id ? 'active' : ''}`;
    card.dataset.trackId = track.id;
    card.innerHTML = `
        <div class="card-img-container">
            <img src="${track.cover}" alt="${track.title}" loading="lazy"
                 onerror="this.src='https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'">
            <div class="play-overlay"><i class="fas fa-play"></i></div>
        </div>
        <div class="track-info">
            <h3 title="${track.title}">${track.title}</h3>
            <p title="${track.artist}">${track.artist}</p>
        </div>`;
    card.onclick = () => selectTrack(track);
    return card;
}

// ============================================
// SEARCH – flat grid
// ============================================
let searchDebounce;

function setupSearch() {
    const input = getEl('musicSearch');
    if (!input) return;

    input.addEventListener('input', e => {
        clearTimeout(searchDebounce);
        const q = e.target.value.trim();
        if (!q) { buildDiscoveryRows(); return; }

        searchDebounce = setTimeout(() => doSearch(q), 600);
    });
}

async function doSearch(query) {
    const container = getEl('genreRows');
    if (!container) return;
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching…</div>';

    const results = await jamendoFetch('', query, 40);

    if (results === null) {
        container.innerHTML = '<div class="error"><p>⚠️ Search failed. Check your connection.</p></div>';
        return;
    }
    if (results.length === 0) {
        container.innerHTML = '<div class="no-results">No songs matched your search.</div>';
        return;
    }

    container.innerHTML = `
        <div class="genre-row">
            <div class="genre-row-header">
                <h3 class="genre-row-title">🔍 Search Results (${results.length})</h3>
            </div>
            <div class="music-grid" id="searchGrid"></div>
        </div>`;

    const grid = getEl('searchGrid');
    results.forEach(item => {
        const track = mapTrack(item);
        tracks.push(track);
        const card = document.createElement('div');
        card.className = `track-card ${currentTrack?.id === track.id ? 'active' : ''}`;
        card.dataset.trackId = track.id;
        card.innerHTML = `
            <div class="card-img-container">
                <img src="${track.cover}" alt="${track.title}" loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'">
                <div class="play-overlay"><i class="fas fa-play"></i></div>
            </div>
            <div class="track-info">
                <h3 title="${track.title}">${track.title}</h3>
                <p title="${track.artist}">${track.artist}</p>
            </div>`;
        card.onclick = () => selectTrack(track);
        grid.appendChild(card);
    });
}

// ============================================
// NAVIGATION
// ============================================
function setupNavigation() {
    const pageMap = {
        navHome:    'homePage',
        navSearch:  'homePage',
        navSubmit:  'submitPage',
        navPro:     'proPage',
        navSupport: 'supportPage',
        navDonate:  'donatePage'
    };
    const allPages = Object.values({ ...pageMap, extra: 'donatePage' });
    const uniquePages = [...new Set(Object.values(pageMap))];

    Object.entries(pageMap).forEach(([navId, pageId]) => {
        const link = getEl(navId);
        const page = getEl(pageId);
        if (!link || !page) return;

        link.addEventListener('click', e => {
            e.preventDefault();
            uniquePages.forEach(id => { const p = getEl(id); if (p) p.style.display = 'none'; });
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            page.style.display = 'block';
            link.classList.add('active');

            if (navId === 'navHome') {
                const s = getEl('musicSearch');
                if (s) s.value = '';
                buildDiscoveryRows();
            } else if (navId === 'navSearch') {
                getEl('musicSearch')?.focus();
            }
            window.scrollTo(0, 0);
        });
    });

    // Genre bar filter
    const genreBar = getEl('genreBar');
    if (genreBar) {
        genreBar.addEventListener('click', async e => {
            const btn = e.target.closest('.genre-btn');
            if (!btn) return;
            document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tag       = btn.dataset.genre === 'all' ? '' : btn.dataset.genre;
            const container = getEl('genreRows');
            if (container) {
                container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading…</div>';
            }

            const results = await jamendoFetch(tag, '', 60);
            if (!container) return;

            if (!results || results.length === 0) {
                container.innerHTML = '<div class="no-results">No tracks found.</div>';
                return;
            }

            container.innerHTML = `
                <div class="genre-row">
                    <div class="genre-row-header">
                        <h3 class="genre-row-title">${btn.textContent}</h3>
                    </div>
                    <div class="music-grid" id="filterGrid"></div>
                </div>`;

            const grid = getEl('filterGrid');
            results.forEach(item => {
                const track = mapTrack(item);
                tracks.push(track);
                const card = document.createElement('div');
                card.className = `track-card ${currentTrack?.id === track.id ? 'active' : ''}`;
                card.dataset.trackId = track.id;
                card.innerHTML = `
                    <div class="card-img-container">
                        <img src="${track.cover}" alt="${track.title}" loading="lazy"
                             onerror="this.src='https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'">
                        <div class="play-overlay"><i class="fas fa-play"></i></div>
                    </div>
                    <div class="track-info">
                        <h3 title="${track.title}">${track.title}</h3>
                        <p title="${track.artist}">${track.artist}</p>
                    </div>`;
                card.onclick = () => selectTrack(track);
                grid.appendChild(card);
            });
        });
    }
}

// ============================================
// AUDIO PLAYER
// ============================================
function setupAudioPlayer() {
    const playBtn     = getEl('playPauseBtn');
    const audio       = getEl('mainAudio');
    const progressBar = getEl('progressBar');
    const downloadBtn = getEl('downloadBtn');
    const featPlay    = getEl('playFeatured');
    const followBtn   = document.querySelector('.btn-follow');

    if (playBtn) playBtn.addEventListener('click', togglePlay);

    if (audio) {
        audio.addEventListener('timeupdate', () => {
            const pct  = (audio.currentTime / audio.duration) * 100 || 0;
            const fill = getEl('progressFill');
            const cur  = getEl('currentTime');
            const dur  = getEl('duration');
            if (fill) fill.style.width = `${pct}%`;
            if (cur)  cur.textContent  = formatTime(audio.currentTime);
            if (dur && audio.duration) dur.textContent = formatTime(audio.duration);
        });
        audio.addEventListener('ended', pauseTrack);
    }

    if (progressBar && audio) {
        progressBar.addEventListener('click', e => {
            if (!isNaN(audio.duration)) {
                audio.currentTime = (e.offsetX / progressBar.clientWidth) * audio.duration;
            }
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (!currentTrack) { showNotification('Select a track first!', 'warning'); return; }
            window.open(currentTrack.url, '_blank');
        });
    }

    if (featPlay) {
        featPlay.addEventListener('click', () => {
            if (tracks.length > 0) selectTrack(tracks[0]);
            else showNotification('Music is still loading, please wait…', 'warning');
        });
    }

    if (followBtn) {
        followBtn.addEventListener('click', () => {
            followBtn.innerHTML = '<i class="fas fa-check"></i> Following';
            followBtn.style.background = 'rgba(125,95,255,0.5)';
        });
    }

    // Pro badge → Pro page
    const proBadge = document.querySelector('.pro-badge');
    if (proBadge) {
        proBadge.addEventListener('click', () => {
            ['homePage','submitPage','proPage','supportPage','donatePage'].forEach(id => {
                const p = getEl(id); if (p) p.style.display = 'none';
            });
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            const pro = getEl('proPage'); if (pro) pro.style.display = 'block';
        });
    }
}

// ============================================
// TRACK SELECTION & PLAYBACK
// ============================================
function selectTrack(track) {
    const audio = getEl('mainAudio');
    if (!audio) return;
    currentTrack = track;
    audio.src    = track.url;

    const img    = getEl('playerTrackImg');
    const title  = getEl('playerTrackTitle');
    const artist = getEl('playerTrackArtist');
    if (img)    img.src            = track.cover;
    if (title)  title.textContent  = track.title;
    if (artist) artist.textContent = track.artist;

    document.querySelectorAll('.track-card, .track-card-h').forEach(c => c.classList.remove('active'));
    const activeCard = document.querySelector(`[data-track-id="${track.id}"]`);
    if (activeCard) activeCard.classList.add('active');
    playTrack();
}

function togglePlay() { if (isPlaying) pauseTrack(); else playTrack(); }

function playTrack() {
    const audio   = getEl('mainAudio');
    const playBtn = getEl('playPauseBtn');
    if (!audio || !currentTrack) return;
    isPlaying = true;
    audio.play().catch(() => showNotification('Click any song to start playing.', 'warning'));
    if (playBtn) playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

function pauseTrack() {
    const audio   = getEl('mainAudio');
    const playBtn = getEl('playPauseBtn');
    isPlaying = false;
    if (audio)   audio.pause();
    if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
}

// ============================================
// FORMS
// ============================================
function setupForms() {
    ['artistForm','contactForm'].forEach(id => {
        const form = getEl(id);
        if (!form) return;
        form.addEventListener('submit', e => {
            e.preventDefault();
            showNotification("Submitted! We'll be in touch.");
            form.reset();
        });
    });

    document.querySelectorAll('.donate-opt').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.donate-opt').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// ============================================
// NOTIFICATIONS & UTILS
// ============================================
function showNotification(message, type = 'info') {
    const area = getEl('notificationArea');
    if (!area) return;
    const n = document.createElement('div');
    n.className   = `notification ${type}`;
    n.textContent = message;
    area.appendChild(n);
    setTimeout(() => { n.style.opacity = '0'; setTimeout(() => n.remove(), 400); }, 4000);
}

function formatTime(s) {
    if (!s || isNaN(s)) return '0:00';
    const m   = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

// ============================================
// START
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}