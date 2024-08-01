const lineSelectForce = document.getElementById('lineSelectForce');
const fxInput = document.getElementById('fx');
const fyInput = document.getElementById('fy');
const forceXInput = document.getElementById('forceX');
const forceYInput = document.getElementById('forceY');
const addForceBtn = document.getElementById('addForce');
const selectLineBtn = document.getElementById('selectLineForce');

let forcesDataUnique = JSON.parse(localStorage.getItem('forces')) || [];
let forceLinesUnique = JSON.parse(localStorage.getItem('lines')) || [];

// Update the line select dropdown for forces
function updateForceLineSelectUnique() {
    forceLinesUnique = JSON.parse(localStorage.getItem('lines')) || [];
    lineSelectForce.innerHTML = '<option value="">Select a line</option>';
    forceLinesUnique.forEach((line, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Line ${index + 1}`;
        lineSelectForce.appendChild(option);
    });
}

// Highlight the selected line and update force inputs
lineSelectForce.addEventListener('change', (e) => {
    const selectedIndex = e.target.value;
    if (selectedIndex === "") return;

    const selectedLine = forceLinesUnique[selectedIndex];
    forceHighlightLineUnique(selectedLine);
    updateForceInputsUnique(selectedIndex);
});

// Update force inputs based on the selected line
function updateForceInputsUnique(selectedIndex) {
    const force = forcesDataUnique.find(force => force.lineIndex == selectedIndex);
    if (force) {
        fxInput.value = force.fx;
        fyInput.value = force.fy;
        forceXInput.value = force.x;
        forceYInput.value = force.y;
    } else {
        fxInput.value = '';
        fyInput.value = '';
        forceXInput.value = '';
        forceYInput.value = '';
    }
}

// Add or update force on the selected line
addForceBtn.addEventListener('click', () => {
    const selectedIndex = lineSelectForce.value;
    if (selectedIndex === "") return;

    const fx = parseFloat(fxInput.value);
    const fy = parseFloat(fyInput.value);
    const x = parseFloat(forceXInput.value);
    const y = parseFloat(forceYInput.value);

    const forceIndex = findForceIndexUnique(selectedIndex, x, y);
    if (forceIndex !== -1) {
        forcesDataUnique[forceIndex].fx = fx;
        forcesDataUnique[forceIndex].fy = fy;
    } else {
        forcesDataUnique.push({ lineIndex: selectedIndex, fx, fy, x, y });
    }

    localStorage.setItem('forces', JSON.stringify(forcesDataUnique));
    forceDrawUnique();
});

// Function to find the index of an existing force
function findForceIndexUnique(lineIndex, x, y) {
    return forcesDataUnique.findIndex(force => force.lineIndex == lineIndex && force.x == x && force.y == y);
}

// Button to select a line for force
selectLineBtn.addEventListener('click', () => {
    updateForceLineSelectUnique();
});

// Initialize the line selection for forces
updateForceLineSelectUnique();
