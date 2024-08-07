const lineSelect = document.getElementById('lineSelect');
const lineSelectForce = document.getElementById('lineSelectForce');
const lineSelectDistributive = document.getElementById('lineSelectDistributive');
const lineSelectBody = document.getElementById('lineSelectBody');
const lineSelectThermal = document.getElementById('lineSelectThermal');
const lineSelectMaterial = document.getElementById('lineSelectMaterial');

const x1Input = document.getElementById('x1');
const y1Input = document.getElementById('y1');
const x2Input = document.getElementById('x2');
const y2Input = document.getElementById('y2');
const removeLineBtn = document.getElementById('removeLine');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');

lineSelect.addEventListener('change', () => {
    const selectedIndex = lineSelect.value;
    if (selectedIndex === "") return;

    const selectedLine = lines[selectedIndex];
    highlightLine(selectedLine);
    x1Input.value = selectedLine.x1;
    y1Input.value = selectedLine.y1;
    x2Input.value = selectedLine.x2;
    y2Input.value = selectedLine.y2;
});

[x1Input, y1Input, x2Input, y2Input].forEach(input => {
    input.addEventListener('input', async () => {
        const selectedIndex = lineSelect.value;
        if (selectedIndex === "") return;

        const updatedLine = {
            ...lines[selectedIndex],
            x1: parseInt(x1Input.value),
            y1: parseInt(y1Input.value),
            x2: parseInt(x2Input.value),
            y2: parseInt(y2Input.value)
        };
        
        try {
            const response = await fetch(`/update-line/${lines[selectedIndex].id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedLine)
            });
            const result = await response.json();
            if (result.status === 'success') {
                lines[selectedIndex] = updatedLine;
                draw();
                highlightLine(lines[selectedIndex]);
            } else {
                console.error('Failed to update line');
            }
        } catch (error) {
            console.error('Error updating line:', error);
        }
    });
});

lineSelectForce.addEventListener('change', (e) => {
    const selectedIndex = e.target.value;
    if (selectedIndex === "") return;

    const selectedLine = lines[selectedIndex];
    highlightLine(selectedLine);
});

lineSelectDistributive.addEventListener('change', (e) => {
    const selectedIndex = e.target.value;
    if (selectedIndex === "") return;

    const selectedLine = lines[selectedIndex];
    highlightLine(selectedLine);
});

lineSelectBody.addEventListener('change', (e) => {
    const selectedIndex = e.target.value;
    if (selectedIndex === "") return;

    const selectedLine = lines[selectedIndex];
    highlightLine(selectedLine);
});

lineSelectThermal.addEventListener('change', (e) => {
    const selectedIndex = e.target.value;
    if (selectedIndex === "") return;

    const selectedLine = lines[selectedIndex];
    highlightLine(selectedLine);
});

lineSelectMaterial.addEventListener('change', (e) => {
    const selectedIndex = e.target.value;
    if (selectedIndex === "") return;

    const selectedLine = lines[selectedIndex];
    highlightLine(selectedLine);
});

removeLineBtn.addEventListener('click', async () => {
    const selectedIndex = lineSelect.value;
    if (selectedIndex === "") return;

    try {
        const response = await fetch(`/delete-line/${lines[selectedIndex].id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.status === 'success') {
            lines.splice(selectedIndex, 1);
            updateLineSelect();
            updateForceLineSelect();
            updateDistributiveLineSelect();
            updateBodyLineSelect();
            updateThermalLineSelect();
            updateMaterialLineSelect();
            draw();
        } else {
            console.error('Failed to delete line');
        }
    } catch (error) {
        console.error('Error deleting line:', error);
    }
});

function highlightLine(line) {
    draw();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(originX + line.x1 * scale, originY - line.y1 * scale);
    ctx.lineTo(originX + line.x2 * scale, originY - line.y2 * scale);
    ctx.stroke();
}

zoomInBtn.addEventListener('click', () => {
    scale *= 1.2;
    draw();
});

zoomOutBtn.addEventListener('click', () => {
    scale /= 1.2;
    draw();
});

function updateLineSelect() {
    lineSelect.innerHTML = "";
    lines.forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelect.appendChild(option);
    });
}

function updateForceLineSelect() {
    lineSelectForce.innerHTML = "";
    lines.forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelectForce.appendChild(option);
    });
}

function updateDistributiveLineSelect() {
    lineSelectDistributive.innerHTML = "";
    lines.forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelectDistributive.appendChild(option);
    });
}

function updateBodyLineSelect() {
    lineSelectBody.innerHTML = "";
    lines.forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelectBody.appendChild(option);
    });
}

function updateThermalLineSelect() {
    lineSelectThermal.innerHTML = "";
    lines.forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelectThermal.appendChild(option);
    });
}

function updateMaterialLineSelect() {
    lineSelectMaterial.innerHTML = "";
    lines.forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelectMaterial.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadLines();
    updateLineSelect();
    updateForceLineSelect();
    updateDistributiveLineSelect();
    updateBodyLineSelect();
    updateThermalLineSelect();
    updateMaterialLineSelect();
});
