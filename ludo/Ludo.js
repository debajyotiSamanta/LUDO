import { BASE_POSITIONS, HOME_ENTRANCE, HOME_POSITIONS, PLAYERS, SAFE_POSITIONS, START_POSITIONS, STATE, TURNING_POINTS } from './constants.js';
import { UI } from './UI.js';

const AUDIO_SETTINGS_KEY = 'ludo:audio-settings';

export class Ludo {
    currentPositions = {
        BLUE: [],
        YELLOW: [],
        GREEN: [],
        RED: []
    };

    _diceValue;
    get diceValue() {
        return this._diceValue;
    }
    set diceValue(value) {
        this._diceValue = value;
        UI.setDiceValue(value);
    }

    _turn;
    get turn() {
        return this._turn;
    }
    set turn(value) {
        this._turn = value;
        UI.setTurn(value);
    }

    _state;
    get state() {
        return this._state;
    }
    set state(value) {
        this._state = value;

        if (value === STATE.DICE_NOT_ROLLED) {
            UI.enableDice();
            UI.unhighlightPieces();
        } else {
            UI.disableDice();
        }
    }

    _diceClickBlocked = false;
    _audioContext = null;

    constructor() {
        console.log('Hello World! Let\'s play Ludo!');
        this.listenDiceClick();
        this.listenResetClick();
        this.listenPieceClick();
        this.resetGame();
    }

    getSfxConfig() {
        const defaultConfig = { sfxVolume: 78 };

        try {
            const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
            if (!raw) return defaultConfig;

            const parsed = JSON.parse(raw);
            const fallbackVolume = Number(parsed?.volume);
            const candidate = Number(parsed?.sfxVolume);
            const normalized = Number.isFinite(candidate)
                ? candidate
                : (Number.isFinite(fallbackVolume) ? fallbackVolume : defaultConfig.sfxVolume);
            const sfxVolume = Math.max(0, Math.min(100, normalized));
            return { sfxVolume };
        } catch {
            return defaultConfig;
        }
    }

    getAudioContext() {
        if (typeof window === 'undefined') return null;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;

        if (!this._audioContext) {
            this._audioContext = new AudioContextClass();
        }

        if (this._audioContext.state === 'suspended') {
            this._audioContext.resume().catch(() => {
                // Ignore resume failures; next user interaction can retry.
            });
        }

        return this._audioContext;
    }

    playDiceRollSound() {
        const config = this.getSfxConfig();
        if (config.sfxVolume <= 0) return;

        const context = this.getAudioContext();
        if (!context) return;

        const now = context.currentTime;
        const gainLevel = 0.26 * (config.sfxVolume / 100);

        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(420, now);
        oscillator.frequency.exponentialRampToValueAtTime(120, now + 0.24);

        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.exponentialRampToValueAtTime(gainLevel, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start(now);
        oscillator.stop(now + 0.27);
    }

    playMovementSound() {
        const config = this.getSfxConfig();
        if (config.sfxVolume <= 0) return;

        const context = this.getAudioContext();
        if (!context) return;

        const now = context.currentTime;
        const gainLevel = 0.14 * (config.sfxVolume / 100);

        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(360, now);
        oscillator.frequency.exponentialRampToValueAtTime(180, now + 0.08);

        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.exponentialRampToValueAtTime(gainLevel, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }

    listenDiceClick() {
        UI.listenDiceClick(this.onDiceClick.bind(this));
    }

    onDiceClick() {
        if (this._diceClickBlocked) {
            console.log('Dice click is blocked until a move is made.');
            return;
        }

        console.log('Dice clicked!');
        this.diceValue = 1 + Math.floor(Math.random() * 6);
        this.playDiceRollSound();
        console.log(`Dice value rolled: ${this.diceValue}`);
        this.updateDiceFace(this.diceValue);
        this.state = STATE.DICE_ROLLED;

        this.checkForEligiblePieces();
    }

    updateDiceFace(diceValue) {
        const dice = document.querySelector(".dice");
        dice.classList.remove("roll");
        void dice.offsetWidth; // Trick to restart animation
        dice.classList.add("roll");
        dice.setAttribute("data-roll", diceValue);
        document.querySelector(".dice-value").textContent = `Rolled: ${diceValue}`;
    }

    checkForEligiblePieces() {
        const player = PLAYERS[this.turn];
        const eligiblePieces = this.getEligiblePieces(player);
        console.log(`Eligible pieces for player ${player}:`, eligiblePieces);
        if (eligiblePieces.length) {
            UI.highlightPieces(player, eligiblePieces);
            this._diceClickBlocked = true;
            UI.disableDice();
        } else {
            this.incrementTurn();
        }
    }

    incrementTurn() {
        this.turn = (this.turn + 1) % PLAYERS.length;
        console.log(`Switching to player: ${PLAYERS[this.turn]}`);
        this.state = STATE.DICE_NOT_ROLLED;
    }

    getEligiblePieces(player) {
        return [0, 1, 2, 3].filter(piece => {
            const currentPosition = this.currentPositions[player][piece];
            console.log(`Checking piece ${piece} for player ${player} at position ${currentPosition}`);

            if (currentPosition === HOME_POSITIONS[player]) {
                console.log(`Piece ${piece} is in home position.`);
                return false;
            }

            if (BASE_POSITIONS[player].includes(currentPosition) && this.diceValue !== 6) {
                console.log(`Piece ${piece} is in base position and dice value is not 6.`);
                return false;
            }

            if (HOME_ENTRANCE[player].includes(currentPosition) && this.diceValue > HOME_POSITIONS[player] - currentPosition) {
                console.log(`Piece ${piece} is at home entrance and cannot move.`);
                return false;
            }

            return true;
        });
    }

    listenResetClick() {
        UI.listenResetClick(this.resetGame.bind(this));
    }

    resetGame() {
        console.log('Resetting game...');
        this.currentPositions = structuredClone(BASE_POSITIONS);

        PLAYERS.forEach(player => {
            [0, 1, 2, 3].forEach(piece => {
                this.setPiecePosition(player, piece, this.currentPositions[player][piece]);
            });
        });

        this.turn = 0;
        this.state = STATE.DICE_NOT_ROLLED;
    }

    listenPieceClick() {
        UI.listenPieceClick(this.onPieceClick.bind(this));
    }

    onPieceClick(event) {
        const target = event.target;

        if (!target.classList.contains('player-piece') || !target.classList.contains('highlight')) {
            return;
        }

        console.log('Piece clicked');
        const player = target.getAttribute('player-id');
        const piece = target.getAttribute('piece');
        this.handlePieceClick(player, piece);
    }

    handlePieceClick(player, piece) {
        console.log(`Handling click for player ${player}, piece ${piece}`);
        const currentPosition = this.currentPositions[player][piece];

        if (BASE_POSITIONS[player].includes(currentPosition)) {
            this.setPiecePosition(player, piece, START_POSITIONS[player]);
            this.playMovementSound();
            this.state = STATE.DICE_NOT_ROLLED;
            this._diceClickBlocked = false;
            UI.enableDice();
            return;
        }

        UI.unhighlightPieces();
        this.movePiece(player, piece, this.diceValue);
        this._diceClickBlocked = false;
        UI.enableDice();
    }

    setPiecePosition(player, piece, newPosition) {
        console.log(`Setting piece ${piece} for player ${player} to position ${newPosition}`);
        this.currentPositions[player][piece] = newPosition;
        UI.setPiecePosition(player, piece, newPosition);
    }

    movePiece(player, piece, moveBy) {
        const interval = setInterval(() => {
            this.incrementPiecePosition(player, piece);
            this.playMovementSound();
            moveBy--;

            console.log(`Piece ${piece} for player ${player} moved by 1 step. Moves remaining: ${moveBy}`);

            if (moveBy === 0) {
                clearInterval(interval);

                if (this.hasPlayerWon(player)) {
                    alert(`🏆 Player ${player} has won!`);
                    this.resetGame();
                    return;
                }

                const isKill = this.checkForKill(player, piece);

                if (isKill || this.diceValue === 6) {
                    this.state = STATE.DICE_NOT_ROLLED;
                    return;
                }

                this.incrementTurn();
            }
        }, 200);
    }

    checkForKill(player, piece) {
        const currentPosition = this.currentPositions[player][piece];
        let kill = false;

        PLAYERS.forEach(opponent => {
            if (opponent === player) return;

            [0, 1, 2, 3].forEach(piece => {
                const opponentPosition = this.currentPositions[opponent][piece];

                if (currentPosition === opponentPosition && !SAFE_POSITIONS.includes(currentPosition)) {
                    console.log(`Player ${player} kills opponent ${opponent}, piece ${piece}`);
                    this.setPiecePosition(opponent, piece, BASE_POSITIONS[opponent][piece]);
                    kill = true;
                }
            });
        });

        return kill;
    }

    hasPlayerWon(player) {
        return [0, 1, 2, 3].every(piece => this.currentPositions[player][piece] === HOME_POSITIONS[player]);
    }

    incrementPiecePosition(player, piece) {
        this.setPiecePosition(player, piece, this.getIncrementedPosition(player, piece));
    }

    getIncrementedPosition(player, piece) {
        const currentPosition = this.currentPositions[player][piece];

        if (currentPosition === TURNING_POINTS[player]) {
            console.log(`Piece ${piece} for player ${player} reached turning point.`);
            return HOME_ENTRANCE[player][0];
        } else if (currentPosition === 51) {
            console.log(`Piece ${piece} for player ${player} reached the end.`);
            return 0;
        }
        return currentPosition + 1;
    }
}
