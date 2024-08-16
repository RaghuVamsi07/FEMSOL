let selectedElementType = null;

// Function to set the selected element type when a button is clicked
function selectElementType(type) {
    selectedElementType = type;
}

// Function to check if an element type is selected
function checkElementTypeSelected() {
    return selectedElementType !== null;
}

// Main validation function called on button click
function validateAndProceed() {
    let elementTypeSelected = checkElementTypeSelected();

    if (!elementTypeSelected) {
        if (confirm("No element type (linear or quadratic) is selected. This may produce wrong results. Do you want to proceed?")) {
            window.open('/results', '_blank');  // Open results page in a new tab
        }
    } else {
        window.open('/results', '_blank');  // Open results page in a new tab
    }
}
