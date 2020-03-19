'use strict'

document.addEventListener('contextmenu', function (preventContext) {
    preventContext.preventDefault();
});

var audioWin = new Audio('sound/win.mp3');
var audioLoose = new Audio('sound/loose.mp3');
var audioExplotion = new Audio('sound/explosion.mp3');
var audioClock = new Audio('sound/clock.mp3');

const MINE = '💣';
const EMPTY = '';
const FLAG = '🚩';
const PLAYER = '🤨'
const DEAD = '😵'
const WIN = '😎'

var gInervalTimer;
var gTimeDisplay;
var gCounterMiliSec = 0;
var gCounterSec = 0;
var gCounterMin = 0;
var gMiliSec = 0;
var gSec = 0;
var gMin = 0;

//************************************************************************************************************************ */


function createBoard(rows, cols, minesQuantity) {

    var board = []

    for (var i = 0; i < rows; i++) {
        board[i] = []
        for (var j = 0; j < cols; j++) {
            board[i].push({
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            });
        }
    }
    return board;
}

function fillBoard(board, minesQuantity, iFirstCell, jFirstCell) {

    while (minesQuantity > 0) {
        var iPos = getRandomIntInclusive(0, board.length - 1);
        var jPos = getRandomIntInclusive(0, board.length - 1);

        if (iPos === iFirstCell && jPos === jFirstCell) continue;

        if (board[iPos][jPos].isMine === false) {
            board[iPos][jPos].isMine = true
            minesQuantity--

        } else continue;
    }
}

function renderBoard(board) {

    var strgHTML = ''

    for (var i = 0; i < board.length; i++) {
        strgHTML += `<tr>`

        for (var j = 0; j < board[i].length; j++) {
            strgHTML += `<td class="cell cell-${i}-${j}" 
            onclick="cellClicked(this, ${i}, ${j})" 
            oncontextmenu="cellMarked(this, ${i}, ${j})"></td>`
        }
        strgHTML += `</tr>`
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strgHTML
}

function renderCell(elCell, i, j) {

    var cellValue;

    if (gBoard[i][j].isMine === true) cellValue = MINE;
    else if (gBoard[i][j].minesAroundCount > 0) cellValue = gBoard[i][j].minesAroundCount;
    else cellValue = EMPTY;

    elCell.innerText = cellValue
    elCell.classList.add('clicked');
    gBoard[i][j].isShown = true;
}

function cellMarked(elCell, i, j) {

    if (isHint) return;
    if (!gGame.isOn) return;
    if (gBoard[i][j].isShown) return;
    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true;
        elCell.innerText = FLAG;
        winGame()
        return;
    }

    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false;
        elCell.innerText = ""
    }
}

function setMinesNegsCount(board) {

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (gBoard[i][j].isMine === true) continue;
            var cell = { i: i, j: j }
            var minesAroundCell = negsLoopForMinesCount(cell, board);
            gBoard[i][j].minesAroundCount = minesAroundCell
        }
    }
}

function negsLoopForMinesCount(pos, board) {

    var lifeCounter = 0;

    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === pos.i && j === pos.j) continue;
            if (board[i][j].isMine === true) lifeCounter++
        }
    }
    return lifeCounter;
}

function expandShown(pos, board) {

    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;

        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === pos.i && j === pos.j) continue;

            var cellClass = `.cell-${i}-${j}`
            var elCell = document.querySelector(cellClass);
            cellClicked(elCell, i, j)
        }
    }
}

function toggleDifficulty(elButton) {

    gGame.isWin = false;

    if (gLevel.size === 4) {
        gLevel.size = 8;
        gLevel.mines = 12;
        elButton.innerText = 'Medium';
        bestScoreRender();
        initGame();
        return;
    }
    if (gLevel.size === 8) {
        gLevel.size = 12;
        gLevel.mines = 25;
        elButton.innerText = 'Hard';
        bestScoreRender();
        initGame();
        return;
    }
    if (gLevel.size === 12) {
        gLevel.size = 4;
        gLevel.mines = 3;
        elButton.innerText = 'Easy';
        bestScoreRender();
        initGame();
        return;
    }
}

function updateLives() {
    var elLives = document.querySelector('.lives-display')
    elLives.innerHTML = gLifeCount + ' Lives Left'
}

function timeCounter() {

    var elTimer = document.querySelector('.timer');
    gGame.timePassed++;
    gCounterMiliSec++;

    if (gCounterMiliSec === 0) gMiliSec = '00'
    if (gCounterMiliSec > 0 && gCounterMiliSec < 10) gMiliSec = '0' + gCounterMiliSec;
    if (gCounterMiliSec >= 10) gMiliSec = gCounterMiliSec;
    if (gCounterMiliSec === 100) {
        gCounterSec++;
        gMiliSec = '00';
        gCounterMiliSec = 0;
    }
    if (gCounterSec === 0) gSec = '00';
    if (gCounterSec > 0 && gCounterSec < 10) gSec = '0' + gCounterSec;
    if (gCounterSec >= 10) gSec = gCounterSec;
    if (gCounterSec === 60) {
        gCounterMin++;
        gSec = '00';
        gCounterSec = 0;
    }
    if (gCounterMin === 0) gMin = '00'
    if (gCounterMin > 0 && gCounterMin < 10) gMin = '0' + gCounterMin;
    if (gCounterMin >= 10) gMin = gCounterMin;

    var timeDisplay = gMin + ':' + gSec + ':' + gMiliSec;
    elTimer.innerText = timeDisplay;
    gTimeDisplay = timeDisplay
}

function resetTimer() {
    clearInterval(gInervalTimer);
    gGame.timePassed = 0;
    gCounterMiliSec = 0;
    gCounterSec = 0;
    gCounterMin = 0;
    gMiliSec = 0;
    gSec = 0;
    gMin = 0;

    var elTimer = document.querySelector('.timer');
    elTimer.innerText = '00:00:00';
}

function resetElButtons() {

    var elSafeCellBtn = document.querySelector('.safe-click-button');
    elSafeCellBtn.innerText = 'Safe Click: ' + safeClicksCount;

    var elHintBtn = document.querySelector('.hint-button');
    elHintBtn.innerText = 'Get Hint: ' + hintsCount;

    var elFace = document.querySelector('.face-button');
    elFace.innerText = PLAYER;
}

function bestScoreRender() {

    var levelMilisecKey;
    var levelScoreDisplayKey;
    var elBestScore = document.querySelector('.best-score');

    if (gLevel.size === 4) levelMilisecKey = 'easy'
    if (gLevel.size === 8) levelMilisecKey = 'Medium'
    if (gLevel.size === 12) levelMilisecKey = 'Hard'

    if (gLevel.size === 4) levelScoreDisplayKey = 'easyDisplay'
    if (gLevel.size === 8) levelScoreDisplayKey = 'MediumDisplay'
    if (gLevel.size === 12) levelScoreDisplayKey = 'HardDisplay'

    var currLevelMilisec = localStorage.getItem(levelMilisecKey);
    var currLevelScore = localStorage.getItem(levelScoreDisplayKey);

    if (currLevelMilisec === null) {
        localStorage.setItem(levelMilisecKey, Infinity)
        elBestScore.innerText = 'Best Score:';
        return;
    }
    if (gGame.isWin) {
        if (gGame.timePassed < currLevelMilisec) {
            localStorage.setItem(levelMilisecKey, gGame.timePassed);
            localStorage.setItem(levelScoreDisplayKey, gTimeDisplay)
            elBestScore.innerText = 'Best Score for :' + levelMilisecKey + ' is: ' + gTimeDisplay;
            return;
        }
    }

    if (currLevelScore === null) {
        elBestScore.innerText = 'Best Score:';
        return;
    }
    if (currLevelScore !== null) elBestScore.innerText = 'Best Score for ' + levelMilisecKey + ' is: ' + currLevelScore;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}