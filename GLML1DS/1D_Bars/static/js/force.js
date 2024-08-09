document.addEventListener('DOMContentLoaded', () => {
    let selectedLineData = {}; // This will store the fetched data for later use

    // Event listener to update the selected line number when a line is selected
    document.getElementById('lineSelectForce').addEventListener('change', (event) => {
        window.selectedLineNumber = event.target.value;
    });

    // Function to highlight and fetch data for the selected line
   async function highlightAndFetchLineData(lineNumber) {
    try {
        const response = await fetch(`/get-line-by-number/${lineNumber}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch line data: ${response.statusText}`);
        }

        const selectedLine = await response.json();
        console.log("Fetched line data:", selectedLine);

        if (!selectedLine || !selectedLine.x1 || !selectedLine.y1 || !selectedLine.x2 || !selectedLine.y2) {
            console.error("Incomplete line data:", selectedLine);
            alert("Failed to fetch line data or line data is incomplete.");
            return;
        }

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


    // Function to handle highlighting (to be replaced with your actual implementation)
    function highlightLineOnCanvas(lineData) {
        console.log("Highlighting line on canvas:", lineData);
        // Implement your canvas highlighting logic here
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
