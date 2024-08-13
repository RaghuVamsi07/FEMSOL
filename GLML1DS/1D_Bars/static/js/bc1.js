document.addEventListener('DOMContentLoaded', () => {
    const lineNumInput = document.getElementById('lineNumBC1');
    const bcNumInput = document.getElementById('bcNumBC1');
    const x1Input = document.getElementById('x1BC1');
    const y1Input = document.getElementById('y1BC1');
    const x2Input = document.getElementById('x2BC1');
    const y2Input = document.getElementById('y2BC1');
    const addBC1Btn = document.getElementById('addBC1');
    const updateBC1Btn = document.getElementById('updateBC1');
    const deleteBC1Btn = document.getElementById('deleteBC1');
    const bc1Select = document.getElementById('bc1Select');

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

    // Adding BC1
    addBC1Btn.addEventListener('click', async () => {
        const lineNum = parseInt(lineNumInput.value);
        const bcNum = parseInt(bcNumInput.value);
        const x1 = parseFloat(x1Input.value);
        const y1 = parseFloat(y1Input.value);
        const x2 = parseFloat(x2Input.value);
        const y2 = parseFloat(y2Input.value);

        if (isNaN(lineNum) || isNaN(bcNum) || isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
            alert("Please enter valid values for all fields.");
            return;
        }

        const lineData = await fetchLineData(lineNum);
        if (lineData) {
            const { x1: lx1, y1: ly1, x2: lx2, y2: ly2 } = lineData;

            if (!isPointOnLine(lx1, ly1, lx2, ly2, x1, y1) || !isPointOnLine(lx1, ly1, lx2, ly2, x2, y2)) {
                alert("One or both points are outside the line.");
                return;
            }

            const bc1Data = {
                line_num: lineNum,
                BC_num: bcNum,
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2
            };

            try {
                const response = await fetch('/save-bc1', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bc1Data)
                });
                const result = await response.json();

                if (result.status === 'success') {
                    alert("Boundary condition data saved successfully.");
                    loadBC1s(); // Reload BC1s to update the dropdown
                } else {
                    alert(result.message || 'Failed to save boundary condition data.');
                }
            } catch (error) {
                console.error('Error saving boundary condition data:', error);
                alert('An error occurred while saving boundary condition data.');
            }
        }
    });

    // Updating BC1
    updateBC1Btn.addEventListener('click', async () => {
        const bcId = bc1Select.value;

        if (!bcId) {
            alert('Please select a boundary condition to update.');
            return;
        }

        const lineNum = parseInt(lineNumInput.value);
        const bcNum = parseInt(bcNumInput.value);
        const x1 = parseFloat(x1Input.value);
        const y1 = parseFloat(y1Input.value);
        const x2 = parseFloat(x2Input.value);
        const y2 = parseFloat(y2Input.value);

        const lineData = await fetchLineData(lineNum);
        if (lineData) {
            const { x1: lx1, y1: ly1, x2: lx2, y2: ly2 } = lineData;

            if (!isPointOnLine(lx1, ly1, lx2, ly2, x1, y1) || !isPointOnLine(lx1, ly1, lx2, ly2, x2, y2)) {
                alert("One or both points are outside the line.");
                return;
            }

            const updatedBC1Data = {
                line_num: lineNum,
                BC_num: bcNum,
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2
            };

            try {
                const response = await fetch(`/update-bc1/${bcId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedBC1Data)
                });
                const result = await response.json();

                if (result.status === 'success') {
                    alert('Boundary condition updated successfully.');
                    loadBC1s(); // Reload BC1s to update the dropdown
                } else {
                    alert('Failed to update boundary condition.');
                }
            } catch (error) {
                console.error('Error updating boundary condition:', error);
                alert('An error occurred while updating boundary condition.');
            }
        }
    });

    // Deleting BC1
    deleteBC1Btn.addEventListener('click', async () => {
        const bcId = bc1Select.value;

        if (!bcId) {
            alert('Please select a boundary condition to delete.');
            return;
        }

        try {
            const response = await fetch(`/delete-bc1/${bcId}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.status === 'success') {
                alert('Boundary condition deleted successfully.');
                loadBC1s(); // Reload BC1s to update the dropdown
                bc1Select.value = '';
                lineNumInput.value = '';
                bcNumInput.value = '';
                x1Input.value = '';
                y1Input.value = '';
                x2Input.value = '';
                y2Input.value = '';
            } else {
                alert('Failed to delete boundary condition.');
            }
        } catch (error) {
            console.error('Error deleting boundary condition:', error);
            alert('An error occurred while deleting boundary condition.');
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



    

    // Fetch and populate the dropdown with boundary conditions
    async function loadBC1s() {
        try {
            const response = await fetch('/get-bc1s');
            const data = await response.json();

            if (data.status === 'success') {
                bc1Select.innerHTML = '<option value="">Select a Boundary Condition</option>';
                data.bc1s.forEach(bc1 => {
                    const option = document.createElement('option');
                    option.value = bc1.id;
                    option.textContent = `BC ${bc1.BC_num} on Line ${bc1.line_num}`;
                    bc1Select.appendChild(option);
                });
            } else {
                alert('Failed to load boundary conditions.');
            }
        } catch (error) {
            console.error('Error loading boundary conditions:', error);
            alert('An error occurred while loading boundary conditions.');
        }
    }

    // When a boundary condition is selected, load its data into the inputs
    bc1Select.addEventListener('change', async () => {
        const bcId = bc1Select.value;

        if (bcId) {
            try {
                const response = await fetch(`/get-bc1/${bcId}`);
                const data = await response.json();

                if (data.status === 'success') {
                    lineNumInput.value = data.bc1_data.line_num;
                    bcNumInput.value = data.bc1_data.BC_num;
                    x1Input.value = data.bc1_data.x1;
                    y1Input.value = data.bc1_data.y1;
                    x2Input.value = data.bc1_data.x2;
                    y2Input.value = data.bc1_data.y2;
                } else {
                    alert('Failed to load boundary condition data.');
                }
            } catch (error) {
                console.error('Error loading boundary condition data:', error);
                alert('An error occurred while loading boundary condition data.');
            }
        }
    });

    // Load boundary conditions on page load
    loadBC1s();
});
