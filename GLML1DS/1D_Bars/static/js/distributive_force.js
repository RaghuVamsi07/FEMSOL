document.addEventListener('DOMContentLoaded', () => {
    const lineSelectDistributive = document.getElementById('lineSelectDistributive');
    const startFxInput = document.getElementById('startFx');
    const startFyInput = document.getElementById('startFy');
    const endFxInput = document.getElementById('endFx');
    const endFyInput = document.getElementById('endFy');
    const startXInput = document.getElementById('startX');
    const startYInput = document.getElementById('startY');
    const endXInput = document.getElementById('endX');
    const endYInput = document.getElementById('endY');
    const addDistributiveForceBtn = document.getElementById('addDistributiveForce');
    let distributiveForces = [];

    async function loadDistributiveForces() {
        const response = await fetch('/get-distributive-forces');
        distributiveForces = await response.json();
        updateDistributiveLineSelect();
    }

    function updateDistributiveLineSelect() {
        const lines = JSON.parse(localStorage.getItem('lines')) || [];
        lineSelectDistributive.innerHTML = '<option value="">Select a line</option>';
        lines.forEach((line, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Line ${index + 1}`;
            lineSelectDistributive.appendChild(option);
        });
    }

    async function addDistributiveForce(lineID, startFx, startFy, endFx, endFy, startX, startY, endX, endY) {
        const newDistributiveForce = { line_id: lineID, start_fx: startFx, start_fy: startFy, end_fx: endFx, end_fy: endFy, start_x: startX, start_y: startY, end_x: endX, end_y: endY };
        try {
            const response = await fetch('/add-distributive-force', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDistributiveForce)
            });
            const data = await response.json();
            newDistributiveForce.id = data.id;
            distributiveForces.push(newDistributiveForce);
            alert('Distributive Force added successfully.');
        } catch (error) {
            console.error('Error adding distributive force:', error);
        }
    }

    addDistributiveForceBtn.addEventListener('click', () => {
        const selectedIndex = lineSelectDistributive.value;
        if (selectedIndex === "") {
            alert("Please select a line.");
            return;
        }

        const startFx = parseFloat(startFxInput.value);
        const startFy = parseFloat(startFyInput.value);
        const endFx = parseFloat(endFxInput.value);
        const endFy = parseFloat(endFyInput.value);
        const startX = parseFloat(startXInput.value);
        const startY = parseFloat(startYInput.value);
        const endX = parseFloat(endXInput.value);
        const endY = parseFloat(endYInput.value);

        if (isNaN(startFx) || isNaN(startFy) || isNaN(endFx) || isNaN(endFy) || isNaN(startX) || isNaN(startY) || isNaN(endX) || isNaN(endY)) {
            alert("Please enter valid force and coordinate values.");
            return;
        }

        const lines = JSON.parse(localStorage.getItem('lines')) || [];
        const selectedLine = lines[selectedIndex];

        if (!isPointOnLine(selectedLine, startX, startY) || !isPointOnLine(selectedLine, endX, endY)) {
            alert("The coordinates are out of the body.");
            return;
        }

        addDistributiveForce(selectedIndex, startFx, startFy, endFx, endFy, startX, startY, endX, endY);
    });

    loadDistributiveForces();
});
