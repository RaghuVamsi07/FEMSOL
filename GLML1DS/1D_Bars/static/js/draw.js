const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let translating = false;
let translateStartX, translateStartY;
let x1, y1, x2, y2;
let lines = {};
let scale = 1;
let originX = canvas.width / 2;
let originY = canvas.height / 2;
if (typeof sessionID === 'undefined') {
    var sessionID = 'default_session'; // Ensure sessionID is defined once
}

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

    (lines[sessionID] || []).forEach(line => {
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

canvas.addEventListener('mouseup', async () => {
    if (drawing) {
        drawing = false;
        const lineCount = lines[sessionID] ? lines[sessionID].length : 0;
        const newLine = { 
            x1, y1, x2, y2, 
            session_id: sessionID, 
            line_num: lineCount + 1 // Dynamically assign line number
        };

        if (!lines[sessionID]) {
            lines[sessionID] = [];
        }
        lines[sessionID].push(newLine);

        // Send line data to the server
        try {
            const response = await fetch('/add-line-with-number', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLine)
            });
            const data = await response.json();
            newLine.id = data.id;
            updateLineSelect();
            updateForceLineSelect();
            updateDistributiveLineSelect();
            updateBodyLineSelect();
            updateThermalLineSelect();
            updateMaterialLineSelect();
        } catch (error) {
            console.error('Error adding line:', error);
        }
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
document.getElementById('clearStorage').addEventListener('click', async () => {
    try {
        await fetch('/clear-lines', { method: 'POST' });
        lines[sessionID] = [];
        draw();
        updateLineSelect();
        updateForceLineSelect();
        updateDistributiveLineSelect();
        updateBodyLineSelect();
        updateThermalLineSelect();
        updateMaterialLineSelect();
    } catch (error) {
        console.error('Error clearing lines:', error);
    }
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
    (lines[sessionID] || []).forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelect.appendChild(option);
    });
}

function updateForceLineSelect() {
    const lineSelectForce = document.getElementById('lineSelectForce');
    lineSelectForce.innerHTML = '<option value="">Select a line</option>';
    (lines[sessionID] || []).forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelectForce.appendChild(option);
    });
}

function updateDistributiveLineSelect() {
    const lineSelectDistributive = document.getElementById('lineSelectDistributive');
    lineSelectDistributive.innerHTML = '<option value="">Select a line</option>';
    (lines[sessionID] || []).forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelectDistributive.appendChild(option);
    });
}

function updateBodyLineSelect() {
    const lineSelectBody = document.getElementById('lineSelectBody');
    lineSelectBody.innerHTML = '<option value="">Select a line</option>';
    (lines[sessionID] || []).forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelectBody.appendChild(option);
    });
}

function updateThermalLineSelect() {
    const lineSelectThermal = document.getElementById('lineSelectThermal');
    lineSelectThermal.innerHTML = '<option value="">Select a line</option>';
    (lines[sessionID] || []).forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelectThermal.appendChild(option);
    });
}

function updateMaterialLineSelect() {
    const lineSelectMaterial = document.getElementById('lineSelectMaterial');
    lineSelectMaterial.innerHTML = '<option value="">Select a line</option>';
    (lines[sessionID] || []).forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelectMaterial.appendChild(option);
    });
}

async function loadLines() {
    try {
        const response = await fetch('/get-lines');
        const data = await response.json();
        lines = data.reduce((acc, line) => {
            const { session_id } = line;
            if (!acc[session_id]) {
                acc[session_id] = [];
            }
            acc[session_id].push(line);
            return acc;
        }, {});
        draw();
        updateLineSelect();
        updateForceLineSelect();
        updateDistributiveLineSelect();
        updateBodyLineSelect();
        updateThermalLineSelect();
        updateMaterialLineSelect();
    } catch (error) {
        console.error('Error loading lines:', error);
    }
}

loadLines();
