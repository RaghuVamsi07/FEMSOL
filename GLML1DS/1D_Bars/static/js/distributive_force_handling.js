document.addEventListener('DOMContentLoaded', () => {
    const lineNumDistInput = document.getElementById('lineNumDist');
    const forceNumDistInput = document.getElementById('forceNumDist');
    const distributiveForceInput = document.getElementById('distributiveForce');
    const x1DistInput = document.getElementById('x1Dist');
    const y1DistInput = document.getElementById('y1Dist');
    const x2DistInput = document.getElementById('x2Dist');
    const y2DistInput = document.getElementById('y2Dist');
    const addDistributiveForceBtn = document.getElementById('addDistributiveForce');
    const updateDistributiveForceBtn = document.getElementById('updateDistributiveForce');
    const deleteDistributiveForceBtn = document.getElementById('deleteDistributiveForce');
    const distributiveForceSelect = document.getElementById('distributiveForceSelect');

    // Function to fetch line data based on line number
    async function fetchLineData(lineNumDist) {
        try {
            const response = await fetch(`/get-line/${lineNumDist}`, { method: 'GET' });
            const result = await response.json();
            if (result.status === 'success') {
                return result.line_data; // Returns {x1, y1, x2, y2} from lines_table
            } else {
                alert('Line not found.');
                return null;
            }
        } catch (error) {
            console.error('Error fetching line data:', error);
            return null;
        }
    }

    // Function to check if the points are on the line
    function isPointOnLine(x1, y1, x2, y2, x, y) {
        const distance = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
        const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const pointToStart = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
        const pointToEnd = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2);
        return distance < 1e-5 && pointToStart <= lineLength && pointToEnd <= lineLength;
    }

    // Adding a distributive force
    addDistributiveForceBtn.addEventListener('click', async () => {
        const lineNumDist = parseInt(lineNumDistInput.value);
        const forceNumDist = parseInt(forceNumDistInput.value);
        const forceDist = distributiveForceInput.value.trim();  // This is a string
        const x1Dist = parseFloat(x1DistInput.value);
        const y1Dist = parseFloat(y1DistInput.value);
        const x2Dist = parseFloat(x2DistInput.value);
        const y2Dist = parseFloat(y2DistInput.value);

        if (isNaN(lineNumDist) || isNaN(forceNumDist) || isNaN(x1Dist) || isNaN(y1Dist) || isNaN(x2Dist) || isNaN(y2Dist) || !forceDist) {
            alert("Please enter valid values for all fields.");
            return;
        }

        const lineData = await fetchLineData(lineNumDist);
        if (lineData) {
            const { x1, y1, x2, y2 } = lineData;

            if (!isPointOnLine(x1, y1, x2, y2, x1Dist, y1Dist) || !isPointOnLine(x1, y1, x2, y2, x2Dist, y2Dist)) {
                alert("One or both points are outside the line.");
                return;
            }

            const forceData = {
                line_num: lineNumDist,
                force_num: forceNumDist,
                force_dist: forceDist,
                x1: x1Dist,
                y1: y1Dist,
                x2: x2Dist,
                y2: y2Dist
            };

            try {
                const response = await fetch('/save-distributive-force', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(forceData)
                });
                const result = await response.json();

                if (result.status === 'success') {
                    alert("Distributive force data saved successfully.");
                    loadDistributiveForces(); // Reload forces to update the dropdown
                } else {
                    alert(result.message || 'Failed to save distributive force data.');
                }
            } catch (error) {
                console.error('Error saving distributive force data:', error);
                alert('An error occurred while saving distributive force data.');
            }
        }
    });

    // Updating a distributive force
    updateDistributiveForceBtn.addEventListener('click', async () => {
        const forceId = distributiveForceSelect.value;

        if (!forceId) {
            alert('Please select a force to update.');
            return;
        }

        const lineNumDist = parseInt(lineNumDistInput.value);
        const forceDist = distributiveForceInput.value.trim();
        const x1Dist = parseFloat(x1DistInput.value);
        const y1Dist = parseFloat(y1DistInput.value);
        const x2Dist = parseFloat(x2DistInput.value);
        const y2Dist = parseFloat(y2DistInput.value);

        const lineData = await fetchLineData(lineNumDist);
        if (lineData) {
            const { x1, y1, x2, y2 } = lineData;

            if (!isPointOnLine(x1, y1, x2, y2, x1Dist, y1Dist) || !isPointOnLine(x1, y1, x2, y2, x2Dist, y2Dist)) {
                alert("One or both points are outside the line.");
                return;
            }

            const updatedForceData = {
                line_num: lineNumDist,
                force_num: parseInt(forceNumDistInput.value),
                force_dist: forceDist,
                x1: x1Dist,
                y1: y1Dist,
                x2: x2Dist,
                y2: y2Dist
            };

            try {
                const response = await fetch(`/update-distributive-force/${forceId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedForceData)
                });
                const result = await response.json();

                if (result.status === 'success') {
                    alert('Distributive force updated successfully.');
                    loadDistributiveForces(); // Reload forces to update the dropdown
                } else {
                    alert('Failed to update distributive force.');
                }
            } catch (error) {
                console.error('Error updating distributive force:', error);
                alert('An error occurred while updating distributive force.');
            }
        }
    });

    // Deleting a distributive force
    deleteDistributiveForceBtn.addEventListener('click', async () => {
        const forceId = distributiveForceSelect.value;

        if (!forceId) {
            alert('Please select a force to delete.');
            return;
        }

        try {
            const response = await fetch(`/delete-distributive-force/${forceId}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.status === 'success') {
                alert('Distributive force deleted successfully.');
                loadDistributiveForces(); // Reload forces to update the dropdown
                distributiveForceSelect.value = '';
                lineNumDistInput.value = '';
                forceNumDistInput.value = '';
                distributiveForceInput.value = '';
                x1DistInput.value = '';
                y1DistInput.value = '';
                x2DistInput.value = '';
                y2DistInput.value = '';
            } else {
                alert('Failed to delete distributive force.');
            }
        } catch (error) {
            console.error('Error deleting distributive force:', error);
            alert('An error occurred while deleting distributive force.');
        }
    });

    // Fetch and populate the dropdown with distributive forces
    async function loadDistributiveForces() {
        try {
            const response = await fetch('/get-distributive-forces');
            const data = await response.json();

            if (data.status === 'success') {
                distributiveForceSelect.innerHTML = '<option value="">Select a Force</option>';
                data.forces.forEach(force => {
                    const option = document.createElement('option');
                    option.value = force.dist_for_id;
                    option.textContent = `Dist Force ${force.force_num} on Line ${force.line_num}`;
                    distributiveForceSelect.appendChild(option);
                });
            } else {
                alert('Failed to load distributive forces.');
            }
        } catch (error) {
            console.error('Error loading distributive forces:', error);
            alert('An error occurred while loading distributive forces.');
        }
    }

    // When a force is selected, load its data into the inputs
    distributiveForceSelect.addEventListener('change', async () => {
        const forceId = distributiveForceSelect.value;

        if (forceId) {
            try {
                const response = await fetch(`/get-distributive-force/${forceId}`);
                const data = await response.json();

                if (data.status === 'success') {
                    lineNumDistInput.value = data.force_data.line_num;
                    forceNumDistInput.value = data.force_data.force_num;
                    distributiveForceInput.value = data.force_data.force_dist;
                    x1DistInput.value = data.force_data.x1;
                    y1DistInput.value = data.force_data.y1;
                    x2DistInput.value = data.force_data.x2;
                    y2DistInput.value = data.force_data.y2;
                } else {
                    alert('Failed to load distributive force data.');
                }
            } catch (error) {
                console.error('Error loading distributive force data:', error);
                alert('An error occurred while loading distributive force data.');
            }
        }
    });

    // Load distributive forces on page load
    loadDistributiveForces();
});
