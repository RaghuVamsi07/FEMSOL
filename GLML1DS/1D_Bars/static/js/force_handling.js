document.addEventListener('DOMContentLoaded', () => {
    const lineNumInput = document.getElementById('lineNum');
    const forceNumInput = document.getElementById('forceNum');
    const fxInput = document.getElementById('fx');
    const fyInput = document.getElementById('fy');
    const forceXInput = document.getElementById('forceX');
    const forceYInput = document.getElementById('forceY');
    const addForceBtn = document.getElementById('addForce');
    const updateForceBtn = document.getElementById('updateForce');
    const deleteForceBtn = document.getElementById('deleteForce');
    const forceSelect = document.getElementById('forceSelect');
    const clearStorageBtn = document.getElementById('clearStorage');

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

    // Adding a force
    addForceBtn.addEventListener('click', async () => {
        const lineNum = parseInt(lineNumInput.value);
        const forceNum = parseInt(forceNumInput.value);
        const fx = parseFloat(fxInput.value);
        const fy = parseFloat(fyInput.value);
        const x = parseFloat(forceXInput.value);
        const y = parseFloat(forceYInput.value);

        if (isNaN(lineNum) || isNaN(forceNum) || isNaN(fx) || isNaN(fy) || isNaN(x) || isNaN(y)) {
            alert("Please enter valid values for all fields.");
            return;
        }

        const lineData = await fetchLineData(lineNum);
        if (lineData) {
            const { x1, y1, x2, y2 } = lineData;

            if (!isPointOnLine(x1, y1, x2, y2, x, y)) {
                alert("The point is outside the line.");
                return;
            }

            const forceData = {
                line_num: lineNum,
                force_num: forceNum,
                fx: fx,
                fy: fy,
                x: x,
                y: y
            };

            try {
                const response = await fetch('/save-force', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(forceData)
                });
                const result = await response.json();

                if (result.status === 'success') {
                    alert("Force data saved successfully.");
                    loadForces(); // Reload forces to update the dropdown
                } else {
                    alert(result.message || 'Failed to save force data.');
                }
            } catch (error) {
                console.error('Error saving force data:', error);
                alert('An error occurred while saving force data.');
            }
        }
    });

    // Updating a force
    updateForceBtn.addEventListener('click', async () => {
        const forceId = forceSelect.value;

        if (!forceId) {
            alert('Please select a force to update.');
            return;
        }

        const lineNum = parseInt(lineNumInput.value);
        const fx = parseFloat(fxInput.value);
        const fy = parseFloat(fyInput.value);
        const x = parseFloat(forceXInput.value);
        const y = parseFloat(forceYInput.value);

        const lineData = await fetchLineData(lineNum);
        if (lineData) {
            const { x1, y1, x2, y2 } = lineData;

            if (!isPointOnLine(x1, y1, x2, y2, x, y)) {
                alert("The point is outside the line.");
                return;
            }

            const updatedForceData = {
                line_num: lineNum,
                force_num: parseInt(forceNumInput.value),
                fx: fx,
                fy: fy,
                x: x,
                y: y
            };

            try {
                const response = await fetch(`/update-force/${forceId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedForceData)
                });
                const result = await response.json();

                if (result.status === 'success') {
                    alert('Force updated successfully.');
                    loadForces(); // Reload forces to update the dropdown
                } else {
                    alert('Failed to update force.');
                }
            } catch (error) {
                console.error('Error updating force:', error);
                alert('An error occurred while updating force.');
            }
        }
    });

    // Deleting a force
    deleteForceBtn.addEventListener('click', async () => {
        const forceId = forceSelect.value;

        if (!forceId) {
            alert('Please select a force to delete.');
            return;
        }

        try {
            const response = await fetch(`/delete-force/${forceId}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.status === 'success') {
                alert('Force deleted successfully.');
                loadForces(); // Reload forces to update the dropdown
                forceSelect.value = '';
                lineNumInput.value = '';
                forceNumInput.value = '';
                fxInput.value = '';
                fyInput.value = '';
                forceXInput.value = '';
                forceYInput.value = '';
            } else {
                alert('Failed to delete force.');
            }
        } catch (error) {
            console.error('Error deleting force:', error);
            alert('An error occurred while deleting force.');
        }
    });

    clearStorageBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/clear-storage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();

            if (result.status === 'success') {
                alert('Storage cleared successfully.');
                loadForces(); // Reload forces to update the dropdown
                lineNumInput.value = '';
                forceNumInput.value = '';
                fxInput.value = '';
                fyInput.value = '';
                forceXInput.value = '';
                forceYInput.value = '';
                forceSelect.innerHTML = '<option value="">Select a Force</option>';
            } else {
                alert(result.message || 'Failed to clear storage.');
            }
        } catch (error) {
            console.error('Error clearing storage:', error);
            alert('An error occurred while clearing storage.');
        }
    });



    
    // Fetch and populate the dropdown with forces
    async function loadForces() {
        try {
            const response = await fetch('/get-forces');
            const data = await response.json();

            if (data.status === 'success') {
                forceSelect.innerHTML = '<option value="">Select a Force</option>';
                data.forces.forEach(force => {
                    const option = document.createElement('option');
                    option.value = force.force_id;
                    option.textContent = `Force ${force.force_num} on Line ${force.line_num}`;
                    forceSelect.appendChild(option);
                });
            } else {
                alert('Failed to load forces.');
            }
        } catch (error) {
            console.error('Error loading forces:', error);
            alert('An error occurred while loading forces.');
        }
    }

    // When a force is selected, load its data into the inputs
    forceSelect.addEventListener('change', async () => {
        const forceId = forceSelect.value;

        if (forceId) {
            try {
                const response = await fetch(`/get-force/${forceId}`);
                const data = await response.json();

                if (data.status === 'success') {
                    lineNumInput.value = data.force_data.line_num;
                    forceNumInput.value = data.force_data.force_num;
                    fxInput.value = data.force_data.fx;
                    fyInput.value = data.force_data.fy;
                    forceXInput.value = data.force_data.x;
                    forceYInput.value = data.force_data.y;
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
    loadForces();
});
