// Jamendo API Configuration
const JAMENDO_CLIENT_ID = '56d30cce'; // More reliable test client ID
const API_BASE_URL = 'https://api.jamendo.com/v3.0';


// State
let tracks = [];
let currentTrack = null;
let isPlaying = false;
let currentGenre = 'all';

// Pages
const homePage = document.getElementById('homePage');
const submitPage = document.getElementById('submitPage');
const proPage = document.getElementById('proPage');
const supportPage = document.getElementById('supportPage');
const donatePage = document.getElementById('donatePage');

// Nav Links
const navLinks = [
    { id: 'navHome', page: homePage },
    { id: 'navSearch', page: homePage },
    { id: 'navSubmit', page: submitPage },
    { id: 'navPro', page: proPage },
    { id: 'navSupport', page: supportPage },
    { id: 'navDonate', page: donatePage }
];

// Audio Elements
const mainAudio = document.getElementById('mainAudio');
const playPauseBtn = document.getElementById('playPauseBtn');
const progressFill = document.getElementById('progressFill');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');

// Initialize App
function initApp() {
    fetchTracks(); // Initial fetch
    setupNavigation();
    setupAudioPlayer();
    setupForms();
    setupSearch();
}

async function fetchTracks(query = '', genre = 'all') {
    const grid = document.getElementById('musicGrid');
    grid.innerHTML = '<div class="loading">Loading fresh tracks...</div>';
    
    let url = `${API_BASE_URL}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=24&include=musicinfo&imagesize=400&order=popularity_week`;

    
    if (query) {
        url += `&search=${encodeURIComponent(query)}`;
    }
    
    if (genre !== 'all') {
        url += `&tags=${encodeURIComponent(genre)}`;
    }

    console.log('Fetching music from:', url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.results && data.results.length > 0) {
            tracks = data.results.map(item => ({
                id: item.id,
                title: item.name,
                artist: item.artist_name,
                genre: item.musicinfo?.genre || 'Various',
                cover: item.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
                url: item.audio
            }));
            renderTracks(tracks);
        } else {
            console.warn('No tracks found for query:', query);
            grid.innerHTML = '<div class="no-results">No tracks found. Try a broader search like "lofi" or "rock"!</div>';
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        grid.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load music.</p>
                <small>Reason: ${error.message}</small>
                <br>
                <button onclick="fetchTracks()" class="retry-btn">Retry</button>
            </div>
        `;
    }
}


function renderTracks(data) {
    const grid = document.getElementById('musicGrid');
    grid.innerHTML = '';
    
    data.forEach(track => {
        const card = document.createElement('div');
        card.className = `track-card ${currentTrack?.id === track.id ? 'active' : ''}`;
        card.innerHTML = `
            <div class="card-img-container">
                <img src="${track.cover}" alt="${track.title}">
                <div class="play-overlay"><i class="fas fa-play"></i></div>
            </div>
            <div class="track-info">
                <h3 title="${track.title}">${track.title}</h3>
                <p title="${track.artist}">${track.artist}</p>
            </div>
        `;
        card.onclick = () => selectTrack(track);
        grid.appendChild(card);
    });
}

function setupNavigation() {
    navLinks.forEach(linkObj => {
        const el = document.getElementById(linkObj.id);
        if (el) {
            el.onclick = (e) => {
                e.preventDefault();
                [homePage, submitPage, proPage, supportPage, donatePage].forEach(p => p.style.display = 'none');
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                
                linkObj.page.style.display = 'block';
                el.classList.add('active');
                window.scrollTo(0, 0);

                if (linkObj.id === 'navSearch') {
                    document.getElementById('musicSearch').focus();
                }
            };
        }
    });

    // Genre Bar
    document.getElementById('genreBar').onclick = (e) => {
        if (e.target.classList.contains('genre-btn')) {
            document.querySelectorAll('.genre-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentGenre = e.target.dataset.genre;
            fetchTracks('', currentGenre);
        }
    };
}

function setupSearch() {
    const searchInput = document.getElementById('musicSearch');
    let debounceTimer;

    searchInput.oninput = (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchTracks(e.target.value, currentGenre);
        }, 500);
    };
}

function setupForms() {
    document.getElementById('artistForm').onsubmit = (e) => {
        e.preventDefault();
        showNotification('Success! Your track has been submitted for review.');
        e.target.reset();
    };

    document.getElementById('contactForm').onsubmit = (e) => {
        e.preventDefault();
        showNotification('Thank you! Your message has been sent.');
        e.target.reset();
    };

    document.querySelectorAll('.donate-opt').forEach(opt => {
        opt.onclick = () => {
            document.querySelectorAll('.donate-opt').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
        };
    });
}

function setupAudioPlayer() {
    playPauseBtn.onclick = togglePlay;

    mainAudio.ontimeupdate = () => {
        const percent = (mainAudio.currentTime / mainAudio.duration) * 100;
        progressFill.style.width = `${percent}%`;
        currentTimeEl.textContent = formatTime(mainAudio.currentTime);
        if (mainAudio.duration) durationEl.textContent = formatTime(mainAudio.duration);
    };

    progressBar.onclick = (e) => {
        const width = progressBar.clientWidth;
        const clickX = e.offsetX;
        mainAudio.currentTime = (clickX / width) * mainAudio.duration;
    };

    document.getElementById('downloadBtn').onclick = () => {
        if (!currentTrack) {
            showNotification('Please select a track first!', 'warning');
            return;
        }
        showNotification(`Downloading ${currentTrack.title}...`);
        const link = document.createElement('a');
        link.href = currentTrack.url;
        link.download = `${currentTrack.title}.mp3`;
        link.target = '_blank'; // Open in new tab for direct audio links
        link.click();
    };
}

function selectTrack(track) {
    currentTrack = track;
    mainAudio.src = track.url;
    document.getElementById('playerTrackImg').src = track.cover;
    document.getElementById('playerTrackTitle').textContent = track.title;
    document.getElementById('playerTrackArtist').textContent = track.artist;
    
    // Refresh grid to show active state
    renderTracks(tracks);
    playTrack();
}

function togglePlay() {
    if (isPlaying) pauseTrack();
    else playTrack();
}

function playTrack() {
    if (!currentTrack) return;
    isPlaying = true;
    mainAudio.play().catch(err => {
        console.error('Audio play failed:', err);
        showNotification('Failed to play track. It might be blocked or unavailable.', 'error');
    });
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

function pauseTrack() {
    isPlaying = false;
    mainAudio.pause();
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
}

function showNotification(message, type = 'info') {
    const area = document.getElementById('notificationArea');
    const n = document.createElement('div');
    n.className = `notification ${type}`;
    n.textContent = message;
    area.appendChild(n);
    setTimeout(() => {
        n.style.opacity = '0';
        setTimeout(() => n.remove(), 300);
    }, 3000);
}

function formatTime(s) {
    if (isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

initApp();