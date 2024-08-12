document.addEventListener('DOMContentLoaded', () => {
    const lineNumInput = document.getElementById('lineNum');
    const forceNumInput = document.getElementById('forceNum');
    const distributiveForceInput = document.getElementById('distributiveForce');
    const x1Input = document.getElementById('x1Distributive');
    const y1Input = document.getElementById('y1Distributive');
    const x2Input = document.getElementById('x2Distributive');
    const y2Input = document.getElementById('y2Distributive');
    const addDistributiveForceBtn = document.getElementById('addDistributiveForce');
    const updateDistributiveForceBtn = document.getElementById('updateDistributiveForce');
    const deleteDistributiveForceBtn = document.getElementById('deleteDistributiveForce');
    const distributiveForceSelect = document.getElementById('distributiveForceSelect');

    // Function to fetch line data based on line number
    async function fetchLineData(lineNum) {
        try {
            const response = await fetch(`/get-line/${lineNum}`, { method: 'GET' });
            const result = await response.json();
            if (result.status === 'success') {
                return result.line_data; // Returns {x1, y1, x2, y2}
            } else {
                alert('Line not found.');
                return null;
            }
        } catch (error) {
            console.error('Error fetching line data:', error);
            return null;
        }
    }

    // Function to check if the point is on the line
    function isPointOnLine(x1, y1, x2, y2, x, y) {
        const distance = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
        const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const pointToStart = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
        const pointToEnd = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2);
        return distance < 1e-5 && pointToStart <= lineLength && pointToEnd <= lineLength;
    }

    // Adding a distributive force
    addDistributiveForceBtn.addEventListener('click', async () => {
        const lineNum = parseInt(lineNumInput.value);
        const forceNum = parseInt(forceNumInput.value);
        const forceDist = distributiveForceInput.value;
        const x1 = parseFloat(x1Input.value);
        const y1 = parseFloat(y1Input.value);
        const x2 = parseFloat(x2Input.value);
        const y2 = parseFloat(y2Input.value);

        if (isNaN(lineNum) || isNaN(forceNum) || !forceDist || isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
            alert("Please enter valid values for all fields.");
            return;
        }

        const lineData = await fetchLineData(lineNum);
        if (lineData) {
            const { x1: lx1, y1: ly1, x2: lx2, y2: ly2 } = lineData;

            if (!isPointOnLine(lx1, ly1, lx2, ly2, x1, y1) || !isPointOnLine(lx1, ly1, lx2, ly2, x2, y2)) {
                alert("The distributive force points are outside the line.");
                return;
            }

            const distForceData = {
                line_num: lineNum,
                force_num: forceNum,
                force_dist: forceDist,
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2
            };

            try {
                const response = await fetch('/save-distributive-force', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(distForceData)
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

        const lineNum = parseInt(lineNumInput.value);
        const forceDist = distributiveForceInput.value;
        const x1 = parseFloat(x1Input.value);
        const y1 = parseFloat(y1Input.value);
        const x2 = parseFloat(x2Input.value);
        const y2 = parseFloat(y2Input.value);

        const lineData = await fetchLineData(lineNum);
        if (lineData) {
            const { x1: lx1, y1: ly1, x2: lx2, y2: ly2 } = lineData;

            if (!isPointOnLine(lx1, ly1, lx2, ly2, x1, y1) || !isPointOnLine(lx1, ly1, lx2, ly2, x2, y2)) {
                alert("The distributive force points are outside the line.");
                return;
            }

            const updatedDistForceData = {
                line_num: lineNum,
                force_num: parseInt(forceNumInput.value),
                force_dist: forceDist,
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2
            };

            try {
                const response = await fetch(`/update-distributive-force/${forceId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedDistForceData)
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
                lineNumInput.value = '';
                forceNumInput.value = '';
                distributiveForceInput.value = '';
                x1Input.value = '';
                y1Input.value = '';
                x2Input.value = '';
                y2Input.value = '';
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
                    option.textContent = `Force ${force.force_num} on Line ${force.line_num}`;
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
                    lineNumInput.value = data.force_data.line_num;
                    forceNumInput.value = data.force_data.force_num;
                    distributiveForceInput.value = data.force_data.force_dist;
                    x1Input.value = data.force_data.x1;
                    y1Input.value = data.force_data.y1;
                    x2Input.value = data.force_data.x2;
                    y2Input.value = data.force_data.y2;
                } else {
                    alert('Failed to load force data.');
                }
            } catch (error) {
                console.error('Error loading force data:', error);
                alert('An error occurred while loading force data.');
            }
        }
    });

    // Load forces on page load
    loadDistributiveForces();
});
