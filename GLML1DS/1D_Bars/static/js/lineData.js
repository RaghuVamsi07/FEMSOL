document.addEventListener('DOMContentLoaded', () => {
    let selectedLineData = {}; // Store fetched line data globally

    // Function to fetch line data by line number
    async function fetchLineData(lineNumber) {
        try {
            const response = await fetch(`/get-line-by-number/${lineNumber}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch line data: ${response.statusText}`);
            }
            const data = await response.json();
            console.log("Fetched line data:", data);
            return data;
        } catch (error) {
            console.error('Error fetching line data:', error);
            alert('Failed to fetch line data.');
            return null;
        }
    }

    // Function to display fetched data in the input fields
    function displayLineData(lineData) {
        document.getElementById('displayID').value = lineData.id;
        document.getElementById('displaySessionID').value = lineData.session_id;
        document.getElementById('displayX1').value = lineData.x1;
        document.getElementById('displayY1').value = lineData.y1;
        document.getElementById('displayX2').value = lineData.x2;
        document.getElementById('displayY2').value = lineData.y2;
    }

    // Event listener for the "Fetch Line Data" button
    document.getElementById('fetchLineData').addEventListener('click', async () => {
        const lineNumber = document.getElementById('lineSelectForce').value; // Assuming you have a select element
        if (!lineNumber) {
            alert("Please select a line first.");
            return;
        }

        const lineData = await fetchLineData(lineNumber);
        if (lineData) {
            selectedLineData = lineData;
            displayLineData(lineData);
        }
    });
});
