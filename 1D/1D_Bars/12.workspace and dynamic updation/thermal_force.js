document.addEventListener('DOMContentLoaded', () => {
    const lineSelectThermal = document.getElementById('lineSelectThermal');
    const alphaInput = document.getElementById('alpha');
    const deltaTInput = document.getElementById('deltaT');
    const x1ThermalInput = document.getElementById('x1Thermal');
    const y1ThermalInput = document.getElementById('y1Thermal');
    const x2ThermalInput = document.getElementById('x2Thermal');
    const y2ThermalInput = document.getElementById('y2Thermal');
    const addThermalForceBtn = document.getElementById('addThermalForce');
    let thermalForces = JSON.parse(localStorage.getItem('thermalForces')) || [];

    function updateThermalLineSelect() {
        const lines = JSON.parse(localStorage.getItem('lines')) || [];
        lineSelectThermal.innerHTML = '<option value="">Select a line</option>';
        lines.forEach((line, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Line ${index + 1}`;
            lineSelectThermal.appendChild(option);
        });
    }

    updateThermalLineSelect();

    addThermalForceBtn.addEventListener('click', () => {
        const selectedIndex = lineSelectThermal.value;
        if (selectedIndex === "") {
            alert("Please select a line.");
            return;
        }

        const alphaExpression = alphaInput.value;
        const deltaTExpression = deltaTInput.value;
        const x1 = parseFloat(x1ThermalInput.value);
        const y1 = parseFloat(y1ThermalInput.value);
        const x2 = parseFloat(x2ThermalInput.value);
        const y2 = parseFloat(y2ThermalInput.value);

        if (!alphaExpression || !deltaTExpression || isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
            alert("Please enter valid values.");
            return;
        }

        const lines = JSON.parse(localStorage.getItem('lines')) || [];
        const selectedLine = lines[selectedIndex];

        if (!isPointOnLine(selectedLine, x1, y1) || !isPointOnLine(selectedLine, x2, y2)) {
            alert("The coordinates are out of the body.");
            return;
        }

        try {
            const compiledAlpha = math.compile(alphaExpression);
            const compiledDeltaT = math.compile(deltaTExpression);

            const newThermalForce = {
                lineIndex: selectedIndex,
                alphaExpression,
                deltaTExpression,
                compiledAlpha,
                compiledDeltaT,
                x1,
                y1,
                x2,
                y2
            };
            thermalForces.push(newThermalForce);
            localStorage.setItem('thermalForces', JSON.stringify(thermalForces));
            alert("Thermal Force added successfully.");
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
