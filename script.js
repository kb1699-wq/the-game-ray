
// ======================================
// NUMBER SHIFT - GAME JAVASCRIPT
// ======================================


// GET HTML ELEMENTS

const board = document.getElementById("puzzle-board");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const bestScoreDisplay = document.getElementById("best-score");
const message = document.getElementById("game-message");

const startButton = document.getElementById("start-btn");
const restartButton = document.getElementById("restart-btn");


// GAME VARIABLES

let tiles = [];
let timeLeft = 300;
let score = 0;
let timerInterval = null;
let gameStarted = false;
let gameOver = false;


// LOAD BEST SCORE

let bestScore = Number(localStorage.getItem("numberShiftBest")) || 0;

bestScoreDisplay.textContent = bestScore;


// CREATE THE PUZZLE

function createPuzzle() {

    tiles = [];

    for (let i = 1; i <= 15; i++) {
        tiles.push(i);
    }

    // Empty space
    tiles.push(0);

    shufflePuzzle();

    drawBoard();
}


// SHUFFLE THE PUZZLE

function shufflePuzzle() {

    // Start with a solved board.
    tiles = [];

    for (let i = 1; i <= 15; i++) {
        tiles.push(i);
    }

    tiles.push(0);

    // Make 300 random legal moves.
    for (let i = 0; i < 300; i++) {

        const emptyIndex = tiles.indexOf(0);

        const possibleMoves = getPossibleMoves(emptyIndex);

        const randomMove =
            possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

        // Swap the empty space with a neighboring tile.
        [tiles[emptyIndex], tiles[randomMove]] =
        [tiles[randomMove], tiles[emptyIndex]];
    }
}


// FIND POSSIBLE TILE MOVES

function getPossibleMoves(emptyIndex) {

    const moves = [];

    const row = Math.floor(emptyIndex / 4);
    const col = emptyIndex % 4;

    if (row > 0) moves.push(emptyIndex - 4);

    if (row < 3) moves.push(emptyIndex + 4);

    if (col > 0) moves.push(emptyIndex - 1);

    if (col < 3) moves.push(emptyIndex + 1);

    return moves;
}


// DISPLAY THE PUZZLE BOARD

function drawBoard() {

    board.innerHTML = "";

    tiles.forEach((number, index) => {

        const tile = document.createElement("button");

        tile.classList.add("tile");

        if (number === 0) {

            tile.classList.add("empty");
            tile.disabled = true;

        } else {

            tile.textContent = number;

            tile.addEventListener("click", () => {
                moveTile(index);
            });

        }

        board.appendChild(tile);

    });

}


// MOVE A TILE

function moveTile(index) {

    if (!gameStarted || gameOver) return;

    const emptyIndex = tiles.indexOf(0);

    const possibleMoves = getPossibleMoves(emptyIndex);

    if (!possibleMoves.includes(index)) return;

    // Swap the selected tile with the empty space.
    [tiles[index], tiles[emptyIndex]] =
    [tiles[emptyIndex], tiles[index]];

    drawBoard();

    checkWin();

}


// START THE GAME

function startGame() {

    clearInterval(timerInterval);

    timeLeft = 300;
    score = 0;

    gameStarted = true;
    gameOver = false;

    scoreDisplay.textContent = score;

    timerDisplay.textContent = "05:00";

    message.textContent = "Good luck! Solve the puzzle!";

    createPuzzle();

    startButton.disabled = true;

    startTimer();

}


// COUNTDOWN TIMER

function startTimer() {

    timerInterval = setInterval(() => {

        timeLeft--;

        const minutes = Math.floor(timeLeft / 60);

        const seconds = timeLeft % 60;

        timerDisplay.textContent =
            String(minutes).padStart(2, "0") + ":" +
            String(seconds).padStart(2, "0");

        if (timeLeft <= 0) {

            endGame(false);

        }

    }, 1000);

}


// CHECK IF THE PUZZLE IS SOLVED

function checkWin() {

    for (let i = 0; i < 15; i++) {

        if (tiles[i] !== i + 1) {

            return;

        }

    }

    endGame(true);

}


// CALCULATE SCORE

function calculateScore() {

    // Faster completion earns more points.
    return Math.max(0, timeLeft * 10);

}


// END THE GAME

function endGame(won) {

    clearInterval(timerInterval);

    gameStarted = false;
    gameOver = true;

    startButton.disabled = false;

    if (won) {

        score = calculateScore();

        scoreDisplay.textContent = score;

        message.textContent =
            "🏆 YOU WON! Completion time: " +
            formatTime(300 - timeLeft) +
            " | Final score: " + score;

        if (score > bestScore) {

            bestScore = score;

            localStorage.setItem("numberShiftBest", bestScore);

            bestScoreDisplay.textContent = bestScore;

            message.textContent += " | NEW HIGH SCORE!";

        }

    } else {

        message.textContent = "⏰ TIME'S UP! Better luck next time!";

    }

}


// FORMAT TIME

function formatTime(seconds) {

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;

    return String(minutes).padStart(2, "0") + ":" +
           String(remainingSeconds).padStart(2, "0");

}


// KEYBOARD CONTROLS

document.addEventListener("keydown", (event) => {

    if (!gameStarted || gameOver) return;

    const emptyIndex = tiles.indexOf(0);

    let targetIndex = -1;

    switch (event.key) {

        case "ArrowUp":
            targetIndex = emptyIndex + 4;
            break;

        case "ArrowDown":
            targetIndex = emptyIndex - 4;
            break;

        case "ArrowLeft":
            targetIndex = emptyIndex + 1;

            // Prevent moving across board rows.
            if (Math.floor(targetIndex / 4) !== Math.floor(emptyIndex / 4)) {
                return;
            }

            break;

        case "ArrowRight":
            targetIndex = emptyIndex - 1;

            // Prevent moving across board rows.
            if (Math.floor(targetIndex / 4) !== Math.floor(emptyIndex / 4)) {
                return;
            }

            break;

        default:
            return;

    }

    event.preventDefault();

    moveTile(targetIndex);

});


// BUTTON EVENTS

startButton.addEventListener("click", startGame);

restartButton.addEventListener("click", startGame);


// INITIAL GAME DISPLAY

createPuzzle();

timerDisplay.textContent = "05:00";

scoreDisplay.textContent = "0";

message.textContent = "Press START GAME to begin!";
