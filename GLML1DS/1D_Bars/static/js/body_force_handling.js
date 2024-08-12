document.addEventListener('DOMContentLoaded', () => {
    const bodyLineNumInput = document.getElementById('bodyLineNum');
    const densityNumInput = document.getElementById('densityNum');
    const densityValInput = document.getElementById('densityVal');
    const areaInput = document.getElementById('area');
    const youngsModulusInput = document.getElementById('youngsModulus');
    const x_bf1Input = document.getElementById('x_bf1');
    const y_bf1Input = document.getElementById('y_bf1');
    const x_bf2Input = document.getElementById('x_bf2');
    const y_bf2Input = document.getElementById('y_bf2');
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

    // Function to check if the points are on the line (similar to previous sections)
    function isPointOnLine(x1, y1, x2, y2, x, y) {
        const distance = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
        const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const pointToStart = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
        const pointToEnd = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2);
        return distance < 1e-5 && pointToStart <= lineLength && pointToEnd <= lineLength;
    }

    // Adding a body force
    addBodyForceBtn.addEventListener('click', async () => {
        const lineNum = parseInt(bodyLineNumInput.value);
        const densityNum = parseInt(densityNumInput.value);
        const densityVal = parseFloat(densityValInput.value);
        const area = areaInput.value.trim();  // Area can be a mathematical expression
        const youngsModulus = parseFloat(youngsModulusInput.value);
        const x_bf1 = parseFloat(x_bf1Input.value);
        const y_bf1 = parseFloat(y_bf1Input.value);
        const x_bf2 = parseFloat(x_bf2Input.value);
        const y_bf2 = parseFloat(y_bf2Input.value);

        if (isNaN(lineNum) || isNaN(densityNum) || isNaN(densityVal) || isNaN(youngsModulus) || isNaN(x_bf1) || isNaN(y_bf1) || isNaN(x_bf2) || isNaN(y_bf2)) {
            alert("Please enter valid values for all fields.");
            return;
        }

        const lineData = await fetchLineData(lineNum);
        if (lineData) {
            const { x1, y1, x2, y2 } = lineData;

            if (!isPointOnLine(x1, y1, x2, y2, x_bf1, y_bf1) || !isPointOnLine(x1, y1, x2, y2, x_bf2, y_bf2)) {
                alert("One or both points are outside the line.");
                return;
            }

            const bodyForceData = {
                line_num: lineNum,
                dens_num: densityNum,
                dens_val: densityVal,
                area: area,
                E: youngsModulus,
                x_bf1: x_bf1,
                y_bf1: y_bf1,
                x_bf2: x_bf2,
                y_bf2: y_bf2
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
                    loadBodyForces(); // Reload body forces to update the dropdown
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
        const bodyForceId = bodyForceSelect.value;

        if (!bodyForceId) {
            alert('Please select a body force to update.');
            return;
        }

        const lineNum = parseInt(bodyLineNumInput.value);
        const densityNum = parseInt(densityNumInput.value);
        const densityVal = parseFloat(densityValInput.value);
        const area = areaInput.value.trim();
        const youngsModulus = parseFloat(youngsModulusInput.value);
        const x_bf1 = parseFloat(x_bf1Input.value);
        const y_bf1 = parseFloat(y_bf1Input.value);
        const x_bf2 = parseFloat(x_bf2Input.value);
        const y_bf2 = parseFloat(y_bf2Input.value);

        const lineData = await fetchLineData(lineNum);
        if (lineData) {
            const { x1, y1, x2, y2 } = lineData;

            if (!isPointOnLine(x1, y1, x2, y2, x_bf1, y_bf1) || !isPointOnLine(x1, y1, x2, y2, x_bf2, y_bf2)) {
                alert("One or both points are outside the line.");
                return;
            }

            const updatedBodyForceData = {
                line_num: lineNum,
                dens_num: densityNum,
                dens_val: densityVal,
                area: area,
                E: youngsModulus,
                x_bf1: x_bf1,
                y_bf1: y_bf1,
                x_bf2: x_bf2,
                y_bf2: y_bf2
            };

            try {
                const response = await fetch(`/update-body-force/${bodyForceId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedBodyForceData)
                });
                const result = await response.json();

                if (result.status === 'success') {
                    alert('Body force updated successfully.');
                    loadBodyForces(); // Reload body forces to update the dropdown
                } else {
                    alert('Failed to update body force.');
                }
            } catch (error) {
                console.error('Error updating body force:', error);
                alert('An error occurred while updating body force.');
            }
        }
    });

    // Deleting a body force
    deleteBodyForceBtn.addEventListener('click', async () => {
        const bodyForceId = bodyForceSelect.value;

        if (!bodyForceId) {
            alert('Please select a body force to delete.');
            return;
        }

        try {
            const response = await fetch(`/delete-body-force/${bodyForceId}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.status === 'success') {
                alert('Body force deleted successfully.');
                loadBodyForces(); // Reload body forces to update the dropdown
                bodyForceSelect.value = '';
                bodyLineNumInput.value = '';
                densityNumInput.value = '';
                densityValInput.value = '';
                areaInput.value = '';
                youngsModulusInput.value = '';
                x_bf1Input.value = '';
                y_bf1Input.value = '';
                x_bf2Input.value = '';
                y_bf2Input.value = '';
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
                data.body_forces.forEach(force => {
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

    // When a body force is selected, load its data into the inputs
    bodyForceSelect.addEventListener('change', async () => {
        const bodyForceId = bodyForceSelect.value;

        if (bodyForceId) {
            try {
                const response = await fetch(`/get-body-force/${bodyForceId}`);
                const data = await response.json();

                if (data.status === 'success') {
                    bodyLineNumInput.value = data.body_force_data.line_num;
                    densityNumInput.value = data.body_force_data.dens_num;
                    densityValInput.value = data.body_force_data.dens_val;
                    areaInput.value = data.body_force_data.area;
                    youngsModulusInput.value = data.body_force_data.E;
                    x_bf1Input.value = data.body_force_data.x_bf1;
                    y_bf1Input.value = data.body_force_data.y_bf1;
                    x_bf2Input.value = data.body_force_data.x_bf2;
                    y_bf2Input.value = data.body_force_data.y_bf2;
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
