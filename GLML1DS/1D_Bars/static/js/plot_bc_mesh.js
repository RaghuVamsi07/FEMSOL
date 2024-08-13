function plotPrimaryNodes(primaryNodes) {
    const canvas = document.getElementById('graphCanvas'); // Assuming you have a canvas with this ID
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas

    Object.keys(primaryNodes).forEach(lineNum => {
        primaryNodes[lineNum].forEach(node => {
            drawNode(ctx, node[0], node[1]);
        });

        // Optionally, you can draw lines between the nodes
        for (let i = 0; i < primaryNodes[lineNum].length - 1; i++) {
            drawLine(ctx, primaryNodes[lineNum][i], primaryNodes[lineNum][i + 1]);
        }
    });
}

// Function to draw a node on the canvas
function drawNode(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2, true);  // Small circle to represent the node
    ctx.fillStyle = 'blue';
    ctx.fill();
}

// Function to draw a line between two nodes
function drawLine(ctx, node1, node2) {
    ctx.beginPath();
    ctx.moveTo(node1[0], node1[1]);
    ctx.lineTo(node2[0], node2[1]);
    ctx.strokeStyle = 'blue';
    ctx.stroke();
}
