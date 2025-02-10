import { BASE_POSITIONS, HOME_ENTRANCE, HOME_POSITIONS, PLAYERS, SAFE_POSITIONS, START_POSITIONS, STATE, TURNING_POINTS } from './constants.js';
import { UI } from './UI.js';

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

    constructor() {
        console.log('Hello World! Let\'s play Ludo!');
        this.listenDiceClick();
        this.listenResetClick();
        this.listenPieceClick();
        this.resetGame();
    }

    listenDiceClick() {
        UI.listenDiceClick(this.onDiceClick.bind(this));
    }

    onDiceClick() {
        console.log('Dice clicked!');
        this.diceValue = 1 + Math.floor(Math.random() * 6);
        console.log(`Dice value rolled: ${this.diceValue}`);
        this.state = STATE.DICE_ROLLED;
        this.checkForEligiblePieces();
    }

    checkForEligiblePieces() {
        const player = PLAYERS[this.turn];
        const eligiblePieces = this.getEligiblePieces(player);
        console.log(`Eligible pieces for player ${player}:`, eligiblePieces);
        if (eligiblePieces.length) {
            UI.highlightPieces(player, eligiblePieces);
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
            this.state = STATE.DICE_NOT_ROLLED;
            return;
        }

        UI.unhighlightPieces();
        this.movePiece(player, piece, this.diceValue);
    }

    setPiecePosition(player, piece, newPosition) {
        console.log(`Setting piece ${piece} for player ${player} to position ${newPosition}`);
        this.currentPositions[player][piece] = newPosition;
        UI.setPiecePosition(player, piece, newPosition);
    }

    movePiece(player, piece, moveBy) {
        const interval = setInterval(() => {
            this.incrementPiecePosition(player, piece);
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

document.getElementById("dice-btn").addEventListener("click", function() {
    const dice = document.querySelector(".dice");
    
    // Generate a random number between 1 and 6
    const diceValue = Math.floor(Math.random() * 6) + 1;

    // Remove previous class and add new class for animation
    dice.classList.remove("roll");
    void dice.offsetWidth; // Trick to restart animation
    dice.classList.add("roll");

    // Update the dice face
    dice.setAttribute("data-roll", diceValue);

    // Show rolled value
    document.querySelector(".dice-value").textContent = `Rolled: ${diceValue}`;
});