function updateRowNumbers() {
    // Update the row numbers in the database when the update button is clicked
    fetch('/update-row-numbers', { method: 'POST' })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                // After successful row number update, enable other sections
                enableSections();
            } else {
                console.error('Failed to update row numbers');
            }
        })
        .catch(error => {
            console.error('Error during row number update:', error);
        });
}

function enableSections() {
    // Enable the sections or buttons that were disabled before the update
    document.getElementById('forcesSection').style.display = 'block';
    document.getElementById('distributiveForcesSection').style.display = 'block';
    // Add more sections as needed
}

// Bind the updateRowNumbers function to the Update button
document.getElementById('updateButton').addEventListener('click', updateRowNumbers);

// Ensure sections are disabled initially
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('forcesSection').style.display = 'none';
    document.getElementById('distributiveForcesSection').style.display = 'none';
    // Add more sections as needed
});
