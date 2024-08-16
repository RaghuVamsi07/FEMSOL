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
        // Alert the user if no element type is selected
        alert("Please select either 'Linear' or 'Quadratic' before proceeding.");
        return;  // Do not proceed
    }

    // If element type is selected, show a warning about missing constraints
    if (confirm("No constraints or boundary conditions are specified. This may produce wrong results. Do you want to proceed?")) {
        window.location.href = "/results";
    }
}
