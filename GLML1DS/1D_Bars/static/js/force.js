document.addEventListener('DOMContentLoaded', () => {
    const lineSelectForce = document.getElementById('lineSelectForce');
    const fxInput = document.getElementById('fx');
    const fyInput = document.getElementById('fy');
    const forceXInput = document.getElementById('forceX');
    const forceYInput = document.getElementById('forceY');
    const addForceBtn = document.getElementById('addForce');
    let forces = [];

    function getSessionID() {
        return new Promise((resolve) => {
            fetch('/get-session-id')
                .then(response => response.json())
                .then(data => resolve(data.session_id));
        });
    }

    async function loadForces() {
        const sessionID = await getSessionID();
        const response = await fetch('/get-forces');
        forces = await response.json();
        updateForceLineSelect();
    }

    function updateForceLineSelect() {
        const lines = JSON.parse(localStorage.getItem('lines')) || [];
        lineSelectForce.innerHTML = '<option value="">Select a line</option>';
        lines.forEach((line, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Line ${index + 1}`;
            lineSelectForce.appendChild(option);
        });
    }

    async function addForce(lineID, fx, fy, x, y) {
        const newForce = { line_id: lineID, fx, fy, x, y };
        try {
            const response = await fetch('/add-force', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newForce)
            });
            const data = await response.json();
            newForce.id = data.id;
            forces.push(newForce);
            alert('Force added successfully.');
        } catch (error) {
            console.error('Error adding force:', error);
        }
    }

    addForceBtn.addEventListener('click', () => {
        const selectedIndex = lineSelectForce.value;
        if (selectedIndex === "") {
            alert("Please select a line.");
            return;
        }

        const fx = parseFloat(fxInput.value);
        const fy = parseFloat(fyInput.value);
        const x = parseFloat(forceXInput.value);
        const y = parseFloat(forceYInput.value);

        if (isNaN(fx) || isNaN(fy) || isNaN(x) || isNaN(y)) {
            alert("Please enter valid force and coordinate values.");
            return;
        }

        const lines = JSON.parse(localStorage.getItem('lines')) || [];
        const selectedLine = lines[selectedIndex];

        if (!isPointOnLine(selectedLine, x, y)) {
            alert("The forces are out of the body.");
            return;
        }

        addForce(selectedIndex, fx, fy, x, y);
    });

    loadForces();
});
