document.addEventListener('DOMContentLoaded', () => {
    const lineSelectBody = document.getElementById('lineSelectBody');

    // Function to update the dropdown with available lines
    function updateBodyLineSelect() {
        const lines = JSON.parse(localStorage.getItem('lines')) || [];
        lineSelectBody.innerHTML = '<option value="">Select a line</option>';
        lines.forEach((line, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Line ${index + 1}`;
            lineSelectBody.appendChild(option);
        });
    }

    updateBodyLineSelect();

    // Function to highlight the selected line
    lineSelectBody.addEventListener('change', () => {
        const selectedIndex = lineSelectBody.value;
        if (selectedIndex !== "") {
            const lines = JSON.parse(localStorage.getItem('lines')) || [];
            const selectedLine = lines[selectedIndex];

            if (selectedLine) {
                // Your code to highlight the selected line
                console.log(`Line ${selectedIndex + 1} selected:`, selectedLine);
            }
        }
    });
});
