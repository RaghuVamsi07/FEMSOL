document.addEventListener('DOMContentLoaded', () => {
    const lineSelectBody = document.getElementById('lineSelectBody');
    const bodyForceInput = document.getElementById('bodyForce');
    const x1BodyInput = document.getElementById('x1Body');
    const y1BodyInput = document.getElementById('y1Body');
    const x2BodyInput = document.getElementById('x2Body');
    const y2BodyInput = document.getElementById('y2Body');
    const addBodyForceBtn = document.getElementById('addBodyForce');
    let bodyForces = JSON.parse(localStorage.getItem('bodyForces')) || [];

    function updateBodyLineSelect() {
        const lines = JSON.parse(localStorage.getItem('lines')) || [];
        lineSelectBody.innerHTML = '<option value="">Select a line</option>';
        lines.forEach((line, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Line ${index + 1}`;
            lineSelectBody.appendChild(option);
        });
    }

    updateBodyLineSelect();

    addBodyForceBtn.addEventListener('click', () => {
        const selectedIndex = lineSelectBody.value;
        if (selectedIndex === "") {
            alert("Please select a line.");
            return;
        }

        const forceExpression = bodyForceInput.value;
        const x1 = parseFloat(x1BodyInput.value);
        const y1 = parseFloat(y1BodyInput.value);
        const x2 = parseFloat(x2BodyInput.value);
        const y2 = parseFloat(y2BodyInput.value);

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

            const newBodyForce = { 
                lineIndex: selectedIndex, 
                expression: forceExpression, 
                compiledExpression, 
                x1, 
                y1, 
                x2, 
                y2 
            };
            bodyForces.push(newBodyForce);
            localStorage.setItem('bodyForces', JSON.stringify(bodyForces));
            alert("Body Force added successfully.");
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
