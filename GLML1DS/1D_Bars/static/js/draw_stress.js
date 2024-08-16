const stressCanvas = document.getElementById('stressCanvas');
const stressCtx = stressCanvas.getContext('2d');
let translatingStress = false;
let translateStartXStress, translateStartYStress;
let scaleStress = 1;
let originXStress = stressCanvas.width / 2;
let originYStress = stressCanvas.height / 2;

function resizeStressCanvas() {
    stressCanvas.width = stressCanvas.parentElement.clientWidth;
    stressCanvas.height = stressCanvas.parentElement.clientHeight;
    originXStress = stressCanvas.width / 2;
    originYStress = stressCanvas.height / 2;
    drawStress();
}

window.addEventListener('resize', resizeStressCanvas);
resizeStressCanvas();

function drawStressGrid() {
    stressCtx.clearRect(0, 0, stressCanvas.width, stressCanvas.height);
    stressCtx.strokeStyle = '#e0e0e0';
    stressCtx.lineWidth = 1;

    for (let i = -originXStress; i < stressCanvas.width - originXStress; i += 20 * scaleStress) {
        stressCtx.moveTo(originXStress + i, 0);
        stressCtx.lineTo(originXStress + i, stressCanvas.height);
    }

    for (let i = -originYStress; i < stressCanvas.height - originYStress; i += 20 * scaleStress) {
        stressCtx.moveTo(0, originYStress - i);
        stressCtx.lineTo(stressCanvas.width, originYStress - i);
    }

    stressCtx.stroke();

    // Draw origin lines
    stressCtx.strokeStyle = 'blue';
    stressCtx.beginPath();
    stressCtx.moveTo(originXStress, 0);
    stressCtx.lineTo(originXStress, stressCanvas.height);
    stressCtx.moveTo(0, originYStress);
    stressCtx.lineTo(stressCanvas.width, originYStress);
    stressCtx.stroke();
}

function drawStressLines() {
    stressCtx.strokeStyle = 'black';
    stressCtx.lineWidth = 2;

    // Assume `linesStress` is an array of line objects passed from the backend
    linesStress.forEach(line => {
        stressCtx.beginPath();
        stressCtx.moveTo(originXStress + line.x1 * scaleStress, originYStress - line.y1 * scaleStress);
        stressCtx.lineTo(originXStress + line.x2 * scaleStress, originYStress - line.y2 * scaleStress);
        stressCtx.stroke();
    });
}

function drawStress() {
    drawStressGrid();
    drawStressLines();
}

stressCanvas.addEventListener('mousedown', (e) => {
    if (translatingStress && e.button === 0) {
        translateStartXStress = e.offsetX;
        translateStartYStress = e.offsetY;
        stressCanvas.addEventListener('mousemove', translateStressGrid);
    }
});

stressCanvas.addEventListener('mouseup', () => {
    if (translatingStress) {
        stressCanvas.removeEventListener('mousemove', translateStressGrid);
        stressCanvas.style.cursor = 'default';
    }
});

function translateStressGrid(e) {
    const dx = e.offsetX - translateStartXStress;
    const dy = e.offsetY - translateStartYStress;
    originXStress += dx;
    originYStress += dy;
    translateStartXStress = e.offsetX;
    translateStartYStress = e.offsetY;
    drawStress();
}

document.getElementById('zoomInStress').addEventListener('click', () => {
    scaleStress *= 1.2;
    drawStress();
});

document.getElementById('zoomOutStress').addEventListener('click', () => {
    scaleStress /= 1.2;
    drawStress();
});

document.getElementById('translateGridStress').addEventListener('click', () => {
    translatingStress = !translatingStress;
    if (translatingStress) {
        stressCanvas.style.cursor = 'move';
    } else {
        stressCanvas.style.cursor = 'default';
    }
});

// Line highlighting logic for stress
const lineSelectStress = document.getElementById('lineSelectStress');
lineSelectStress.addEventListener('change', () => {
    const selectedIndex = lineSelectStress.value;
    if (selectedIndex === "") return;

    const selectedLine = linesStress[selectedIndex];
    highlightStressLine(selectedLine);
});

function highlightStressLine(line) {
    drawStress(); // Redraw the grid and lines first
    stressCtx.strokeStyle = 'red';
    stressCtx.lineWidth = 3;
    stressCtx.beginPath();
    stressCtx.moveTo(originXStress + line.x1 * scaleStress, originYStress - line.y1 * scaleStress);
    stressCtx.lineTo(originXStress + line.x2 * scaleStress, originYStress - line.y2 * scaleStress);
    stressCtx.stroke();
}

drawStress();
