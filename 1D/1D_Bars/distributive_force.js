document.addEventListener('DOMContentLoaded', () => {
    const lineSelectDistributive = document.getElementById('lineSelectDistributive');
    const distributiveForceInput = document.getElementById('distributiveForce');
    const x1DistributiveInput = document.getElementById('x1Distributive');
    const y1DistributiveInput = document.getElementById('y1Distributive');
    const x2DistributiveInput = document.getElementById('x2Distributive');
    const y2DistributiveInput = document.getElementById('y2Distributive');
    const addDistributiveForceBtn = document.getElementById('addDistributiveForce');
    let distributiveForces = JSON.parse(localStorage.getItem('distributiveForces')) || [];

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

    updateDistributiveLineSelect();

    addDistributiveForceBtn.addEventListener('click', () => {
        const selectedIndex = lineSelectDistributive.value;
        if (selectedIndex === "") {
            alert("Please select a line.");
            return;
        }

        const forceExpression = distributiveForceInput.value;
        const x1 = parseFloat(x1DistributiveInput.value);
        const y1 = parseFloat(y1DistributiveInput.value);
        const x2 = parseFloat(x2DistributiveInput.value);
        const y2 = parseFloat(y2DistributiveInput.value);

        if (!forceExpression || isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
            alert("Please enter valid force and coordinate values.");
            return;
        }

        const lines = JSON.parse(localStorage.getItem('lines')) || [];
        const selectedLine = lines[selectedIndex];

        if (!isPointOnLine(selectedLine, x1, y1) || !isPointOnLine(selectedLine, x2, y2)) {
            alert("The coordinates are out of the body.");
            return;
        }

        try {
            const compiledExpression = math.compile(forceExpression);

            const newDistributiveForce = { 
                lineIndex: selectedIndex, 
                expression: forceExpression, 
                compiledExpression, 
                x1, 
                y1, 
                x2, 
                y2 
            };
            distributiveForces.push(newDistributiveForce);
            localStorage.setItem('distributiveForces', JSON.stringify(distributiveForces));
            alert("Distributive Force added successfully.");
        } catch (error) {
            alert("Invalid mathematical expression.");
        }
    });

    function isPointOnLine(line, x, y) {
        const x1 = line.x1, y1 = line.y1, x2 = line.x2, y2 = line.y2;
        const distance = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
        const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const pointToStart = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
        const pointToEnd = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2);
        return (distance < 1e-5 && pointToStart <= lineLength && pointToEnd <= lineLength);
    }
});
