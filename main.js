import { Ludo } from './ludo/Ludo.js';

const AUDIO_SETTINGS_KEY = 'ludo:audio-settings';
const DEFAULT_VOLUME = 45;

const TRACKS = {
    mountain_king: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Musopen_-_In_the_Hall_Of_The_Mountain_King.ogg',
    morning: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Musopen_-_Morning.ogg',
    bach_joy: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Bach%2C_BWV_147%2C_10._Jesus_bleibet_meine_Freude.ogg',
    moldau: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Bedrich_Smetana_-_ma_vlast_-_i._vltava_%27the_moldau%27.ogg',
    new_world_largo: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Antonin_Dvorak_-_symphony_no._9_in_e_minor_%27from_the_new_world%27%2C_op._95_-_ii._largo.ogg',
    silent: '',
};

function clampVolume(value) {
    return Math.max(0, Math.min(100, Number(value) || DEFAULT_VOLUME));
}

function readLobbyAudioSettings() {
    try {
        const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
        return null;
    }
}

function applyLobbyAudioSettings(audioElement) {
    const settings = readLobbyAudioSettings();
    const savedTrack = typeof settings?.track === 'string' ? settings.track : '';
    const isKnownTrack = Object.prototype.hasOwnProperty.call(TRACKS, savedTrack);
    const nextTrackSrc = isKnownTrack ? TRACKS[savedTrack] : '';
    const volume = clampVolume(settings?.volume ?? DEFAULT_VOLUME) / 100;

    audioElement.loop = true;
    audioElement.volume = volume;

    if (!isKnownTrack) {
        return { silent: false };
    }

    if (!nextTrackSrc) {
        audioElement.pause();
        audioElement.currentTime = 0;
        audioElement.muted = true;
        audioElement.removeAttribute('src');
        return { silent: true };
    }

    const targetUrl = new URL(nextTrackSrc, window.location.href).href;
    const currentUrl = audioElement.currentSrc || audioElement.src;

    if (currentUrl !== targetUrl) {
        audioElement.src = nextTrackSrc;
        audioElement.load();
    }

    audioElement.muted = true;
    return { silent: false };
}

const ludo = new Ludo();

const audio = document.getElementById('background-music');
const audioState = audio ? applyLobbyAudioSettings(audio) : { silent: false };
const diceButton = document.getElementById('dice-btn');

function startGameMusic() {
    if (!audio || audioState.silent) return;

    audio.loop = true;
    if (audio.muted) {
        audio.muted = false;
    }

    audio.play().catch(() => {
        // Ignore autoplay rejections; next interaction can retry.
    });
}

if (diceButton) {
    diceButton.addEventListener('click', startGameMusic);
}

document.body.addEventListener('click', startGameMusic);


