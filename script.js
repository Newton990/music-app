// ============================================
// NMstream – v1.6  (Deezer API + CORS Proxy)
// ============================================

const DEEZER_BASE  = 'https://api.deezer.com';
const CORS_PROXY   = 'https://corsproxy.io/?';
const ROW_LIMIT    = 20;

const SAMPLE_TRACKS = [
    {
        id: 's1',
        title: 'Sunset Drive',
        artist: 'Neon Waves',
        cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        albumId: 'a1',
        albumTitle: 'Neon Nights',
        albumCover: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=400&h=400&fit=crop',
        tags: ['electronic', 'ambient']
    },
    {
        id: 's2',
        title: 'City Lights',
        artist: 'Neon Waves',
        cover: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=400&fit=crop',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        albumId: 'a1',
        albumTitle: 'Neon Nights',
        albumCover: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=400&h=400&fit=crop',
        tags: ['electronic']
    },
    {
        id: 's3',
        title: 'Midnight Jazz',
        artist: 'Velvet Echo',
        cover: 'https://images.unsplash.com/photo-1511376777868-611b54f68947?w=400&h=400&fit=crop',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        albumId: 'a2',
        albumTitle: 'Midnight Vibes',
        albumCover: 'https://images.unsplash.com/photo-1511376777868-611b54f68947?w=400&h=400&fit=crop',
        tags: ['jazz', 'ambient']
    },
    {
        id: 's4',
        title: 'Velvet Rain',
        artist: 'Velvet Echo',
        cover: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400&h=400&fit=crop',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        albumId: 'a2',
        albumTitle: 'Midnight Vibes',
        albumCover: 'https://images.unsplash.com/photo-1511376777868-611b54f68947?w=400&h=400&fit=crop',
        tags: ['jazz']
    },
    {
        id: 's5',
        title: 'Summer Drive',
        artist: 'Golden Sun',
        cover: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=400&h=400&fit=crop',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        albumId: 'a3',
        albumTitle: 'Highway Dreams',
        albumCover: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=400&h=400&fit=crop',
        tags: ['rock', 'pop']
    },
    {
        id: 's6',
        title: 'Road Trip',
        artist: 'Golden Sun',
        cover: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=400&h=400&fit=crop',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        albumId: 'a3',
        albumTitle: 'Highway Dreams',
        albumCover: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=400&h=400&fit=crop',
        tags: ['rock']
    }
];

function getFallbackTracks(tag = '', query = '') {
    const normalizedQuery = (query || '').trim().toLowerCase();
    return SAMPLE_TRACKS.filter(track => {
        const tagMatch = !tag || track.tags?.some(t => t.toLowerCase() === tag.toLowerCase());
        const queryMatch = !normalizedQuery || [track.title, track.artist, track.albumTitle]
            .some(text => text && text.toLowerCase().includes(normalizedQuery));
        return tagMatch && queryMatch;
    });
}

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
let tracks            = [];
let currentTrack      = null;
let isPlaying         = false;
let activeDownloadUrl = null;
let activeSearchTracks = [];

// ============================================
// HELPERS
// ============================================
const getEl = id => document.getElementById(id);

function buildDeezerUrl(tag = '', query = '', limit = ROW_LIMIT) {
    if (!tag && !query) {
        return `${DEEZER_BASE}/chart/0/tracks?limit=${limit}`;
    }
    const searchQuery = query || tag;
    return `${DEEZER_BASE}/search?q=${encodeURIComponent(searchQuery)}&limit=${limit}&order=RANKING`;
}

async function deezerFetch(tag = '', query = '', limit = ROW_LIMIT) {
    const apiUrl = buildDeezerUrl(tag, query, limit);
    const proxyUrl = CORS_PROXY + encodeURIComponent(apiUrl);

    try {
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error.message || 'Deezer API error');
        return data.data || [];
    } catch (err) {
        console.error('Deezer fetch failed:', err);
        try {
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error.message || 'Deezer API error');
            return data.data || [];
        } catch (directErr) {
            console.error('Deezer direct fetch failed:', directErr);
            return null;
        }
    }
}

function mapTrack(item) {
    return {
        id:          item.id,
        title:       item.title,
        artist:      item.artist?.name || 'Unknown Artist',
        cover:       item.album?.cover_medium || item.album?.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
        url:         item.preview,
        albumId:     item.album?.id || null,
        albumTitle:  item.album?.title || null,
        albumCover:  item.album?.cover_medium || item.album?.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'
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

    let results = await deezerFetch(tag);
    if (results === null || results.length === 0) {
        const fallback = getFallbackTracks(tag);
        if (fallback.length > 0) {
            results = fallback;
        } else if (results === null) {
            scroll.innerHTML = '<div class="no-results">⚠️ Could not load – check your internet connection.</div>';
            return;
        } else {
            scroll.innerHTML = '<div class="no-results">No tracks found for this genre.</div>';
            return;
        }
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

function showAlbumTracks(albumId, albumTitle) {
    const grid = getEl('searchGrid');
    const header = getEl('searchResultsTitle');
    if (!grid) return;

    if (header) {
        header.textContent = `🎵 Tracks from "${albumTitle}"`;
    }
    grid.innerHTML = '';

    activeSearchTracks
        .filter(track => track.albumId === albumId)
        .forEach(track => {
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

async function doSearch(query) {
    const container = getEl('genreRows');
    if (!container) return;
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching…</div>';

    const results = await deezerFetch('', query, 40);

    if (results === null || results.length === 0) {
        const fallback = getFallbackTracks('', query);
        if (fallback.length > 0) {
            results = fallback;
        } else if (results === null) {
            container.innerHTML = '<div class="error"><p>⚠️ Search failed. Check your connection.</p></div>';
            return;
        } else {
            container.innerHTML = '<div class="no-results">No songs matched your search.</div>';
            return;
        }
    }

    tracks = [];
    activeSearchTracks = [];
    const albumMap = new Map();
    results.forEach(item => {
        const track = mapTrack(item);
        tracks.push(track);
        activeSearchTracks.push(track);
        if (track.albumId && !albumMap.has(track.albumId)) {
            albumMap.set(track.albumId, {
                id:    track.albumId,
                title: track.albumTitle || 'Unknown Album',
                cover: track.albumCover,
                artist: track.artist
            });
        }
    });

    const albumSection = albumMap.size > 0 ? `
        <div class="genre-row">
            <div class="genre-row-header">
                <h3 class="genre-row-title">📀 Albums matching "${query}"</h3>
            </div>
            <div class="music-grid album-grid" id="albumGrid"></div>
        </div>` : '';

    container.innerHTML = `${albumSection}
        <div class="genre-row">
            <div class="genre-row-header">
                <h3 class="genre-row-title" id="searchResultsTitle">🔍 Search Results (${results.length})</h3>
            </div>
            <div class="music-grid" id="searchGrid"></div>
        </div>`;

    const albumGrid = getEl('albumGrid');
    if (albumGrid) {
        Array.from(albumMap.values()).forEach(album => {
            const albumCard = document.createElement('div');
            albumCard.className = 'album-card';
            albumCard.innerHTML = `
                <div class="card-img-container">
                    <img src="${album.cover}" alt="${album.title}" loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'">
                </div>
                <div class="track-info">
                    <h3 title="${album.title}">${album.title}</h3>
                    <p title="${album.artist}">${album.artist}</p>
                </div>`;
            albumCard.onclick = () => showAlbumTracks(album.id, album.title);
            albumGrid.appendChild(albumCard);
        });
    }

    const grid = getEl('searchGrid');
    if (!grid) return;
    results.forEach(item => {
        const track = mapTrack(item);
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

            const results = await deezerFetch(tag, '', 60);
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
        downloadBtn.addEventListener('click', async () => {
            if (!currentTrack) {
                showNotification('Select a track first!', 'warning');
                return;
            }
            if (currentTrack.downloadReady && currentTrack.downloadUrl) {
                triggerDownload(currentTrack);
                return;
            }
            showNotification('Preparing your download…');
            const ready = await prepareDownload(currentTrack);
            if (ready) {
                triggerDownload(currentTrack);
            } else {
                window.open(currentTrack.url, '_blank');
            }
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

    prepareDownload(track);
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

async function prepareDownload(track) {
    if (!track || !track.url) return false;
    if (track.downloadReady && track.downloadUrl) return true;

    async function tryFetch(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
    }

    let blob;
    try {
        blob = await tryFetch(track.url);
    } catch {
        try {
            const proxyUrl = CORS_PROXY + encodeURIComponent(track.url);
            blob = await tryFetch(proxyUrl);
        } catch {
            console.warn('Download prep failed');
            showNotification('Could not prefetch the track. Opening the audio link instead.', 'warning');
            return false;
        }
    }

    if (activeDownloadUrl) URL.revokeObjectURL(activeDownloadUrl);
    const downloadUrl = URL.createObjectURL(blob);
    activeDownloadUrl = downloadUrl;
    track.downloadUrl = downloadUrl;
    track.downloadReady = true;
    track.downloadFileName = `${track.artist || 'track'} - ${track.title || 'audio'}.mp3`;
    showNotification('Music is ready to download.');
    return true;
}

function triggerDownload(track) {
    const link = document.createElement('a');
    link.href = track.downloadUrl || track.url;
    link.download = track.downloadFileName || `${track.title || 'track'}.mp3`;
    document.body.appendChild(link);
    link.click();
    link.remove();
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