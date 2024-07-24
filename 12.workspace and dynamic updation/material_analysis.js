document.addEventListener('DOMContentLoaded', () => {
    const lineSelectMaterial = document.getElementById('lineSelectMaterial');
    const youngsModulusInput = document.getElementById('youngsModulus');
    const areaInput = document.getElementById('area');
    const x1MaterialInput = document.getElementById('x1Material');
    const y1MaterialInput = document.getElementById('y1Material');
    const x2MaterialInput = document.getElementById('x2Material');
    const y2MaterialInput = document.getElementById('y2Material');
    const setMaterialAnalysisBtn = document.getElementById('setMaterialAnalysis');
    let materialProperties = JSON.parse(localStorage.getItem('materialProperties')) || [];

    function updateMaterialLineSelect() {
        const lines = JSON.parse(localStorage.getItem('lines')) || [];
        lineSelectMaterial.innerHTML = '<option value="">Select a line</option>';
        lines.forEach((line, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Line ${index + 1}`;
            lineSelectMaterial.appendChild(option);
        });
    }

    updateMaterialLineSelect();

    setMaterialAnalysisBtn.addEventListener('click', () => {
        const selectedIndex = lineSelectMaterial.value;
        if (selectedIndex === "") {
            alert("Please select a line.");
            return;
        }

        const youngsModulus = parseFloat(youngsModulusInput.value);
        const areaExpression = areaInput.value;
        const x1 = parseFloat(x1MaterialInput.value);
        const y1 = parseFloat(y1MaterialInput.value);
        const x2 = parseFloat(x2MaterialInput.value);
        const y2 = parseFloat(y2MaterialInput.value);

        if (isNaN(youngsModulus) || !areaExpression || isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
            alert("Please enter valid material properties and coordinates.");
            return;
        }

        const lines = JSON.parse(localStorage.getItem('lines')) || [];
        const selectedLine = lines[selectedIndex];

        if (!isPointOnLine(selectedLine, x1, y1) || !isPointOnLine(selectedLine, x2, y2)) {
            alert("The coordinates are out of the body.");
            return;
        }

        try {
            const compiledAreaExpression = math.compile(areaExpression);

            const newMaterialProperty = { 
                lineIndex: selectedIndex, 
                youngsModulus, 
                areaExpression, 
                compiledAreaExpression, 
                x1, 
                y1, 
                x2, 
                y2 
            };
            materialProperties.push(newMaterialProperty);
            localStorage.setItem('materialProperties', JSON.stringify(materialProperties));
            alert("Material properties added successfully.");
        } catch (error) {
            alert("Invalid mathematical expression.");
        }
    });

    function isPointOnLine(line, x, y) {
        const x1 = line.x1, y1 = line.y1, x2 = line.x2, y2 = line.y2;
        const distance = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
        const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const pointToStart = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
        const pointToEnd = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2);
        return (distance < 1e-5 && pointToStart <= lineLength && pointToEnd <= lineLength);
    }
});
