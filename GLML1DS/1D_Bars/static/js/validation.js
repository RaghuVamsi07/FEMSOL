// Function to fetch data from the server
async function fetchFromDatabase(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Failed to fetch data:', response.statusText);
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

// Function to check if at least one line is created
async function checkLinesCreated() {
    let lines = await fetchFromDatabase('/api/lines'); // Replace with the correct API endpoint
    return lines.length > 0;
}

// Function to check if a valid boundary condition is selected and specified
async function checkBCCondition() {
    let bcValid = false;

    // Example checking for BC1 (extend for other BCs as needed)
    let bcContents = document.querySelectorAll('.bcContent');
    
    for (let i = 0; i < bcContents.length; i++) {
        if (bcContents[i].style.display !== 'none') {
            let bcData = await fetchFromDatabase('/api/sing_bodyCons_FE'); // Replace with the correct API endpoint
            if (bcData.length > 0) {
                bcValid = true;
                break;
            }
        }
    }

    return bcValid;
}

// Function to check if linear or quadratic button is selected
function checkElementTypeSelected() {
    let linearSelected = document.getElementById("linear").checked;
    let quadraticSelected = document.getElementById("quadratic").checked;
    return linearSelected || quadraticSelected;
}

// Main validation function called on button click
async function validateAndProceed() {
    let linesCreated = await checkLinesCreated();
    let bcValid = await checkBCCondition();
    let elementTypeSelected = checkElementTypeSelected();

    if (linesCreated && bcValid && elementTypeSelected) {
        window.location.href = "/results";
    } else {
        alert("Please ensure that you have created at least one line, selected a boundary condition with at least one BC specified, and selected either linear or quadratic elements.");
    }
}
