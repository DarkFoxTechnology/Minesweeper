const BOARD_SIZE = 10;
const MINES_COUNT = 10;
let mines = [];
let revealed = [];
let flags = [];
let gameOver = false;
let timer = 0;
let timerInterval;
let firstClick = true;

const board = document.getElementById('game-board');
const minesCount = document.getElementById('mines-count');
const timeDisplay = document.getElementById('time');
const statusDisplay = document.getElementById('game-status');
const newGameBtn = document.getElementById('new-game');

// 初始化游戏
function initGame() {
    board.innerHTML = '';
    mines = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(false));
    revealed = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(false));
    flags = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(false));
    gameOver = false;
    firstClick = true;
    timer = 0;
    statusDisplay.textContent = '';
    minesCount.textContent = MINES_COUNT;
    clearInterval(timerInterval);
    
    // 创建棋盘
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = i;
            cell.dataset.y = j;
            board.appendChild(cell);
        }
    }
}

// 生成地雷（确保首次点击安全）
function generateMines(safeX, safeY) {
    let minesPlaced = 0;
    while (minesPlaced < MINES_COUNT) {
        const x = Math.floor(Math.random() * BOARD_SIZE);
        const y = Math.floor(Math.random() * BOARD_SIZE);
        
        if (!mines[x][y] && (x !== safeX || y !== safeY)) {
            mines[x][y] = true;
            minesPlaced++;
        }
    }
}

// 获取周围地雷数量
function getAdjacentMines(x, y) {
    let count = 0;
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
                if (mines[nx][ny]) count++;
            }
        }
    }
    return count;
}

// 展开空白区域
function revealEmpty(x, y) {
    const queue = [[x, y]];
    while (queue.length > 0) {
        const [cx, cy] = queue.pop();
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const nx = cx + dx;
                const ny = cy + dy;
                if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && !revealed[nx][ny]) {
                    revealed[nx][ny] = true;
                    const cell = document.querySelector(`[data-x="${nx}"][data-y="${ny}"]`);
                    cell.classList.add('revealed');
                    const mineCount = getAdjacentMines(nx, ny);
                    if (mineCount === 0) {
                        queue.push([nx, ny]);
                    } else {
                        cell.textContent = mineCount;
                        cell.style.color = ['blue', 'green', 'red', 'darkblue', 'brown', 'cyan', 'black', 'gray'][mineCount - 1];
                    }
                }
            }
        }
    }
}

// 检查胜利条件
function checkWin() {
    let correctFlags = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (mines[i][j] && flags[i][j]) correctFlags++;
            if (!mines[i][j] && !revealed[i][j]) return false;
        }
    }
    return correctFlags === MINES_COUNT;
}

// 处理单元格点击
function handleClick(e) {
    if (gameOver) return;
    
    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    const isRightClick = e.button === 2;

    if (firstClick) {
        generateMines(x, y);
        timerInterval = setInterval(() => {
            timer++;
            timeDisplay.textContent = timer;
        }, 1000);
        firstClick = false;
    }

    if (isRightClick) {
        e.preventDefault();
        if (!revealed[x][y]) {
            flags[x][y] = !flags[x][y];
            e.target.classList.toggle('flagged');
            minesCount.textContent = MINES_COUNT - document.querySelectorAll('.flagged').length;
        }
        return;
    }

    if (flags[x][y] || revealed[x][y]) return;

    if (mines[x][y]) {
        // 踩中地雷
        gameOver = true;
        clearInterval(timerInterval);
        document.querySelectorAll('.cell').forEach(cell => {
            const cx = parseInt(cell.dataset.x);
            const cy = parseInt(cell.dataset.y);
            if (mines[cx][cy]) cell.classList.add('mine');
        });
        statusDisplay.textContent = '游戏失败！';
        statusDisplay.style.color = 'red';
        return;
    }

    revealed[x][y] = true;
    e.target.classList.add('revealed');
    const mineCount = getAdjacentMines(x, y);
    
    if (mineCount === 0) {
        revealEmpty(x, y);
    } else {
        e.target.textContent = mineCount;
        e.target.style.color = ['blue', 'green', 'red', 'darkblue', 'brown', 'cyan', 'black', 'gray'][mineCount - 1];
    }

    if (checkWin()) {
        gameOver = true;
        clearInterval(timerInterval);
        statusDisplay.textContent = '胜利！';
        statusDisplay.style.color = 'green';
        const bestTime = localStorage.getItem('bestTime') || Infinity;
        if (timer < bestTime) {
            localStorage.setItem('bestTime', timer);
        }
    }
}

// 事件监听
board.addEventListener('contextmenu', e => e.preventDefault());
board.addEventListener('mousedown', handleClick);
newGameBtn.addEventListener('click', initGame);

// 开始游戏
initGame();