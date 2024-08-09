document.addEventListener('DOMContentLoaded', () => {
    const lineSelectForce = document.getElementById('lineSelectForce');
    const addForceBtn = document.getElementById('addForce');
    const fxInput = document.getElementById('fx');
    const fyInput = document.getElementById('fy');
    const forceXInput = document.getElementById('forceX');
    const forceYInput = document.getElementById('forceY');

    addForceBtn.addEventListener('click', async () => {
        const selectedLineId = lineSelectForce.value;
        if (selectedLineId === "") {
            alert("Please select a line.");
            return;
        }

        try {
            console.log("Fetching line data for ID:", selectedLineId);
            const response = await fetch(`/get-line/${selectedLineId}`);
            const selectedLine = await response.json();

            if (response.status !== 200 || !selectedLine || !selectedLine.x1 || !selectedLine.y1 || !selectedLine.x2 || !selectedLine.y2) {
                console.error("Line data not found or incomplete:", selectedLine);
                alert("Failed to fetch line data or line data is incomplete.");
                return;
            }

            console.log("Line data received:", selectedLine);

            const fx = parseFloat(fxInput.value);
            const fy = parseFloat(fyInput.value);
            const x = parseFloat(forceXInput.value);
            const y = parseFloat(forceYInput.value);

            if (isNaN(fx) || isNaN(fy) || isNaN(x) || isNaN(y)) {
                alert("Please enter valid force and coordinate values.");
                return;
            }

            // Check if the force is within the body (line)
            const isWithinBody = isPointOnLine(selectedLine, x, y);

            if (!isWithinBody) {
                alert("The force is out of the body.");
                return;
            }

            // Send the force data to the server to store it in forces_table
            const storeResponse = await fetch(`/store-force-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    line_id: selectedLine.id,
                    session_id: selectedLine.session_id,
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

            const result = await storeResponse.json();

            if (result.status === "success") {
                alert('Force data stored successfully.');
            } else {
                alert('Failed to store force data.');
            }
        } catch (error) {
            console.error('Error storing force data:', error);
            alert('Failed to store force data.');
        }
    });

    function isPointOnLine(line, x, y) {
        const { x1, y1, x2, y2 } = line;
        const distance = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
        const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const pointToStart = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
        const pointToEnd = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2);
        return (distance < 1e-5 && pointToStart <= lineLength && pointToEnd <= lineLength);
    }
});
