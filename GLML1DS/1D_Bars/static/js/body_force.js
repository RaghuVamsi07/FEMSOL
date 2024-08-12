document.addEventListener('DOMContentLoaded', async () => {
    const lineSelectBody = document.getElementById('lineSelectBody');
    let lines = [];
    const sessionID = getCookie('session_id');

   
    // Function to populate the line selection dropdown
    function updateBodyLineSelect() {
        lineSelectBody.innerHTML = '<option value="">Select a line</option>';
        lines.forEach((line, index) => {
            const option = document.createElement('option');
            option.value = line.id; // Set option value to line_id
            option.textContent = `Line ${index + 1}`;
            lineSelectBody.appendChild(option);
        });
    }

    // Function to highlight a line on the canvas
    function highlightLine(line) {
        // Assuming `ctx`, `originX`, `originY`, and `scale` are defined elsewhere in your code
        draw();  // Redraw the entire canvas first to clear previous highlights
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(originX + line.x1 * scale, originY - line.y1 * scale);
        ctx.lineTo(originX + line.x2 * scale, originY - line.y2 * scale);
        ctx.stroke();
    }



    // Highlight the selected line when a line is chosen from the dropdown
    lineSelectBody.addEventListener('change', () => {
        const selectedLineID = lineSelectBody.value;
        if (selectedLineID) {
            const selectedLine = lines.find(line => line.id === parseInt(selectedLineID));
            if (selectedLine) {
                highlightLine(selectedLine);
            }
        }
    });

    // Function to get a cookie by name
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
});
