if (typeof sessionID === 'undefined') {
    var sessionID = 'default_session'; // Ensure sessionID is defined once
}

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

    const selectedLine = lines[sessionID][selectedIndex];
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
            ...lines[sessionID][selectedIndex],
            x1: parseInt(x1Input.value),
            y1: parseInt(y1Input.value),
            x2: parseInt(x2Input.value),
            y2: parseInt(y2Input.value)
        };

        try {
            const response = await fetch(`/update-line/${lines[sessionID][selectedIndex].id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedLine)
            });
            const result = await response.json();
            if (result.status === 'success') {
                lines[sessionID][selectedIndex] = updatedLine;
                draw();
                highlightLine(lines[sessionID][selectedIndex]);
            } else {
                console.error('Failed to update line');
            }
        } catch (error) {
            console.error('Error updating line:', error);
        }
    });
});

const lineSelects = [lineSelectForce, lineSelectDistributive, lineSelectBody, lineSelectThermal, lineSelectMaterial];
lineSelects.forEach(select => {
    select.addEventListener('change', (e) => {
        const selectedIndex = e.target.value;
        if (selectedIndex === "") return;

        const selectedLine = lines[sessionID][selectedIndex];
        highlightLine(selectedLine);
    });
});

removeLineBtn.addEventListener('click', async () => {
    const selectedIndex = lineSelect.value;
    if (selectedIndex === "") return;

    try {
        const response = await fetch(`/delete-line/${lines[sessionID][selectedIndex].id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.status === 'success') {
            lines[sessionID].splice(selectedIndex, 1);
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

document.getElementById('lineSelect').addEventListener('change', async () => {
    const selectedLine = document.getElementById('lineSelect').value;

    if (!selectedLine) {
        alert('Please select a line first.');
        return;
    }

    // Extract line number from the selected option
    const lineNum = parseInt(selectedLine.replace('line ', ''));
    if (isNaN(lineNum)) {
        alert('Invalid line number.');
        return;
    }

    const selectedLineIndex = selectedLine - 1; // Assuming the select value is 1-indexed
    const lineData = lines[selectedLineIndex];  // Assuming `lines` is an array with line data

    if (!lineData) {
        alert('Selected line not found.');
        return;
    }

    lineData.line_num = lineNum;

    try {
        const response = await fetch('/add-line-with-number', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                x1: lineData.x1,
                y1: lineData.y1,
                x2: lineData.x2,
                y2: lineData.y2,
                session_id: lineData.session_id,
                line_num: lineNum
            })
        });

        const result = await response.json();
        if (result.id) {
            alert('Line number saved successfully');
        } else {
            alert('Failed to save line number');
        }
    } catch (error) {
        console.error('Error saving line number:', error);
    }
});



document.addEventListener('DOMContentLoaded', async () => {
    await loadLines();
    updateLineSelect();
    updateForceLineSelect();
    updateDistributiveLineSelect();
    updateBodyLineSelect();
    updateThermalLineSelect();
    updateMaterialLineSelect();
});
