'use strict'

var firstClick = false;
var isHint = false;
var hintsCount = 3;

var gLevel = {
	size: 12,
	mines: 20
}

var gGame = {
	isOn: false,
	shownCount: 0,
	markedCound: 0,
	secsPassed: 0,
}

var gLifeCount = 3;
var gBoard;
var gInervalTimer;

//******************************************************************************************************************************************* */

function initGame() {
	gGame.isOn = false;
	firstClick = false;
	isHint = false;
	hintsCount = 3;
	gLifeCount = 3;
	gBoard = createBoard(gLevel.size, gLevel.size);
	renderBoard(gBoard);
}

function cellClicked(elCell, i, j) {
	
	if (!firstClick) {
		gGame.isOn = true;
		firstClick = true;
		fillBoard(gBoard, gLevel.mines, i, j);
		setMinesNegsCount(gBoard)
	}

	if (isHint) {
		if (elCell.classList.contains('safe')) {
			var pos = { i: i, j: j };
			revealSafe(elCell, gBoard, pos);
		}
		return;
	}


	if (!gGame.isOn) return;
	if (gBoard[i][j].isShown) return;
	if (gBoard[i][j].isMarked) return;

	renderCell(elCell, i, j);
	if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isMine) {
		var pos = {
			i: i,
			j: j
		}
		expandShown(pos, gBoard)
	}
	if (gBoard[i][j].isMine) {
		gLifeCount--
		if (gLifeCount === 0) {
			gameOver();
		}
	}
}

function gameOver() {
	console.log('game over')
	gGame.isOn = false;
}

function getSafeCells() {

	if (!gGame.isOn) return;

	if (hintsCount === 0) return;
	hintsCount--
	isHint = true;

	var safeCells = []

	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[i].length; j++) {
			if (gBoard[i][j].isMine === false &&
				gBoard[i][j].isShown === false &&
				!gBoard[i][j].isMarked) {
				safeCells.push({ i: i, j: j });
			}
		}
	}
	var randomIndex = getRandomIntInclusive(0, safeCells.length - 1)
	var safeCell = safeCells[randomIndex];
	var safeCellClass = `.cell-${safeCell.i}-${safeCell.j}`
	var elSafeCell = document.querySelector(safeCellClass)
	elSafeCell.classList.add('safe');
}


function revealSafe(elMainSafeCell, board, pos) {

	var revealedSafeCells = []

	for (var i = pos.i - 1; i <= pos.i + 1; i++) {
		if (i < 0 || i >= board.length) continue;

		for (var j = pos.j - 1; j <= pos.j + 1; j++) {
			if (j < 0 || j >= board[i].length) continue;
			if (gBoard[i][j].isShown || gBoard[i][j].isMarked) continue;

			
			revealedSafeCells.push({ i: i, j: j });
			var cellClass = `.cell-${i}-${j}`
			var elCell = document.querySelector(cellClass);
			renderCell(elCell, i, j);
			elMainSafeCell.classList.remove('safe')
		}
	}
setTimeout(hideSafeCells, 1000, revealedSafeCells);
}

function hideSafeCells(revealedSafeCells) {

	for (var i = 0;i<revealedSafeCells.length;i++) {

		var cell = gBoard[revealedSafeCells[i].i][revealedSafeCells[i].j];
		var cellClass = `.cell-${revealedSafeCells[i].i}-${revealedSafeCells[i].j}`
		var elCell = document.querySelector(cellClass);

		cell.isShown = false;
		elCell.classList.remove('clicked')
		elCell.innerText = EMPTY;
	}
	isHint = false;
}