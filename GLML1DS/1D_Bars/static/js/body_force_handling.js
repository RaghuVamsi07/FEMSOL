document.addEventListener('DOMContentLoaded', () => {
    const bodyLineNumInput = document.getElementById('bodyLineNum');
    const densityNumInput = document.getElementById('densityNum');
    const densityValInput = document.getElementById('densityVal');
    const addDensityBtn = document.getElementById('addDensity');
    const updateDensityBtn = document.getElementById('updateDensity');
    const deleteDensityBtn = document.getElementById('deleteDensity');
    const densitySelect = document.getElementById('densitySelect');

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

    // Adding a density
    addDensityBtn.addEventListener('click', async () => {
        const lineNum = parseInt(bodyLineNumInput.value);
        const densityNum = parseInt(densityNumInput.value);
        const densityVal = parseFloat(densityValInput.value);

        if (isNaN(lineNum) || isNaN(densityNum) || isNaN(densityVal)) {
            alert("Please enter valid values for all fields.");
            return;
        }

        const lineData = await fetchLineData(lineNum);
        if (lineData) {
            const { x1, y1, x2, y2 } = lineData;

            const densityData = {
                line_num: lineNum,
                dens_num: densityNum,
                dens_val: densityVal,
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2
            };

            try {
                const response = await fetch('/save-density', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(densityData)
                });
                const result = await response.json();

                if (result.status === 'success') {
                    alert("Density data saved successfully.");
                    loadDensities(); // Reload densities to update the dropdown
                } else {
                    alert(result.message || 'Failed to save density data.');
                }
            } catch (error) {
                console.error('Error saving density data:', error);
                alert('An error occurred while saving density data.');
            }
        }
    });

    // Updating a density
    updateDensityBtn.addEventListener('click', async () => {
        const densityId = densitySelect.value;

        if (!densityId) {
            alert('Please select a density to update.');
            return;
        }

        const lineNum = parseInt(bodyLineNumInput.value);
        const densityNum = parseInt(densityNumInput.value);
        const densityVal = parseFloat(densityValInput.value);

        const lineData = await fetchLineData(lineNum);
        if (lineData) {
            const { x1, y1, x2, y2 } = lineData;

            const updatedDensityData = {
                line_num: lineNum,
                dens_num: densityNum,
                dens_val: densityVal,
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2
            };

            try {
                const response = await fetch(`/update-density/${densityId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedDensityData)
                });
                const result = await response.json();

                if (result.status === 'success') {
                    alert('Density updated successfully.');
                    loadDensities(); // Reload densities to update the dropdown
                } else {
                    alert('Failed to update density.');
                }
            } catch (error) {
                console.error('Error updating density:', error);
                alert('An error occurred while updating density.');
            }
        }
    });

    // Deleting a density
    deleteDensityBtn.addEventListener('click', async () => {
        const densityId = densitySelect.value;

        if (!densityId) {
            alert('Please select a density to delete.');
            return;
        }

        try {
            const response = await fetch(`/delete-density/${densityId}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.status === 'success') {
                alert('Density deleted successfully.');
                loadDensities(); // Reload densities to update the dropdown
                densitySelect.value = '';
                bodyLineNumInput.value = '';
                densityNumInput.value = '';
                densityValInput.value = '';
            } else {
                alert('Failed to delete density.');
            }
        } catch (error) {
            console.error('Error deleting density:', error);
            alert('An error occurred while deleting density.');
        }
    });

    // Fetch and populate the dropdown with densities
    async function loadDensities() {
        try {
            const response = await fetch('/get-densities');
            const data = await response.json();

            if (data.status === 'success') {
                densitySelect.innerHTML = '<option value="">Select a Density</option>';
                data.densities.forEach(density => {
                    const option = document.createElement('option');
                    option.value = density.dens_for_id;
                    option.textContent = `Density ${density.dens_num} on Line ${density.line_num}`;
                    densitySelect.appendChild(option);
                });
            } else {
                alert('Failed to load densities.');
            }
        } catch (error) {
            console.error('Error loading densities:', error);
            alert('An error occurred while loading densities.');
        }
    }

    // When a density is selected, load its data into the inputs
    densitySelect.addEventListener('change', async () => {
        const densityId = densitySelect.value;

        if (densityId) {
            try {
                const response = await fetch(`/get-density/${densityId}`);
                const data = await response.json();

                if (data.status === 'success') {
                    bodyLineNumInput.value = data.density_data.line_num;
                    densityNumInput.value = data.density_data.dens_num;
                    densityValInput.value = data.density_data.dens_val;
                } else {
                    alert('Failed to load density data.');
                }
            } catch (error) {
                console.error('Error loading density data:', error);
                alert('An error occurred while loading density data.');
            }
        }
    });

    // Load densities on page load
    loadDensities();
});
