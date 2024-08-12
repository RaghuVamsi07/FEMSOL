document.addEventListener('DOMContentLoaded', async () => {
    const lineSelectThermal = document.getElementById('lineSelectThermal');
    let lines = [];
    const sessionID = getCookie('session_id');

    // Function to populate the line selection dropdown
    function updateThermalLineSelect() {
        lineSelectThermal.innerHTML = '<option value="">Select a line</option>';
        lines.forEach((line, index) => {
            const option = document.createElement('option');
            option.value = line.id; // Set option value to line_id
            option.textContent = `Line ${index + 1}`;
            lineSelectThermal.appendChild(option);
        });
    }

    // Fetch lines for the dropdown (assuming a similar mechanism as in force.js)
    async function fetchLines() {
        try {
            const response = await fetch(`/get-lines?session_id=${sessionID}`);
            lines = await response.json();
            updateThermalLineSelect();
        } catch (error) {
            console.error('Error fetching lines:', error);
        }
    }

    // Function to highlight a line on the canvas
    function highlightLine(line) {
        // Assuming `ctx`, `originX`, `originY`, and `scale` are defined elsewhere in your code
        draw();  // Redraw the entire canvas first to clear previous highlights
        ctx.strokeStyle = 'blue'; // Use a different color for thermal forces, if desired
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(originX + line.x1 * scale, originY - line.y1 * scale);
        ctx.lineTo(originX + line.x2 * scale, originY - line.y2 * scale);
        ctx.stroke();
    }

    // Highlight the selected line when the dropdown changes
    lineSelectThermal.addEventListener('change', () => {
        const selectedLineID = lineSelectThermal.value;
        const selectedLine = lines.find(line => line.id === parseInt(selectedLineID));
        if (selectedLine) {
            highlightLine(selectedLine);
        }
    });

    // Load lines when the page loads
    await fetchLines();

    // Function to get a cookie by name (used to get session ID)
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
});
