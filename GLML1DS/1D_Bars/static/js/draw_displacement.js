const displacementCanvas = document.getElementById('displacementCanvas');
const ctx = displacementCanvas.getContext('2d');
let translating = false;
let translateStartX, translateStartY;
let scale = 1;
let originX = displacementCanvas.width / 2;
let originY = displacementCanvas.height / 2;

function resizeCanvas() {
    displacementCanvas.width = displacementCanvas.parentElement.clientWidth;
    displacementCanvas.height = displacementCanvas.parentElement.clientHeight;
    originX = displacementCanvas.width / 2;
    originY = displacementCanvas.height / 2;
    draw();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawGrid() {
    ctx.clearRect(0, 0, displacementCanvas.width, displacementCanvas.height);
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    for (let i = -originX; i < displacementCanvas.width - originX; i += 20 * scale) {
        ctx.moveTo(originX + i, 0);
        ctx.lineTo(originX + i, displacementCanvas.height);
    }

    for (let i = -originY; i < displacementCanvas.height - originY; i += 20 * scale) {
        ctx.moveTo(0, originY - i);
        ctx.lineTo(displacementCanvas.width, originY - i);
    }

    ctx.stroke();

    // Draw origin lines
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, displacementCanvas.height);
    ctx.moveTo(0, originY);
    ctx.lineTo(displacementCanvas.width, originY);
    ctx.stroke();
}

function drawLines() {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    // Assume `lines` is an array of line objects passed from the backend
    lines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(originX + line.x1 * scale, originY - line.y1 * scale);
        ctx.lineTo(originX + line.x2 * scale, originY - line.y2 * scale);
        ctx.stroke();
    });
}

function draw() {
    drawGrid();
    drawLines();
}

displacementCanvas.addEventListener('mousedown', (e) => {
    if (translating && e.button === 0) {
        translateStartX = e.offsetX;
        translateStartY = e.offsetY;
        displacementCanvas.addEventListener('mousemove', translateGrid);
    }
});

displacementCanvas.addEventListener('mouseup', () => {
    if (translating) {
        displacementCanvas.removeEventListener('mousemove', translateGrid);
        displacementCanvas.style.cursor = 'default';
    }
});

function translateGrid(e) {
    const dx = e.offsetX - translateStartX;
    const dy = e.offsetY - translateStartY;
    originX += dx;
    originY += dy;
    translateStartX = e.offsetX;
    translateStartY = e.offsetY;
    draw();
}

document.getElementById('zoomIn').addEventListener('click', () => {
    scale *= 1.2;
    draw();
});

document.getElementById('zoomOut').addEventListener('click', () => {
    scale /= 1.2;
    draw();
});

document.getElementById('translateGrid').addEventListener('click', () => {
    translating = !translating;
    if (translating) {
        displacementCanvas.style.cursor = 'move';
    } else {
        displacementCanvas.style.cursor = 'default';
    }
});

// Line highlighting logic
const lineSelect = document.getElementById('lineSelect');
lineSelect.addEventListener('change', () => {
    const selectedIndex = lineSelect.value;
    if (selectedIndex === "") return;

    const selectedLine = lines[selectedIndex];
    highlightLine(selectedLine);
});

function highlightLine(line) {
    draw(); // Redraw the grid and lines first
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(originX + line.x1 * scale, originY - line.y1 * scale);
    ctx.lineTo(originX + line.x2 * scale, originY - line.y2 * scale);
    ctx.stroke();
}

draw();
