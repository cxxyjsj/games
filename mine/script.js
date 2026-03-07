class Minesweeper {
    constructor() {
        this.board = [];
        this.boardSize = { rows: 9, cols: 9 };
        this.mineCount = 10;
        this.flags = [];
        this.revealed = [];
        this.gameOver = false;
        this.gameWon = false;
        this.startTime = null;
        this.timerInterval = null;

        this.initializeElements();
        this.setupEventListeners();
        this.resetGame();
    }

    initializeElements() {
        this.gameBoard = document.getElementById('game-board');
        this.mineCountElement = document.getElementById('mine-count');
        this.timerElement = document.getElementById('timer');
        this.resetButton = document.getElementById('reset-btn');
        this.gameOverElement = document.getElementById('game-over');
        this.resultTextElement = document.getElementById('result-text');
        this.playAgainButton = document.getElementById('play-again-btn');
        this.easyBtn = document.getElementById('easy-btn');
        this.mediumBtn = document.getElementById('medium-btn');
        this.hardBtn = document.getElementById('hard-btn');
    }

    setupEventListeners() {
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.playAgainButton.addEventListener('click', () => {
            this.gameOverElement.classList.add('hidden');
            this.resetGame();
        });

        this.easyBtn.addEventListener('click', () => this.setDifficulty('easy'));
        this.mediumBtn.addEventListener('click', () => this.setDifficulty('medium'));
        this.hardBtn.addEventListener('click', () => this.setDifficulty('hard'));
    }

    setDifficulty(level) {
        // 更新难度按钮状态
        this.easyBtn.classList.remove('active');
        this.mediumBtn.classList.remove('active');
        this.hardBtn.classList.remove('active');

        switch(level) {
            case 'easy':
                this.boardSize = { rows: 9, cols: 9 };
                this.mineCount = 10;
                this.easyBtn.classList.add('active');
                break;
            case 'medium':
                this.boardSize = { rows: 16, cols: 16 };
                this.mineCount = 40;
                this.mediumBtn.classList.add('active');
                break;
            case 'hard':
                this.boardSize = { rows: 16, cols: 30 };
                this.mineCount = 99;
                this.hardBtn.classList.add('active');
                break;
        }

        this.resetGame();
    }

    resetGame() {
        this.board = [];
        this.flags = [];
        this.revealed = [];
        this.gameOver = false;
        this.gameWon = false;
        this.stopTimer();

        // 初始化棋盘
        this.createBoard();

        // 渲染棋盘
        this.renderBoard();

        // 更新地雷计数显示
        this.updateMineCount();

        // 重置计时器
        this.resetTimer();
    }

    createBoard() {
        // 创建空棋盘
        for (let row = 0; row < this.boardSize.rows; row++) {
            this.board[row] = [];
            this.revealed[row] = [];
            this.flags[row] = [];

            for (let col = 0; col < this.boardSize.cols; col++) {
                this.board[row][col] = 0;
                this.revealed[row][col] = false;
                this.flags[row][col] = false;
            }
        }
    }

    placeMines(firstClickRow, firstClickCol) {
        let minesPlaced = 0;

        while (minesPlaced < this.mineCount) {
            const row = Math.floor(Math.random() * this.boardSize.rows);
            const col = Math.floor(Math.random() * this.boardSize.cols);

            // 确保第一次点击的位置不是地雷，并且不重复放置地雷
            if ((row !== firstClickRow || col !== firstClickCol) && this.board[row][col] !== -1) {
                this.board[row][col] = -1; // -1 表示地雷
                minesPlaced++;
            }
        }

        // 计算每个非地雷格子周围的地雷数量
        for (let row = 0; row < this.boardSize.rows; row++) {
            for (let col = 0; col < this.boardSize.cols; col++) {
                if (this.board[row][col] !== -1) {
                    this.board[row][col] = this.countMinesAround(row, col);
                }
            }
        }
    }

    countMinesAround(row, col) {
        let count = 0;

        for (let r = Math.max(0, row - 1); r <= Math.min(this.boardSize.rows - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(this.boardSize.cols - 1, col + 1); c++) {
                if (this.board[r][c] === -1) {
                    count++;
                }
            }
        }

        return count;
    }

    renderBoard() {
        this.gameBoard.innerHTML = '';
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.boardSize.cols}, 1fr)`;

        // 根据网格大小添加相应的CSS类
        if (this.boardSize.cols > 20) {
            this.gameBoard.parentElement.classList.add('large-grid');
        } else {
            this.gameBoard.parentElement.classList.remove('large-grid');
        }

        for (let row = 0; row < this.boardSize.rows; row++) {
            for (let col = 0; col < this.boardSize.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                // 添加左键点击事件（揭示格子）
                cell.addEventListener('click', (e) => {
                    if (!this.gameOver && !this.flags[row][col]) {
                        this.handleCellClick(row, col);
                    }
                });

                // 添加右键点击事件（标记/取消标记旗子）
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault(); // 阻止右键菜单
                    if (!this.gameOver && !this.revealed[row][col]) {
                        this.toggleFlag(row, col);
                    }
                });

                this.gameBoard.appendChild(cell);
            }
        }
    }

    handleCellClick(row, col) {
        // 如果是第一次点击，放置地雷
        if (this.isFirstClick()) {
            this.placeMines(row, col);
            this.startTimer();
        }

        // 如果点击的是地雷
        if (this.board[row][col] === -1) {
            this.revealMines();
            this.endGame(false);
            return;
        }

        // 揭示当前格子
        this.revealCell(row, col);

        // 检查是否获胜
        if (this.checkWin()) {
            this.endGame(true);
        }
    }

    toggleFlag(row, col) {
        if (this.revealed[row][col]) return; // 已揭示的格子不能标记

        this.flags[row][col] = !this.flags[row][col];
        this.updateCellDisplay(row, col);
        this.updateMineCount();
    }

    revealCell(row, col) {
        // 如果已经揭示或标记了旗子，则返回
        if (this.revealed[row][col] || this.flags[row][col]) {
            return;
        }

        this.revealed[row][col] = true;
        this.updateCellDisplay(row, col);

        // 如果是空白格子（周围没有地雷），自动揭示相邻的格子
        if (this.board[row][col] === 0) {
            for (let r = Math.max(0, row - 1); r <= Math.min(this.boardSize.rows - 1, row + 1); r++) {
                for (let c = Math.max(0, col - 1); c <= Math.min(this.boardSize.cols - 1, col + 1); c++) {
                    if (r !== row || c !== col) {
                        this.revealCell(r, c);
                    }
                }
            }
        }
    }

    updateCellDisplay(row, col) {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

        if (!cell) return;

        cell.classList.remove('revealed', 'flagged', 'mine');

        if (this.revealed[row][col]) {
            cell.classList.add('revealed');

            if (this.board[row][col] === -1) {
                cell.classList.add('mine');
            } else if (this.board[row][col] > 0) {
                cell.textContent = this.board[row][col];
                cell.dataset.value = this.board[row][col];
            }
        } else if (this.flags[row][col]) {
            cell.classList.add('flagged');
        }
    }

    revealMines() {
        for (let row = 0; row < this.boardSize.rows; row++) {
            for (let col = 0; col < this.boardSize.cols; col++) {
                if (this.board[row][col] === -1) {
                    this.revealed[row][col] = true;
                    this.updateCellDisplay(row, col);
                }
            }
        }
    }

    isFirstClick() {
        for (let row = 0; row < this.boardSize.rows; row++) {
            for (let col = 0; col < this.boardSize.cols; col++) {
                if (this.revealed[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }

    checkWin() {
        for (let row = 0; row < this.boardSize.rows; row++) {
            for (let col = 0; col < this.boardSize.cols; col++) {
                // 如果有非地雷格子未被揭示，则游戏未结束
                if (this.board[row][col] !== -1 && !this.revealed[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }

    endGame(isWin) {
        this.gameOver = true;
        this.gameWon = isWin;
        this.stopTimer();

        this.resultTextElement.textContent = isWin ? '恭喜你赢了！' : '游戏结束！';
        this.gameOverElement.classList.remove('hidden');
    }

    updateMineCount() {
        let flagCount = 0;
        for (let row = 0; row < this.boardSize.rows; row++) {
            for (let col = 0; col < this.boardSize.cols; col++) {
                if (this.flags[row][col]) {
                    flagCount++;
                }
            }
        }

        const remainingMines = this.mineCount - flagCount;
        this.mineCountElement.textContent = remainingMines;
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
            this.timerElement.textContent = elapsedSeconds;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    resetTimer() {
        this.timerElement.textContent = '0';
        this.stopTimer();
        this.startTime = null;
    }
}

// 当页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});