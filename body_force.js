const lineSelectBody = document.getElementById('lineSelectBody');
const bodyForceInput = document.getElementById('bodyForce');
const bodyX1Input = document.getElementById('bodyX1');
const bodyY1Input = document.getElementById('bodyY1');
const bodyX2Input = document.getElementById('bodyX2');
const bodyY2Input = document.getElementById('bodyY2');
const addBodyForceBtn = document.getElementById('addBodyForce');

lineSelectBody.addEventListener('change', (e) => {
    const selectedIndex = e.target.value;
    if (selectedIndex === "") return;

    const selectedLine = lines[selectedIndex];
    highlightLine(selectedLine);
});

addBodyForceBtn.addEventListener('click', () => {
    const selectedIndex = lineSelectBody.value;
    if (selectedIndex === "") return;

    const forceExpression = bodyForceInput.value;
    const x1 = parseFloat(bodyX1Input.value);
    const y1 = parseFloat(bodyY1Input.value);
    const x2 = parseFloat(bodyX2Input.value);
    const y2 = parseFloat(bodyY2Input.value);

    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
        alert('Please enter valid coordinates.');
        return;
    }

    // Ensure the coordinates are within the line segment
    const line = lines[selectedIndex];
    if ((x1 < line.x1 && x1 < line.x2) || (x1 > line.x1 && x1 > line.x2) ||
        (x2 < line.x1 && x2 < line.x2) || (x2 > line.x1 && x2 > line.x2) ||
        (y1 < line.y1 && y1 < line.y2) || (y1 > line.y1 && y1 > line.y2) ||
        (y2 < line.y1 && y2 < line.y2) || (y2 > line.y1 && y2 > line.y2)) {
        alert('The coordinates are out of the line segment.');
        return;
    }

    const bodyForces = JSON.parse(localStorage.getItem('bodyForces')) || [];
    bodyForces.push({
        lineIndex: selectedIndex,
        expression: forceExpression,
        x1,
        y1,
        x2,
        y2
    });
    localStorage.setItem('bodyForces', JSON.stringify(bodyForces));

    // Optionally, draw the body force on the canvas
    drawBodyForce(selectedIndex, x1, y1, x2, y2);
});

function drawBodyForce(lineIndex, x1, y1, x2, y2) {
    const line = lines[lineIndex];
    const midX1 = (line.x1 + x1) / 2;
    const midY1 = (line.y1 + y1) / 2;
    const midX2 = (line.x2 + x2) / 2;
    const midY2 = (line.y2 + y2) / 2;

    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX + midX1 * scale, originY - midY1 * scale);
    ctx.lineTo(originX + midX2 * scale, originY - midY2 * scale);
    ctx.stroke();
}
