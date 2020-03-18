'use strict'

const MINE = '💣';
const EMPTY = '';
const FLAG = '🚩';




document.addEventListener('contextmenu', function (preventContext) {
    preventContext.preventDefault();
});


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
            //******************** */
            var cell = (gBoard[i][j].isMine === true) ? MINE : EMPTY
            
            if (cell === EMPTY && gBoard[i][j].minesAroundCount > 0) cell = gBoard[i][j].minesAroundCount
            strgHTML += `<td class="cell cell-${i}-${j}" 
            onclick="cellClicked(this, ${i}, ${j})" 
            oncontextmenu="cellMarked(this, ${i}, ${j})">${cell}</td>`
            //************************ */
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












function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}