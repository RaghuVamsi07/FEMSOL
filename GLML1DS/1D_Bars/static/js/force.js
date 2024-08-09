document.addEventListener('DOMContentLoaded', async () => {
    const lineSelectForce = document.getElementById('lineSelectForce');
    const fxInput = document.getElementById('fx');
    const fyInput = document.getElementById('fy');
    const forceXInput = document.getElementById('forceX');
    const forceYInput = document.getElementById('forceY');
    const addForceBtn = document.getElementById('addForce');
    let lines = [];
    const sessionID = getCookie('session_id');

    // Function to fetch lines from the backend
    async function fetchLines() {
        try {
            const response = await fetch('/get-lines', { cache: 'no-cache' });
            const data = await response.json();
            console.log('Fetched data:', data);
            if (Array.isArray(data) && data.length > 0) {
                lines = data;
                updateForceLineSelect();
            } else {
                console.error('No lines fetched or invalid data format:', data);
            }
        } catch (error) {
            console.error('Error fetching lines:', error);
        }
    }

    // Function to populate the line selection dropdown
    function updateForceLineSelect() {
        lineSelectForce.innerHTML = '<option value="">Select a line</option>';
        lines.forEach((line, index) => {
            const option = document.createElement('option');
            option.value = line.id; // Set option value to line_id
            option.textContent = `Line ${index + 1}`;
            lineSelectForce.appendChild(option);
        });
    }

    // Load initial data and populate dropdown
    await fetchLines();

     // Function to check if the point is on the line
    function isPointOnLine(line, x, y) {
        const x1 = line.x1, y1 = line.y1, x2 = line.x2, y2 = line.y2;
        const distance = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
        const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const pointToStart = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
        const pointToEnd = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2);
        return (distance < 1e-5 && pointToStart <= lineLength && pointToEnd <= lineLength);
    }

    // Function to add force to the selected line
    addForceBtn.addEventListener('click', async () => {
        const line_id = lineSelectForce.value;
        console.log('Selected Line ID:', line_id);

        if (!line_id) {
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

        const selectedLine = lines.find(line => line.id === parseInt(line_id));
        console.log('Selected line:', selectedLine);

        if (!selectedLine) {
            alert("Selected line is not valid.");
            return;
        }

        if (!isPointOnLine(selectedLine, x, y)) {
            alert("The forces are out of the body.");
            return;
        }

        const newForce = { session_id: sessionID, line_id: selectedLine.id, fx, fy, x, y };

        fetch('/save_force', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newForce)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert("Force added successfully.");
                fetchLines(); // Fetch lines immediately after adding force
            } else {
                alert(data.message || 'Failed to save force');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
     document.getElementById('clearStorage').addEventListener('click', async () => {
        try {
            const response = await fetch('/clear-storage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            if (result.status === 'success') {
                lines = [];
                updateForceLineSelect();
            } else {
                console.error('Failed to clear storage');
            }
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    });

    // Function to get a cookie by name
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
});
