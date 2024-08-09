document.addEventListener('DOMContentLoaded', async () => {
    let lines = [];
    let selectedLineData = {}; // This will store the fetched data for later use
    const sessionID = getCookie('session_id');

    // Function to fetch lines from the backend
    async function fetchLines() {
        try {
            const response = await fetch('/get-lines', { cache: 'no-cache' });
            const data = await response.json();
            console.log('Fetched data:', data);
            if (Array.isArray(data) && data.length > 0) {
                lines = data;
            } else {
                console.error('No lines fetched or invalid data format:', data);
            }
        } catch (error) {
            console.error('Error fetching lines:', error);
        }
    }

    // Function to highlight and fetch data for the selected line
    async function highlightAndFetchLineData(lineNumber) {
        try {
            const response = await fetch(`/get-line-by-number/${lineNumber}`);
            const selectedLine = await response.json();

            if (response.status !== 200 || !selectedLine || !selectedLine.x1 || !selectedLine.y1 || !selectedLine.x2 || !selectedLine.y2) {
                console.error("Line data not found or incomplete:", selectedLine);
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

    // Example function to handle highlighting (to be replaced with your actual implementation)
    function highlightLineOnCanvas(lineData) {
        console.log("Highlighting line on canvas:", lineData);
        // Implement your canvas highlighting logic here
    }

    // Load initial data
    await fetchLines();

    // Example of how to call the highlightAndFetchLineData function
    // Assuming you have a way to know which line is selected (e.g., a click event)
    document.getElementById('canvas').addEventListener('click', () => {
        const selectedLineNumber = 2; // Replace with actual logic to determine selected line number
        highlightAndFetchLineData(selectedLineNumber);
    });

    // Function to get a cookie by name
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
});
