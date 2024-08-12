document.addEventListener('DOMContentLoaded', () => {
    const lineNumInput = document.getElementById('thermalLineNum');
    const alphaInput = document.getElementById('alpha');
    const temperatureInput = document.getElementById('temperature');
    const xt1Input = document.getElementById('xt1');
    const yt1Input = document.getElementById('yt1');
    const xt2Input = document.getElementById('xt2');
    const yt2Input = document.getElementById('yt2');
    const addThermalLoadBtn = document.getElementById('addThermalLoad');
    const updateThermalLoadBtn = document.getElementById('updateThermalLoad');
    const deleteThermalLoadBtn = document.getElementById('deleteThermalLoad');
    const thermalLoadSelect = document.getElementById('thermalLoadSelect');

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

    // Adding a thermal load
    addThermalLoadBtn.addEventListener('click', async () => {
        const lineNum = parseInt(lineNumInput.value);
        const alpha = parseFloat(alphaInput.value);
        const temperature = parseFloat(temperatureInput.value);
        const xt1 = parseFloat(xt1Input.value);
        const yt1 = parseFloat(yt1Input.value);
        const xt2 = parseFloat(xt2Input.value);
        const yt2 = parseFloat(yt2Input.value);

        if (isNaN(lineNum) || isNaN(alpha) || isNaN(temperature) || isNaN(xt1) || isNaN(yt1) || isNaN(xt2) || isNaN(yt2)) {
            alert("Please enter valid values for all fields.");
            return;
        }

        const lineData = await fetchLineData(lineNum);
        if (lineData) {
            const { x1, y1, x2, y2 } = lineData;

            if (!isPointOnLine(x1, y1, x2, y2, xt1, yt1) || !isPointOnLine(x1, y1, x2, y2, xt2, yt2)) {
                alert("One or both points are outside the line.");
                return;
            }

            const thermalLoadData = {
                line_num: lineNum,
                alpha: alpha,
                T: temperature,
                xt1: xt1,
                yt1: yt1,
                xt2: xt2,
                yt2: yt2
            };

            try {
                const response = await fetch('/save-thermal-load', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(thermalLoadData)
                });
                const result = await response.json();

                if (result.status === 'success') {
                    alert("Thermal load data saved successfully.");
                    loadThermalLoads(); // Reload forces to update the dropdown
                } else {
                    alert(result.message || 'Failed to save thermal load data.');
                }
            } catch (error) {
                console.error('Error saving thermal load data:', error);
                alert('An error occurred while saving thermal load data.');
            }
        }
    });

    // Updating a thermal load
    updateThermalLoadBtn.addEventListener('click', async () => {
        const forceId = thermalLoadSelect.value;

        if (!forceId) {
            alert('Please select a thermal load to update.');
            return;
        }

        const lineNum = parseInt(lineNumInput.value);
        const alpha = parseFloat(alphaInput.value);
        const temperature = parseFloat(temperatureInput.value);
        const xt1 = parseFloat(xt1Input.value);
        const yt1 = parseFloat(yt1Input.value);
        const xt2 = parseFloat(xt2Input.value);
        const yt2 = parseFloat(yt2Input.value);

        const lineData = await fetchLineData(lineNum);
        if (lineData) {
            const { x1, y1, x2, y2 } = lineData;

            if (!isPointOnLine(x1, y1, x2, y2, xt1, yt1) || !isPointOnLine(x1, y1, x2, y2, xt2, yt2)) {
                alert("One or both points are outside the line.");
                return;
            }

            const updatedThermalLoadData = {
                line_num: lineNum,
                alpha: alpha,
                T: temperature,
                xt1: xt1,
                yt1: yt1,
                xt2: xt2,
                yt2: yt2
            };

            try {
                const response = await fetch(`/update-thermal-load/${forceId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedThermalLoadData)
                });
                const result = await response.json();

                if (result.status === 'success') {
                    alert('Thermal load updated successfully.');
                    loadThermalLoads(); // Reload forces to update the dropdown
                } else {
                    alert('Failed to update thermal load.');
                }
            } catch (error) {
                console.error('Error updating thermal load:', error);
                alert('An error occurred while updating thermal load.');
            }
        }
    });

    // Deleting a thermal load
    deleteThermalLoadBtn.addEventListener('click', async () => {
        const forceId = thermalLoadSelect.value;

        if (!forceId) {
            alert('Please select a thermal load to delete.');
            return;
        }

        try {
            const response = await fetch(`/delete-thermal-load/${forceId}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.status === 'success') {
                alert('Thermal load deleted successfully.');
                loadThermalLoads(); // Reload forces to update the dropdown
                thermalLoadSelect.value = '';
                lineNumInput.value = '';
                alphaInput.value = '';
                temperatureInput.value = '';
                xt1Input.value = '';
                yt1Input.value = '';
                xt2Input.value = '';
                yt2Input.value = '';
            } else {
                alert('Failed to delete thermal load.');
            }
        } catch (error) {
            console.error('Error deleting thermal load:', error);
            alert('An error occurred while deleting thermal load.');
        }
    });

    // Fetch and populate the dropdown with thermal loads
    async function loadThermalLoads() {
        try {
            const response = await fetch('/get-thermal-loads');
            const data = await response.json();

            if (data.status === 'success') {
                thermalLoadSelect.innerHTML = '<option value="">Select a Thermal Load</option>';
                data.forces.forEach(force => {
                    const option = document.createElement('option');
                    option.value = force.thermal_load_id;
                    option.textContent = `Thermal Load ${force.alpha} on Line ${force.line_num}`;
                    thermalLoadSelect.appendChild(option);
                });
            } else {
                alert('Failed to load thermal loads.');
            }
        } catch (error) {
            console.error('Error loading thermal loads:', error);
            alert('An error occurred while loading thermal loads.');
        }
    }

    // When a thermal load is selected, load its data into the inputs
    thermalLoadSelect.addEventListener('change', async () => {
        const forceId = thermalLoadSelect.value;

        if (forceId) {
            try {
                const response = await fetch(`/get-thermal-load/${forceId}`);
                const data = await response.json();

                if (data.status === 'success') {
                    lineNumInput.value = data.force_data.line_num;
                    alphaInput.value = data.force_data.alpha;
                    temperatureInput.value = data.force_data.T;
                    xt1Input.value = data.force_data.xt1;
                    yt1Input.value = data.force_data.yt1;
                    xt2Input.value = data.force_data.xt2;
                    yt2Input.value = data.force_data.yt2;
                } else {
                    alert('Failed to load thermal load data.');
                }
            } catch (error) {
                console.error('Error loading thermal load data:', error);
                alert('An error occurred while loading thermal load data.');
            }
        }
    });

    // Load thermal loads on page load
    loadThermalLoads();
});
