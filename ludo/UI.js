import { COORDINATES_MAP, PLAYERS, STEP_LENGTH } from './constants.js';

const diceButtonElement = document.querySelector('#dice-btn');
const playerPiecesElements = {
    BLUE: document.querySelectorAll('[player-id="BLUE"].player-piece'),
    YELLOW: document.querySelectorAll('[player-id="YELLOW"].player-piece'),
    GREEN: document.querySelectorAll('[player-id="GREEN"].player-piece'),
    RED: document.querySelectorAll('[player-id="RED"].player-piece'),
};

export class UI {
    static listenDiceClick(callback) {
        diceButtonElement.addEventListener('click', callback);
    }

    static listenResetClick(callback) {
        document.querySelector('button#reset-btn').addEventListener('click', callback);
    }

    static listenPieceClick(callback) {
        document.querySelector('.player-pieces').addEventListener('click', callback);
    }

    /**
     * Set the position of a player's piece on the board.
     * @param {string} player - The player's ID (e.g., BLUE, GREEN, YELLOW, RED).
     * @param {Number} piece - The piece number (0-3).
     * @param {Number} newPosition - The new position on the board.
     */
    static setPiecePosition(player, piece, newPosition) {
        if (!playerPiecesElements[player] || !playerPiecesElements[player][piece]) {
            console.error(`Player element of given player: ${player} and piece: ${piece} not found`);
            return;
        }

        const [x, y] = COORDINATES_MAP[newPosition];

        const pieceElement = playerPiecesElements[player][piece];
        pieceElement.style.top = y * STEP_LENGTH + '%';
        pieceElement.style.left = x * STEP_LENGTH + '%';
    }

    /**
     * Update the turn indicator and highlight the active player's base.
     * @param {number} index - The index of the active player in the `PLAYERS` array.
     */
    static setTurn(index) {
        if (index < 0 || index >= PLAYERS.length) {
            console.error('Index out of bound!');
            return;
        }

        const player = PLAYERS[index];

        // Display player ID
        document.querySelector('.active-player span').innerText = player;

        const activePlayerBase = document.querySelector('.player-base.highlight');
        if (activePlayerBase) {
            activePlayerBase.classList.remove('highlight');
        }

        // Highlight the active player's base
        document.querySelector(`[player-id="${player}"].player-base`).classList.add('highlight');
    }

    static enableDice() {
        diceButtonElement.removeAttribute('disabled');
    }

    static disableDice() {
        diceButtonElement.setAttribute('disabled', '');
    }

    /**
     * Highlight the eligible pieces of a player for movement.
     * @param {string} player - The player's ID.
     * @param {Number[]} pieces - Array of eligible piece indices.
     */
    static highlightPieces(player, pieces) {
        pieces.forEach(piece => {
            const pieceElement = playerPiecesElements[player][piece];
            pieceElement.classList.add('highlight');
        });
    }

    /**
     * Remove highlights from all pieces.
     */
    static unhighlightPieces() {
        document.querySelectorAll('.player-piece.highlight').forEach(ele => {
            ele.classList.remove('highlight');
        });
    }

    /**
     * Set the dice value in the UI.
     * @param {number} value - The rolled dice value.
     */
    static setDiceValue(value) {
        document.querySelector('.dice-value').innerText = value;
    }
}

// Example usage for testing
// UI.setPiecePosition('BLUE', 0, 0);
// UI.setTurn(0);
// UI.setTurn(1);
// UI.disableDice();
// UI.enableDice();
// UI.highlightPieces('BLUE', [0]);
// UI.unhighlightPieces();
// UI.setDiceValue(5);
