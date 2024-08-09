document.addEventListener('DOMContentLoaded', () => {
    const updateForceBtn = document.getElementById('updateForce');

    // Function to fetch the selected line's data and update the forces_table
    updateForceBtn.addEventListener('click', async () => {
        const selectedLineId = document.getElementById('lineSelectForce').value;
        if (selectedLineId === "") {
            alert("Please select a line.");
            return;
        }

        try {
            // Fetch the selected line's data from the server
            const response = await fetch(`/get-line/${selectedLineId}`);
            const selectedLine = await response.json();

            if (!selectedLine) {
                alert("Failed to fetch line data.");
                return;
            }

            // Send a request to update the forces_table with the line's data
            await fetch(`/update-force-with-line-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    line_id: selectedLine.id, // Use line id from selected line
                    x1: selectedLine.x1,
                    y1: selectedLine.y1,
                    x2: selectedLine.x2,
                    y2: selectedLine.y2
                })
            });

            alert('Force data updated successfully.');
        } catch (error) {
            console.error('Error updating force data:', error);
            alert('Failed to update force data.');
        }
    });
});
