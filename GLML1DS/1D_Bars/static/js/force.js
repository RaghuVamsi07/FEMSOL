document.addEventListener('DOMContentLoaded', () => {
    let selectedLineData = {}; // This will store the fetched data for later use

    // Event listener to update the selected line number when a line is selected
    document.addEventListener('click', (event) => {
        // Assuming that clicking a line somehow triggers a method that should set the line number.
        // Replace this logic with whatever actually selects the line in your application
        const lineElement = event.target.closest('.line-class'); // Change '.line-class' to the actual class or identifier of your lines
        if (lineElement) {
            window.selectedLineNumber = lineElement.getAttribute('data-line-number'); // Or however you're identifying your lines
            console.log('Selected Line Number:', window.selectedLineNumber);
        }
    });

    // Function to highlight and fetch data for the selected line
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
