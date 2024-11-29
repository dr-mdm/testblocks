const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const BLOCK_SIZE = 30;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const COLORS = ['#00FFFF', '#FF0000', '#00FF00', '#FFFF00', '#0000FF', '#FF00FF', '#FFA500'];
let grid = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(0));

const SHAPES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1, 0], [0, 1, 1]]
];

function drawGrid() {
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (grid[y][x] !== 0) {
                ctx.fillStyle = grid[y][x];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function drawPiece(piece) {
    const shape = piece.shape[piece.rotation];
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                ctx.fillStyle = piece.color;
                ctx.fillRect((piece.x + x) * BLOCK_SIZE, (piece.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function spawnPiece() {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return {
        x: Math.floor(GRID_WIDTH / 2) - Math.floor(shape[0].length / 2),
        y: 0,
        shape,
        rotation: 0,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
}

function rotatePiece(piece) {
    piece.rotation = (piece.rotation + 1) % piece.shape.length;
}

function checkCollision(piece) {
    const shape = piece.shape[piece.rotation];
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const newX = piece.x + x;
                const newY = piece.y + y;
                if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT || grid[newY][newX] !== 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

function placePiece(piece) {
    const shape = piece.shape[piece.rotation];
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                grid[piece.y + y][piece.x + x] = piece.color;
            }
        }
    }
}

function clearRows() {
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
        if (grid[y].every(cell => cell !== 0)) {
            grid.splice(y, 1);
            grid.unshift(Array(GRID_WIDTH).fill(0));
        }
    }
}

let currentPiece = spawnPiece();
let lastDropTime = Date.now();

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    drawPiece(currentPiece);

    if (Date.now() - lastDropTime > 500) {
        currentPiece.y++;
        if (checkCollision(currentPiece)) {
            currentPiece.y--;
            placePiece(currentPiece);
            clearRows();
            currentPiece = spawnPiece();
            if (checkCollision(currentPiece)) {
                alert('Game Over!');
                resetGame();
            }
        }
        lastDropTime = Date.now();
    }

    requestAnimationFrame(gameLoop);
}

function resetGame() {
    grid = Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(0));
    currentPiece = spawnPiece();
}

document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowLeft") {
        currentPiece.x--;
        if (checkCollision(currentPiece)) currentPiece.x++;
    } else if (event.key === "ArrowRight") {
        currentPiece.x++;
        if (checkCollision(currentPiece)) currentPiece.x--;
    } else if (event.key === "ArrowUp") {
        rotatePiece(currentPiece);
        if (checkCollision(currentPiece)) {
            currentPiece.rotation = (currentPiece.rotation - 1 + currentPiece.shape.length) % currentPiece.shape.length;
        }
    }
});

gameLoop();
