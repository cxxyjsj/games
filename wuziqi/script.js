class WuziqiGame {
    constructor() {
        this.canvas = document.getElementById('gameBoard');
        this.ctx = this.canvas.getContext('2d');

        // 初始化resize定时器
        this.resizeTimeout = null;

        // 修复高DPI显示问题
        this.setCanvasSize();

        this.boardSize = 15;
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        this.currentPlayer = 1; // 1: 黑子, 2: 白子
        this.gameOver = false;
        this.moveHistory = [];

        this.init();
    }

    setCanvasSize() {
        // 获取显示尺寸
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;

        // 处理高DPI屏幕
        const dpr = window.devicePixelRatio || 1;

        // 设置Canvas的实际尺寸
        this.canvas.width = displayWidth * dpr;
        this.canvas.height = displayHeight * dpr;

        // 缩放上下文以匹配设备像素比
        this.ctx.scale(dpr, dpr);
    }

    init() {
        this.calculateCellSize();
        this.drawBoard();
        this.bindEvents();
        this.updateGameInfo();
    }

    calculateCellSize() {
        // 获取显示尺寸
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;

        // 使用较小的尺寸确保正方形棋盘
        const displaySize = Math.min(displayWidth, displayHeight);

        // 设置合理的内边距，使棋盘不会紧贴边缘
        const totalPadding = Math.min(displaySize * 0.05, 40); // 内边距为棋盘尺寸的5%，但不超过40px
        // 计算每个格子的大小，基于15x15的棋盘
        this.cellSize = (displaySize - totalPadding) / (this.boardSize - 1);

        // 确保格子大小在合理范围内，增加上限以适应大屏幕
        this.cellSize = Math.max(Math.min(this.cellSize, 40), 12); // 限制在12-40像素之间，允许更大尺寸
    }

    drawBoard() {
        // 在绘制之前才更新Canvas尺寸和格子大小，避免在点击过程中重复计算
        this.setCanvasSize();
        this.calculateCellSize();

        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;

        // 使用较小的边长来确保棋盘保持正方形
        const displaySize = Math.min(displayWidth, displayHeight);

        // 使用与calculateCellSize方法一致的padding计算方式
        const totalPadding = Math.min(displaySize * 0.05, 40);
        const padding = totalPadding / 2;

        // 计算棋盘区域的起始位置（居中）
        const boardStartX = (displayWidth - displaySize) / 2;
        const boardStartY = (displayHeight - displaySize) / 2;

        this.ctx.clearRect(0, 0, displayWidth, displayHeight);

        // 绘制棋盘背景（正方形）
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(boardStartX, boardStartY, displaySize, displaySize);

        // 绘制网格线
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        // 垂直线
        for (let i = 0; i < this.boardSize; i++) {
            const x = boardStartX + padding + i * this.cellSize;
            const startY = boardStartY + padding;
            const endY = boardStartY + displaySize - padding;
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
        }

        // 水平线
        for (let i = 0; i < this.boardSize; i++) {
            const y = boardStartY + padding + i * this.cellSize;
            const startX = boardStartX + padding;
            const endX = boardStartX + displaySize - padding;
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
        }

        this.ctx.stroke();

        // 绘制天元和星位
        const starPoints = [
            {row: 3, col: 3}, {row: 3, col: 11},
            {row: 11, col: 3}, {row: 11, col: 11},
            {row: 7, col: 7} // 天元
        ];

        this.ctx.fillStyle = '#8B4513';
        starPoints.forEach(point => {
            const {x, y} = this.getPixelPosition(point.row, point.col);
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
            this.ctx.fill();
        });

        // 绘制棋子
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] !== 0) {
                    this.drawStone(row, col, this.board[row][col]);
                }
            }
        }
    }

    getPixelPosition(row, col) {
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;

        // 使用较小的边长来确保棋盘保持正方形
        const displaySize = Math.min(displayWidth, displayHeight);

        // 使用一致的padding计算
        const totalPadding = Math.min(displaySize * 0.05, 40);
        const padding = totalPadding / 2;

        const boardStartX = (displayWidth - displaySize) / 2;
        const boardStartY = (displayHeight - displaySize) / 2;

        const x = boardStartX + padding + col * this.cellSize;
        const y = boardStartY + padding + row * this.cellSize;
        return {x, y};
    }

    drawStone(row, col, player) {
        const {x, y} = this.getPixelPosition(row, col);

        // 使棋子稍微小于格子大小，留下一些间隙，同时确保在不同屏幕尺寸下都有合适的大小
        const stoneRadius = Math.max(Math.min(this.cellSize / 2 - 3, 18), 6); // 限制在6-18像素之间，允许更大

        this.ctx.beginPath();
        this.ctx.arc(x, y, stoneRadius, 0, 2 * Math.PI);

        if (player === 1) { // 黑子
            const gradient = this.ctx.createRadialGradient(
                x - Math.max(stoneRadius * 0.2, 2),
                y - Math.max(stoneRadius * 0.2, 2),
                Math.max(stoneRadius * 0.1, 1),
                x,
                y,
                stoneRadius
            );
            gradient.addColorStop(0, '#666');
            gradient.addColorStop(1, '#000');
            this.ctx.fillStyle = gradient;
        } else { // 白子
            const gradient = this.ctx.createRadialGradient(
                x - Math.max(stoneRadius * 0.2, 2),
                y - Math.max(stoneRadius * 0.2, 2),
                Math.max(stoneRadius * 0.1, 1),
                x,
                y,
                stoneRadius
            );
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ccc');
            this.ctx.fillStyle = gradient;
            this.ctx.strokeStyle = '#999';
            this.ctx.lineWidth = Math.max(stoneRadius * 0.15, 1);
            this.ctx.stroke();
        }

        this.ctx.fill();
    }

    handleClick(event) {
        if (this.gameOver) return;

        // 获取Canvas相对于视口的位置（使用显示尺寸）
        const rect = this.canvas.getBoundingClientRect();

        // 获取设备像素比来处理高DPI屏幕
        const dpr = window.devicePixelRatio || 1;

        // 根据Canvas元素的显示尺寸与实际尺寸的比例进行调整
        const displayWidth = this.canvas.clientWidth;
        const actualWidth = this.canvas.width / dpr; // 考虑到scale的影响
        const scaleX = actualWidth / displayWidth;

        const displayHeight = this.canvas.clientHeight;
        const actualHeight = this.canvas.height / dpr;
        const scaleY = actualHeight / displayHeight;

        const clientX = (event.clientX - rect.left) * scaleX;
        const clientY = (event.clientY - rect.top) * scaleY;

        // 使用较小的边长来确保棋盘保持正方形
        const displaySize = Math.min(displayWidth, displayHeight);

        // 使用与drawBoard和calculateCellSize一致的padding计算
        const totalPadding = Math.min(displaySize * 0.05, 40);
        const padding = totalPadding / 2;

        // 计算棋盘左上角的偏移量
        const boardStartX = (displayWidth - displaySize) / 2;
        const boardStartY = (displayHeight - displaySize) / 2;

        // 确保点击在棋盘范围内
        if (clientX < boardStartX + padding || clientX > (boardStartX + displaySize - padding) ||
            clientY < boardStartY + padding || clientY > (boardStartY + displaySize - padding)) {
            return;
        }

        // 将实际坐标转换为棋盘坐标（使用实际尺寸和计算出的cellSize）
        const exactCol = (clientX - boardStartX - padding) / this.cellSize;
        const exactRow = (clientY - boardStartY - padding) / this.cellSize;

        // 找到最近的交叉点（四舍五入到最接近的整数）
        const col = Math.round(exactCol);
        const row = Math.round(exactRow);

        // 验证坐标是否在有效范围内
        if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize) {
            // 检查该位置是否为空
            if (this.board[row][col] === 0) {
                this.makeMove(row, col);
            }
        }
    }

    makeMove(row, col) {
        this.board[row][col] = this.currentPlayer;
        this.moveHistory.push({row, col, player: this.currentPlayer});

        if (this.checkWin(row, col)) {
            this.gameOver = true;
            const winner = this.currentPlayer === 1 ? '黑子' : '白子';
            this.showNotification(`${winner} 获胜！`);
            document.getElementById('game-result').textContent = `${winner} 获胜！`;
        } else {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        }

        this.drawBoard();
        this.updateGameInfo();
    }

    checkWin(row, col) {
        const player = this.board[row][col];
        const directions = [
            [0, 1],   // 水平
            [1, 0],   // 垂直
            [1, 1],   // 对角线 \
            [1, -1]   // 对角线 /
        ];

        for (let [dx, dy] of directions) {
            let count = 1;

            // 正向检查
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                if (newRow >= 0 && newRow < this.boardSize &&
                    newCol >= 0 && newCol < this.boardSize &&
                    this.board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }

            // 反向检查
            for (let i = 1; i < 5; i++) {
                const newRow = row - dx * i;
                const newCol = col - dy * i;
                if (newRow >= 0 && newRow < this.boardSize &&
                    newCol >= 0 && newCol < this.boardSize &&
                    this.board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }

            if (count >= 5) {
                return true;
            }
        }

        return false;
    }

    undoMove() {
        if (this.moveHistory.length === 0 || this.gameOver) return;

        const lastMove = this.moveHistory.pop();
        this.board[lastMove.row][lastMove.col] = 0;

        this.currentPlayer = lastMove.player;
        this.gameOver = false;
        document.getElementById('game-result').textContent = '';

        this.drawBoard();
        this.updateGameInfo();
    }

    restartGame() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        this.currentPlayer = 1;
        this.gameOver = false;
        this.moveHistory = [];

        this.drawBoard();
        this.updateGameInfo();
        document.getElementById('game-result').textContent = '';
    }

    updateGameInfo() {
        const currentPlayerElement = document.getElementById('current-player');
        const blackSpan = currentPlayerElement.querySelector('.black');
        const whiteSpan = currentPlayerElement.querySelector('.white');

        if (this.gameOver) {
            blackSpan.style.display = 'none';
            whiteSpan.style.display = 'none';
        } else {
            if (this.currentPlayer === 1) { // 黑子回合
                blackSpan.style.display = 'inline';
                whiteSpan.style.display = 'none';
            } else { // 白子回合 (this.currentPlayer === 2)
                blackSpan.style.display = 'none';
                whiteSpan.style.display = 'inline';
            }
        }
    }

    showNotification(message) {
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    bindEvents() {
        this.canvas.addEventListener('click', (event) => {
            this.handleClick(event);
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undoMove();
        });

        // 添加窗口大小改变事件监听器
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleResize() {
        // 延迟执行，防止频繁重绘
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }

        this.resizeTimeout = setTimeout(() => {
            this.drawBoard();
        }, 100);
    }
}

// 游戏初始化
document.addEventListener('DOMContentLoaded', () => {
    new WuziqiGame();
});