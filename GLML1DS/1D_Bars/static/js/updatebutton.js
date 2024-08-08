let isDataUpToDate = false; // Variable to track if the data is up-to-date

// Initialize the buttons and their event listeners
function initButtons() {
    const updateDataButton = document.getElementById('updateData');
    
    if (updateDataButton) {
        updateDataButton.addEventListener('click', function() {
            fetchLatestData();
        });
    }

    // Add more button initializations here as needed in the future
    // Example: 
    // const anotherButton = document.getElementById('anotherButton');
    // if (anotherButton) {
    //     anotherButton.addEventListener('click', function() {
    //         someOtherFunction();
    //     });
    // }
}

function fetchLatestData() {
    fetch('/get-lines')
        .then(response => response.json())
        .then(data => {
            updateLinesSection(data);  // Update lines section
            isDataUpToDate = true;  // Mark data as up-to-date
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function updateLinesSection(data) {
    console.log('Fetched lines:', data);
    const lineSelect = document.getElementById('lineSelect');
    lineSelect.innerHTML = '<option value="">Select a line to highlight</option>'; // Reset dropdown
    data.forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelect.appendChild(option);
    });
}

// Function to check if data is up-to-date before performing an action
function checkDataUpToDate(actionCallback) {
    if (!isDataUpToDate) {
        alert('Please update the sketcher before proceeding.');
    } else {
        actionCallback(); // Proceed with the action if data is up-to-date
    }
}

// Example usage: Add a force only if the data is up-to-date
function initForceButton() {
    const addForceButton = document.getElementById('addForce');
    
    if (addForceButton) {
        addForceButton.addEventListener('click', function() {
            checkDataUpToDate(() => {
                // Your existing logic for adding a force goes here
                console.log('Adding force...');
                // Add the logic to interact with the force.js script here.
            });
        });
    }
}

// Call this function in your main HTML or when the document is ready
function initializeButtonHandlers() {
    initButtons();
    initForceButton();
    // Add other button initializations here
}

// Ensure this script is called after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeButtonHandlers);
