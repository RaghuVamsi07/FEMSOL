document.addEventListener('DOMContentLoaded', () => {
    const lineNumInput = document.getElementById('bodyLineNum');
    const densityNumInput = document.getElementById('densityNum');
    const densityValInput = document.getElementById('densityVal');
    const areaInput = document.getElementById('area');
    const youngsModulusInput = document.getElementById('youngsModulus');
    const x1Input = document.getElementById('x_bf1');
    const y1Input = document.getElementById('y_bf1');
    const x2Input = document.getElementById('x_bf2');
    const y2Input = document.getElementById('y_bf2');
    const addBodyForceBtn = document.getElementById('addBodyForce');
    const updateBodyForceBtn = document.getElementById('updateBodyForce');
    const deleteBodyForceBtn = document.getElementById('deleteBodyForce');
    const bodyForceSelect = document.getElementById('bodyForceSelect');

    // Function to fetch line data based on line number
    async function fetchLineData(lineNum) {
        try {
            const response = await fetch(`/get-line/${lineNum}`, { method: 'GET' });
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

    // Adding a body force
    addBodyForceBtn.addEventListener('click', async () => {
        const lineNum = parseInt(lineNumInput.value);
        const densityNum = parseInt(densityNumInput.value);
        const densityVal = parseFloat(densityValInput.value);
        const area = areaInput.value.trim();
        const youngsModulus = parseFloat(youngsModulusInput.value);
        const x1 = parseFloat(x1Input.value);
        const y1 = parseFloat(y1Input.value);
        const x2 = parseFloat(x2Input.value);
        const y2 = parseFloat(y2Input.value);

        if (isNaN(lineNum) || isNaN(densityNum) || isNaN(densityVal) || !area || isNaN(youngsModulus) || isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
            alert("Please enter valid values for all fields.");
            return;
        }

        const lineData = await fetchLineData(lineNum);
        if (lineData) {
            const { x1: lineX1, y1: lineY1, x2: lineX2, y2: lineY2 } = lineData;

            if (!isPointOnLine(lineX1, lineY1, lineX2, lineY2, x1, y1) || !isPointOnLine(lineX1, lineY1, lineX2, lineY2, x2, y2)) {
                alert("One or both points are outside the line.");
                return;
            }

            const bodyForceData = {
                line_num: lineNum,
                dens_num: densityNum,
                dens_val: densityVal,
                area: area,
                E: youngsModulus,
                x_bf1: x1,
                y_bf1: y1,
                x_bf2: x2,
                y_bf2: y2
            };

            try {
                const response = await fetch('/save-body-force', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bodyForceData)
                });
                const result = await response.json();

                if (result.status === 'success') {
                    alert("Body force data saved successfully.");
                    loadBodyForces(); // Reload forces to update the dropdown
                } else {
                    alert(result.message || 'Failed to save body force data.');
                }
            } catch (error) {
                console.error('Error saving body force data:', error);
                alert('An error occurred while saving body force data.');
            }
        }
    });

    // Updating a body force
    updateBodyForceBtn.addEventListener('click', async () => {
        const forceId = bodyForceSelect.value;

        if (!forceId) {
            alert('Please select a force to update.');
            return;
        }

        const lineNum = parseInt(lineNumInput.value);
        const densityNum = parseInt(densityNumInput.value);
        const densityVal = parseFloat(densityValInput.value);
        const area = areaInput.value.trim();
        const youngsModulus = parseFloat(youngsModulusInput.value);
        const x1 = parseFloat(x1Input.value);
        const y1 = parseFloat(y1Input.value);
        const x2 = parseFloat(x2Input.value);
        const y2 = parseFloat(y2Input.value);

        const lineData = await fetchLineData(lineNum);
        if (lineData) {
            const { x1: lineX1, y1: lineY1, x2: lineX2, y2: lineY2 } = lineData;

            if (!isPointOnLine(lineX1, lineY1, lineX2, lineY2, x1, y1) || !isPointOnLine(lineX1, lineY1, lineX2, lineY2, x2, y2)) {
                alert("One or both points are outside the line.");
                return;
            }

            const updatedBodyForceData = {
                line_num: lineNum,
                dens_num: densityNum,
                dens_val: densityVal,
                area: area,
                E: youngsModulus,
                x_bf1: x1,
                y_bf1: y1,
                x_bf2: x2,
                y_bf2: y2
            };

            try {
                const response = await fetch(`/update-body-force/${forceId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedBodyForceData)
                });
                const result = await response.json();

                if (result.status === 'success') {
                    alert('Body force updated successfully.');
                    loadBodyForces(); // Reload forces to update the dropdown
                } else {
                    alert('Failed to update body force.');
                }
            } catch (error) {
                console.error('Error updating body force:', error);
                alert('An error occurred while updating body force.');
            }
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
    const clearStorageBtn = document.getElementById('clearStorage');

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
                // Optional: Add additional logic if needed after clearing storage
            } else {
                alert(result.message || 'Failed to clear storage.');
            }
        } catch (error) {
            console.error('Error clearing storage:', error);
            alert('An error occurred while clearing storage.');
        }
    });
});













    

    // Deleting a body force
    deleteBodyForceBtn.addEventListener('click', async () => {
        const forceId = bodyForceSelect.value;

        if (!forceId) {
            alert('Please select a force to delete.');
            return;
        }

        try {
            const response = await fetch(`/delete-body-force/${forceId}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.status === 'success') {
                alert('Body force deleted successfully.');
                loadBodyForces(); // Reload forces to update the dropdown
                bodyForceSelect.value = '';
                lineNumInput.value = '';
                densityNumInput.value = '';
                densityValInput.value = '';
                areaInput.value = '';
                youngsModulusInput.value = '';
                x1Input.value = '';
                y1Input.value = '';
                x2Input.value = '';
                y2Input.value = '';
            } else {
                alert('Failed to delete body force.');
            }
        } catch (error) {
            console.error('Error deleting body force:', error);
            alert('An error occurred while deleting body force.');
        }
    });

    // Fetch and populate the dropdown with body forces
    async function loadBodyForces() {
        try {
            const response = await fetch('/get-body-forces');
            const data = await response.json();

            if (data.status === 'success') {
                bodyForceSelect.innerHTML = '<option value="">Select a Body Force</option>';
                data.forces.forEach(force => {
                    const option = document.createElement('option');
                    option.value = force.body_for_id;
                    option.textContent = `Body Force ${force.dens_num} on Line ${force.line_num}`;
                    bodyForceSelect.appendChild(option);
                });
            } else {
                alert('Failed to load body forces.');
            }
        } catch (error) {
            console.error('Error loading body forces:', error);
            alert('An error occurred while loading body forces.');
        }
    }

    // When a force is selected, load its data into the inputs
    bodyForceSelect.addEventListener('change', async () => {
        const forceId = bodyForceSelect.value;

        if (forceId) {
            try {
                const response = await fetch(`/get-body-force/${forceId}`);
                const data = await response.json();

                if (data.status === 'success') {
                    lineNumInput.value = data.force_data.line_num;
                    densityNumInput.value = data.force_data.dens_num;
                    densityValInput.value = data.force_data.dens_val;
                    areaInput.value = data.force_data.area;
                    youngsModulusInput.value = data.force_data.E;
                    x1Input.value = data.force_data.x_bf1;
                    y1Input.value = data.force_data.y_bf1;
                    x2Input.value = data.force_data.x_bf2;
                    y2Input.value = data.force_data.y_bf2;
                } else {
                    alert('Failed to load body force data.');
                }
            } catch (error) {
                console.error('Error loading body force data:', error);
                alert('An error occurred while loading body force data.');
            }
        }
    });

    // Load body forces on page load
    loadBodyForces();
});
