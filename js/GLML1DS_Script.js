document.getElementById('submit-analysis').addEventListener('click', function () {
    // Get form values
    const material = document.getElementById('material').value;
    const geometry = document.getElementById('geometry').value;
    const load = document.getElementById('load').value;
    const boundaryConditions = document.getElementById('boundary-conditions').value;

    // Perform analysis (dummy data for now)
    const results = `Material: ${material}<br>
                     Geometry: ${geometry}<br>
                     Load: ${load} N<br>
                     Boundary Conditions: ${boundaryConditions}<br>
                     <strong>Analysis Result:</strong> This is a dummy result.`;

    // Display results
    document.getElementById('results-display').innerHTML = results;
});
