'use strict'

var firstClick = false;
var isHint = false;
var gIsSafe = false;
var gHintsCount = 3;
var gSafeClicksCount = 3;
var gLifeCount = 3;
var gIsPlaceMines = false;
var gPlaceMinesCount = 0;

var gLevel = {
	size: 8,
	mines: 12
}

var gGame = {
	isOn: false,
	isWin: false,
	shownCount: 0,
	timePassed: 0,
}

var gBoard;

//******************************************************************************************************************************************* */

function initGame() {
	gGame.isOn = false;
	firstClick = false;
	gGame.isWin = false;
	isHint = false;
	gIsSafe = false;
	gIsPlaceMines = false;
	gHintsCount = 3;
	gLifeCount = 3;
	gSafeClicksCount = 3;
	updateLives();
	gBoard = createBoard(gLevel.size, gLevel.size);
	renderBoard(gBoard);
	resetTimer();
	resetElButtons();
	bestScoreRender();
}

function cellClicked(elCell, i, j) {

	if (gIsPlaceMines) {
		placeMines(elCell, i, j);
		return;
	}

	if (!firstClick) {
		gGame.isOn = true;
		firstClick = true;
		gInervalTimer = setInterval(timeCounter, 10);
		audioClock.play();
		fillBoard(gBoard, gLevel.mines, i, j);
		setMinesNegsCount(gBoard);
		document.querySelector('.place-mines').classList.add('cant-click');
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
		expandShown(pos, gBoard);
	}

	if (gBoard[i][j].isMine) {
		audioExplotion.play();
		gLifeCount--;
		updateLives();
		if (gLifeCount === 0) {
			gameOver();
		}
	}
	winGame()
}

function winGame() {
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[i].length; j++) {
			if (gBoard[i][j].isMine && gBoard[i][j].isMarked || gBoard[i][j].isShown) {
				continue;
			} else return;
		}
	}
	audioWin.play();
	gGame.isOn = false;
	clearInterval(gInervalTimer);
	var elFace = document.querySelector('.face-button');
	elFace.innerText = WIN;
	gGame.isWin = true;
	bestScoreRender();
}

function gameOver() {
	audioLoose.play();
	gGame.isOn = false;
	clearInterval(gInervalTimer);
	revealAllMines()
	var elFace = document.querySelector('.face-button');
	elFace.innerText = DEAD;
}

function getSafeCells() {

	if (!gGame.isOn || isHint || gIsSafe) return;

	if (gHintsCount === 0) return;
	gHintsCount--;
	var elHintBtn = document.querySelector('.hint-button');
	elHintBtn.innerText = 'Get Hint: ' + gHintsCount;
	isHint = true;

	var safeCells = [];

	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[i].length; j++) {
			if (gBoard[i][j].isMine === false &&
				gBoard[i][j].isShown === false &&
				!gBoard[i][j].isMarked) {
				safeCells.push({ i: i, j: j });
			}
		}
	}
	var randomIndex = getRandomIntInclusive(0, safeCells.length - 1);
	var safeCell = safeCells[randomIndex];
	var safeCellClass = `.cell-${safeCell.i}-${safeCell.j}`;
	var elSafeCell = document.querySelector(safeCellClass);
	elSafeCell.classList.add('safe');
}

function revealSafe(elMainSafeCell, board, pos) {

	var revealedSafeCells = [];

	for (var i = pos.i - 1; i <= pos.i + 1; i++) {
		if (i < 0 || i >= board.length) continue;

		for (var j = pos.j - 1; j <= pos.j + 1; j++) {
			if (j < 0 || j >= board[i].length) continue;
			if (gBoard[i][j].isShown || gBoard[i][j].isMarked) continue;

			revealedSafeCells.push({ i: i, j: j });
			var cellClass = `.cell-${i}-${j}`;
			var elCell = document.querySelector(cellClass);
			renderCell(elCell, i, j);
			elMainSafeCell.classList.remove('safe');
		}
	}
	setTimeout(hideSafeCells, 1000, revealedSafeCells);
}

function hideSafeCells(revealedSafeCells) {

	for (var i = 0; i < revealedSafeCells.length; i++) {

		var cell = gBoard[revealedSafeCells[i].i][revealedSafeCells[i].j];
		var cellClass = `.cell-${revealedSafeCells[i].i}-${revealedSafeCells[i].j}`;
		var elCell = document.querySelector(cellClass);

		cell.isShown = false;
		elCell.classList.remove('clicked');
		elCell.innerText = EMPTY;
	}
	isHint = false;
}

function indicateSafeCell() {

	if (!gGame.isOn || gIsSafe || isHint) return;

	gIsSafe = true;

	if (gSafeClicksCount === 0) return;
	gSafeClicksCount--;
	var elSafeCellBtn = document.querySelector('.safe-click-button');
	elSafeCellBtn.innerText = 'Safe Click: ' + gSafeClicksCount;

	var safeCells = [];

	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[i].length; j++) {
			if (gBoard[i][j].isMine === false &&
				gBoard[i][j].isShown === false &&
				!gBoard[i][j].isMarked) {
				safeCells.push({ i: i, j: j });
			}
		}
	}
	var randomIndex = getRandomIntInclusive(0, safeCells.length - 1);
	var safeCell = safeCells[randomIndex];
	var safeCellClass = `.cell-${safeCell.i}-${safeCell.j}`;
	var elSafeCell = document.querySelector(safeCellClass);
	elSafeCell.classList.add('safe');
	setTimeout(hideSafeCellIndication, 2000, elSafeCell);
}

function hideSafeCellIndication(elCell) {
	elCell.classList.remove('safe');
	gIsSafe = false;
}

function revealAllMines() {

	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[i].length; j++) {
			if (gBoard[i][j].isMine) {
				var cellClass = `.cell-${i}-${j}`;
				var elCell = document.querySelector(cellClass)
				elCell.innerText = MINE
				elCell.classList.add('clicked');
			}
		}
	}
}



function placeMinesToggle(elButton) {

	if (gGame.isOn) return;

	if (!gIsPlaceMines) {
		gIsPlaceMines = true;
		elButton.innerText = 'Start'
		for (var i = 0; i < gBoard.length; i++) {
			for (var j = 0; j < gBoard[i].length; j++) {
				var cellClass = (`.cell-${i}-${j}`)
				var elCell = document.querySelector(cellClass);
				elCell.classList.add('clicked');
			}
		}
		return;
	}
	if (gIsPlaceMines) {
		if (gPlaceMinesCount === 0) return;
		renderBoard(gBoard);
		setMinesNegsCount(gBoard);
		firstClick = true;
		gGame.isOn = true;
		gInervalTimer = setInterval(timeCounter, 10);
		audioClock.play();
		gIsPlaceMines = false;
		elButton.innerText = 'Place Mines';
		elButton.classList.add('cant-click');
	}
}

function placeMines(elCell, i, j) {

	gPlaceMinesCount++
	gBoard[i][j].isMine = true;
	elCell.innerText = MINE;

}