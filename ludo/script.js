const scene = document.getElementById('lobby-scene');
const playLink = document.getElementById('play-link');
const loadingLabel = document.getElementById('loading-label');
const loadingPercent = document.getElementById('loading-percent');
const loadingFill = document.getElementById('loading-fill');

const settingsButton = document.getElementById('toggle-settings');
const rulesButton = document.getElementById('toggle-rules');
const settingsPanel = document.getElementById('settings-panel');
const rulesPanel = document.getElementById('rules-panel');

const musicVolume = document.getElementById('music-volume');
const sfxVolume = document.getElementById('sfx-volume');
const musicTrack = document.getElementById('music-track');
const menuMusic = document.getElementById('menu-music');
const AUDIO_SETTINGS_KEY = 'ludo:audio-settings';

const TRACKS = {
    mountain_king: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Musopen_-_In_the_Hall_Of_The_Mountain_King.ogg',
        playbackRate: 1,
    },
    morning: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Musopen_-_Morning.ogg',
        playbackRate: 1,
    },
    bach_joy: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Bach%2C_BWV_147%2C_10._Jesus_bleibet_meine_Freude.ogg',
        playbackRate: 1,
    },
    moldau: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Bedrich_Smetana_-_ma_vlast_-_i._vltava_%27the_moldau%27.ogg',
        playbackRate: 1,
    },
    new_world_largo: {
        src: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Antonin_Dvorak_-_symphony_no._9_in_e_minor_%27from_the_new_world%27%2C_op._95_-_ii._largo.ogg',
        playbackRate: 1,
    },
    silent: { src: '', playbackRate: 1 },
};

let lobbyReady = false;
let hasUnlockedAudio = false;
let targetLookX = 0;
let targetLookY = 0;
let currentLookX = 0;
let currentLookY = 0;
let panoramaLoopId = 0;

function clampVolume(value) {
    return Math.max(0, Math.min(100, Number(value) || 0));
}

function loadSavedAudioSettings() {
    try {
        const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
        if (!raw) return;

        const saved = JSON.parse(raw);

        if (typeof saved.track === 'string' && Object.prototype.hasOwnProperty.call(TRACKS, saved.track)) {
            musicTrack.value = saved.track;
        }

        if (saved.volume !== undefined) {
            musicVolume.value = String(clampVolume(saved.volume));
        }

        if (saved.sfxVolume !== undefined) {
            sfxVolume.value = String(clampVolume(saved.sfxVolume));
        }
    } catch {
        // Ignore invalid local storage payloads.
    }
}

function saveAudioSettings() {
    const payload = {
        track: musicTrack.value,
        volume: clampVolume(musicVolume.value),
        sfxVolume: clampVolume(sfxVolume.value),
    };

    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(payload));
}

function updatePanoramaFromPointer(clientX, clientY) {
    if (!scene) return;

    const rect = scene.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((clientY - rect.top) / rect.height - 0.5) * 2;

    targetLookX = Math.max(-1, Math.min(1, x));
    targetLookY = Math.max(-1, Math.min(1, y));
}

function clearPanoramaPointer() {
    targetLookX = 0;
    targetLookY = 0;
}

function startPanoramaMotion() {
    if (!scene) return;

    const animate = (timestamp) => {
        const t = timestamp * 0.00017;
        const autoX = Math.sin(t) * 124 + Math.sin(t * 0.47) * 50;
        const autoY = Math.cos(t * 0.65) * 24;

        currentLookX += (targetLookX - currentLookX) * 0.09;
        currentLookY += (targetLookY - currentLookY) * 0.09;

        const lookX = currentLookX * 62;
        const lookY = currentLookY * 30;

        scene.style.setProperty('--pan-back-x', `${(autoX * 0.4 + lookX * 0.58).toFixed(2)}px`);
        scene.style.setProperty('--pan-back-y', `${(autoY * 0.58 + lookY * 0.5).toFixed(2)}px`);
        scene.style.setProperty('--pan-mid-x', `${(autoX * 0.67 + lookX * 0.95).toFixed(2)}px`);
        scene.style.setProperty('--pan-mid-y', `${(autoY * 0.86 + lookY * 0.78).toFixed(2)}px`);
        scene.style.setProperty('--pan-front-x', `${(autoX * 0.95 + lookX * 1.3).toFixed(2)}px`);
        scene.style.setProperty('--pan-front-y', `${(autoY * 1.16 + lookY * 1.05).toFixed(2)}px`);
        scene.style.setProperty('--panel-shift-x', `${(-currentLookX * 18).toFixed(2)}px`);
        scene.style.setProperty('--panel-shift-y', `${(-currentLookY * 10).toFixed(2)}px`);

        panoramaLoopId = window.requestAnimationFrame(animate);
    };

    panoramaLoopId = window.requestAnimationFrame(animate);
}

function setDrawer(button, panel, shouldOpen) {
    panel.hidden = !shouldOpen;
    button.setAttribute('aria-expanded', String(shouldOpen));
}

function closeOtherPanels(activePanel) {
    if (activePanel !== settingsPanel) {
        setDrawer(settingsButton, settingsPanel, false);
    }

    if (activePanel !== rulesPanel) {
        setDrawer(rulesButton, rulesPanel, false);
    }
}

function unlockAudio() {
    if (hasUnlockedAudio) return;
    hasUnlockedAudio = true;

    if (!menuMusic || musicTrack.value === 'silent') return;

    menuMusic.loop = true;
    menuMusic.muted = false;
    menuMusic.play().catch(() => {
        // Browsers may still block playback; user can trigger again with controls.
    });
}

function applyTrackSelection() {
    const track = TRACKS[musicTrack.value] ?? TRACKS.mountain_king;
    const selectedUrl = track.src ? new URL(track.src, window.location.href).href : '';
    const currentUrl = menuMusic.currentSrc || menuMusic.src;

    if (track.src) {
        if (currentUrl !== selectedUrl) {
            menuMusic.src = track.src;
            menuMusic.load();
            menuMusic.currentTime = 0;
        }

        menuMusic.loop = true;
        menuMusic.playbackRate = track.playbackRate;
        menuMusic.volume = clampVolume(musicVolume.value) / 100;
        menuMusic.muted = false;

        if (hasUnlockedAudio) {
            menuMusic.play().catch(() => {
                // Ignore blocked autoplay.
            });
        }
        return;
    }

    menuMusic.pause();
    menuMusic.currentTime = 0;
}

function setPlayReady() {
    lobbyReady = true;
    playLink.classList.remove('is-disabled');
    playLink.removeAttribute('aria-disabled');
    loadingLabel.textContent = 'Game loaded. Click Play.';
}

function runLoadingSequence() {
    let progress = 0;
    const interval = setInterval(() => {
        const step = Math.max(1, Math.floor(Math.random() * 7));
        progress = Math.min(100, progress + step);

        loadingFill.style.width = `${progress}%`;
        loadingPercent.textContent = `${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
            setPlayReady();
        }
    }, 85);
}

scene.addEventListener('pointermove', (event) => updatePanoramaFromPointer(event.clientX, event.clientY));
scene.addEventListener('pointerleave', clearPanoramaPointer);

scene.addEventListener('pointerdown', unlockAudio, { once: true });
window.addEventListener('keydown', unlockAudio, { once: true });

settingsButton.addEventListener('click', () => {
    unlockAudio();
    const shouldOpen = settingsPanel.hidden;
    closeOtherPanels(settingsPanel);
    setDrawer(settingsButton, settingsPanel, shouldOpen);
});

rulesButton.addEventListener('click', () => {
    unlockAudio();
    const shouldOpen = rulesPanel.hidden;
    closeOtherPanels(rulesPanel);
    setDrawer(rulesButton, rulesPanel, shouldOpen);
});

musicVolume.addEventListener('input', () => {
    menuMusic.volume = clampVolume(musicVolume.value) / 100;
    saveAudioSettings();
});

sfxVolume.addEventListener('input', saveAudioSettings);

musicTrack.addEventListener('change', () => {
    applyTrackSelection();
    saveAudioSettings();
});

playLink.addEventListener('click', (event) => {
    unlockAudio();
    saveAudioSettings();

    if (lobbyReady) return;

    event.preventDefault();
    loadingLabel.textContent = 'Almost done. Please wait...';
});

loadSavedAudioSettings();
menuMusic.loop = true;
menuMusic.volume = clampVolume(musicVolume.value) / 100;
applyTrackSelection();
saveAudioSettings();
runLoadingSequence();

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
    startPanoramaMotion();
}
