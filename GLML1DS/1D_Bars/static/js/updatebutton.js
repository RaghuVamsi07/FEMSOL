document.addEventListener('DOMContentLoaded', () => {
    const updateForceBtn = document.getElementById('updateForce');

    updateForceBtn.addEventListener('click', async () => {
        const selectedLineId = document.getElementById('lineSelectForce').value;
        if (selectedLineId === "") {
            alert("Please select a line.");
            return;
        }

        try {
            const response = await fetch(`/get-line/${selectedLineId}`);
            const selectedLine = await response.json();

            if (!selectedLine) {
                alert("Failed to fetch line data.");
                return;
            }

            const updateResponse = await fetch(`/update-force-with-line-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    line_id: selectedLine.id,
                    x1: selectedLine.x1,
                    y1: selectedLine.y1,
                    x2: selectedLine.x2,
                    y2: selectedLine.y2
                })
            });

            const result = await updateResponse.json();

            if (result.status === "success") {
                alert('Force data updated successfully.');
            } else {
                alert('Failed to update force data.');
            }
        } catch (error) {
            console.error('Error updating force data:', error);
            alert('Failed to update force data.');
        }
    });
});
