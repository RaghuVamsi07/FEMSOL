document.addEventListener('DOMContentLoaded', () => {
    // Other event listeners and logic...

    async function highlightAndFetchLineData(lineNumber) {
        console.log('Fetching line data for line number:', lineNumber); // Log lineNumber for debugging
        try {
            const response = await fetch(`/get-line-by-number/${lineNumber}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch line data: ${response.statusText}`);
            }
            const selectedLine = await response.json();

            console.log("Line data received:", selectedLine);

            // Store the fetched data
            selectedLineData = selectedLine;
            window.selectedLineData = selectedLineData; // Make available globally

            // Display the fetched data in non-editable buttons
            document.getElementById('displayID').value = selectedLine.id;
            document.getElementById('displaySessionID').value = selectedLine.session_id;
            document.getElementById('displayX1').value = selectedLine.x1;
            document.getElementById('displayY1').value = selectedLine.y1;
            document.getElementById('displayX2').value = selectedLine.x2;
            document.getElementById('displayY2').value = selectedLine.y2;

            // Highlighting logic (assuming you have a canvas or other method to show highlights)
            highlightLineOnCanvas(selectedLine);
        } catch (error) {
            console.error('Error fetching line data:', error);
            alert('Failed to fetch line data.');
        }
    }

    // Event listener for the Fetch button
    document.getElementById('fetchLineData').addEventListener('click', () => {
        const selectedLineNumber = window.selectedLineNumber;
        if (!selectedLineNumber) {
            alert("Please select a line first.");
            return;
        }
        highlightAndFetchLineData(selectedLineNumber);
    });
});
