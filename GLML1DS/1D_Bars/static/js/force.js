document.addEventListener('DOMContentLoaded', async () => {
    const lineSelectForce = document.getElementById('lineSelectForce');
    const fxInput = document.getElementById('fx');
    const fyInput = document.getElementById('fy');
    const forceXInput = document.getElementById('forceX');
    const forceYInput = document.getElementById('forceY');
    const addForceBtn = document.getElementById('addForce');
    let lines = [];
    const sessionID = getCookie('session_id'); // Retrieve session ID from cookies

    // Function to fetch lines from the backend
    async function fetchLines() {
        try {
            const response = await fetch('/get-lines', { cache: 'no-cache' }); // Disable cache
            const data = await response.json();
            console.log('Fetched lines:', data); // Log fetched data to check contents
            if (Array.isArray(data) && data.length > 0) {
                lines = data;
                updateForceLineSelect();
            } else {
                console.error('No lines fetched or invalid data format:', data);
            }
        } catch (error) {
            console.error('Error fetching lines:', error); // Log any errors during fetching
        }
    }

    // Function to populate the line selection dropdown
    function updateForceLineSelect() {
        lineSelectForce.innerHTML = '<option value="">Select a line</option>';
        lines.forEach((line, index) => {
            const option = document.createElement('option');
            option.value = line.id;  // Set the option value to line.id instead of index
            option.textContent = `Line ${index + 1}`;
            lineSelectForce.appendChild(option);
        });
    }

    // Load initial data and populate dropdown
    await fetchLines();

    // Function to add force to the selected line
    addForceBtn.addEventListener('click', async () => {
        const selectedLineId = lineSelectForce.value; // Get the selected line_id
        console.log('Selected Line ID:', selectedLineId); // Log selected line_id
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

        const selectedLine = lines.find(line => line.id === parseInt(selectedLineId)); // Find the selected line
        console.log('Selected line:', selectedLine); // Log selected line to check validity

        if (!selectedLine) {
            alert("Selected line is not valid.");
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
                console.error('Failed to save force');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });

    // Function to clear storage
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
