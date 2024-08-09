document.addEventListener('DOMContentLoaded', () => {
    const updateForceBtn = document.getElementById('updateForce');

    updateForceBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/get-lines');
            const lines = await response.json();

            if (!lines || lines.length === 0) {
                alert("No lines found to update.");
                return;
            }

            const updatePromises = lines.map(async (line) => {
                return await fetch(`/update-force-with-line-data`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        line_id: line.id,
                        x1: line.x1,
                        y1: line.y1,
                        x2: line.x2,
                        y2: line.y2
                    })
                });
            });

            await Promise.all(updatePromises);
            alert('All lines have been updated successfully.');

        } catch (error) {
            console.error('Error updating force data:', error);
            alert('Failed to update force data.');
        }
    });
});
