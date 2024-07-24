const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let translating = false;
let translateStartX, translateStartY;
let x1, y1, x2, y2;
let lines = JSON.parse(localStorage.getItem('lines')) || [];
let scale = 1;
let originX = canvas.width / 2;
let originY = canvas.height / 2;

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    originX = canvas.width / 2;
    originY = canvas.height / 2;
    draw();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    for (let i = -originX; i < canvas.width - originX; i += 20 * scale) {
        ctx.moveTo(originX + i, 0);
        ctx.lineTo(originX + i, canvas.height);
    }

    for (let i = -originY; i < canvas.height - originY; i += 20 * scale) {
        ctx.moveTo(0, originY - i);
        ctx.lineTo(canvas.width, originY - i);
    }

    ctx.stroke();

    // Draw origin lines
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, canvas.height);
    ctx.moveTo(0, originY);
    ctx.lineTo(canvas.width, originY);
    ctx.stroke();
}

function drawLines() {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

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

canvas.addEventListener('mousedown', (e) => {
    if (translating && e.button === 0) {
        translateStartX = e.offsetX;
        translateStartY = e.offsetY;
        canvas.addEventListener('mousemove', translateGrid);
    } else if (!translating) {
        drawing = true;
        x1 = (e.offsetX - originX) / scale;
        y1 = (originY - e.offsetY) / scale;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        x2 = (e.offsetX - originX) / scale;
        y2 = (originY - e.offsetY) / scale;
        draw();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(originX + x1 * scale, originY - y1 * scale);
        ctx.lineTo(originX + x2 * scale, originY - y2 * scale);
        ctx.stroke();
    }
});

canvas.addEventListener('mouseup', () => {
    if (drawing) {
        drawing = false;
        lines.push({ x1, y1, x2, y2 });
        localStorage.setItem('lines', JSON.stringify(lines));
        updateLineSelect();
        updateForceLineSelect();
        updateDistributiveLineSelect();
        updateBodyLineSelect();
        updateThermalLineSelect();
        updateMaterialLineSelect();
    }
    if (translating) {
        canvas.removeEventListener('mousemove', translateGrid);
        canvas.style.cursor = 'default';
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

document.getElementById('clearStorage').addEventListener('click', () => {
    localStorage.clear();
    lines = [];
    draw();
    updateLineSelect();
    updateForceLineSelect();
    updateDistributiveLineSelect();
    updateBodyLineSelect();
    updateThermalLineSelect();
    updateMaterialLineSelect();
});

document.getElementById('translateGrid').addEventListener('click', () => {
    translating = !translating;
    if (translating) {
        canvas.style.cursor = 'move';
    } else {
        canvas.style.cursor = 'default';
    }
});

function updateLineSelect() {
    const lineSelect = document.getElementById('lineSelect');
    lineSelect.innerHTML = '<option value="">Select a line to highlight</option>';
    lines.forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelect.appendChild(option);
    });
}

function updateForceLineSelect() {
    const lineSelectForce = document.getElementById('lineSelectForce');
    lineSelectForce.innerHTML = '<option value="">Select a line</option>';
    lines.forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelectForce.appendChild(option);
    });
}

function updateDistributiveLineSelect() {
    const lineSelectDistributive = document.getElementById('lineSelectDistributive');
    lineSelectDistributive.innerHTML = '<option value="">Select a line</option>';
    lines.forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelectDistributive.appendChild(option);
    });
}

function updateBodyLineSelect() {
    const lineSelectBody = document.getElementById('lineSelectBody');
    lineSelectBody.innerHTML = '<option value="">Select a line</option>';
    lines.forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelectBody.appendChild(option);
    });
}

function updateThermalLineSelect() {
    const lineSelectThermal = document.getElementById('lineSelectThermal');
    lineSelectThermal.innerHTML = '<option value="">Select a line</option>';
    lines.forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelectThermal.appendChild(option);
    });
}

function updateMaterialLineSelect() {
    const lineSelectMaterial = document.getElementById('lineSelectMaterial');
    lineSelectMaterial.innerHTML = '<option value="">Select a line</option>';
    lines.forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelectMaterial.appendChild(option);
    });
}

function highlightLine(line) {
    draw();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(originX + line.x1 * scale, originY - line.y1 * scale);
    ctx.lineTo(originX + line.x2 * scale, originY - line.y2 * scale);
    ctx.stroke();
}

function loadLines() {
    lines = JSON.parse(localStorage.getItem('lines')) || [];
}

loadLines();
updateLineSelect();
updateForceLineSelect();
updateDistributiveLineSelect();
updateBodyLineSelect();
updateThermalLineSelect();
updateMaterialLineSelect();
draw();
