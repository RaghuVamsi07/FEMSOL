// Function to check if linear or quadratic button is selected
function checkElementTypeSelected() {
    let linearSelected = document.getElementById("linear").checked;
    let quadraticSelected = document.getElementById("quadratic").checked;
    return linearSelected || quadraticSelected;
}

// Main validation function called on button click
function validateAndProceed() {
    let elementTypeSelected = checkElementTypeSelected();

    if (!elementTypeSelected) {
        // Show a warning if no element type is selected
        if (confirm("No element type (linear or quadratic) is selected. This may produce wrong results. Do you want to proceed?")) {
            window.location.href = "/results";
        }
    } else {
        // Proceed to results if the element type is selected
        window.location.href = "/results";
    }
}
