document.addEventListener('DOMContentLoaded', () => {
    const lineSelectForce = document.getElementById('lineSelectForce');
    const fxInput = document.getElementById('fx');
    const fyInput = document.getElementById('fy');
    const forceXInput = document.getElementById('forceX');
    const forceYInput = document.getElementById('forceY');
    const addForceBtn = document.getElementById('addForce');

    // Function to populate the line selection dropdown with data fetched from the server
    async function updateForceLineSelect() {
        try {
            const response = await fetch('/get-all-lines'); // Fetch all lines from the server
            const lines = await response.json();
            lineSelectForce.innerHTML = '<option value="">Select a line</option>';
            lines.forEach((line, index) => {
                const option = document.createElement('option');
                option.value = line.id; // Use the line's id as the value
                option.textContent = `Line ${index + 1} (ID: ${line.id})`;
                lineSelectForce.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching lines:', error);
        }
    }

    // Load initial data and populate dropdown
    updateForceLineSelect();

    // Function to check if the point is on the line
    function isPointOnLine(line, x, y) {
        const { x1, y1, x2, y2 } = line;
        const distance = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
        const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const pointToStart = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
        const pointToEnd = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2);
        return (distance < 1e-5 && pointToStart <= lineLength && pointToEnd <= lineLength);
    }

    // Function to add force to the selected line
    addForceBtn.addEventListener('click', async () => {
        const selectedLineId = lineSelectForce.value;
        if (selectedLineId === "") {
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

        try {
            // Fetch the selected line's data from the server
            const response = await fetch(`/get-line/${selectedLineId}`);
            const selectedLine = await response.json();

            if (!isPointOnLine(selectedLine, x, y)) {
                alert("The forces are out of the body.");
                return;
            }

            // Insert the data into forces_table
            await fetch(`/add-force`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    line_id: selectedLine.id, // Use line id from selected line
                    x1: selectedLine.x1,
                    y1: selectedLine.y1,
                    x2: selectedLine.x2,
                    y2: selectedLine.y2,
                    fx: fx,
                    fy: fy,
                    x: x,
                    y: y
                })
            });

            alert('Force added successfully.');
        } catch (error) {
            console.error('Error adding force data:', error);
            alert('Failed to add force data to the database.');
        }
    });
});
