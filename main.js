import { Ludo } from './ludo/Ludo.js';

const ludo = new Ludo();
document.body.addEventListener('click', () => {
    const audio = document.getElementById('background-music');
    if (audio.muted) {
        audio.muted = false;
        audio.play(); 
    }
});


