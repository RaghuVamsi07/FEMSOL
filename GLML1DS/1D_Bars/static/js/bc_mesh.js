document.addEventListener('DOMContentLoaded', function() {
    const meshButton = document.getElementById('mesh');

    if (meshButton) {
        meshButton.addEventListener('click', async function() {
            const sessionId = getCookie('session_id');  // Assuming you have the getCookie function defined elsewhere

            // Request to generate mesh
            const response = await fetch('/generate-mesh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ session_id: sessionId })
            });

            const result = await response.json();

            if (result.status === 'success') {
                plotPrimaryNodes(result.mesh_data);  // Plot the returned mesh data
            } else {
                alert('Failed to generate mesh.');
            }
        });
    }

    // Function to plot primary nodes on canvas
    function plotPrimaryNodes(primaryNodes) {
        const canvas = document.getElementById('graphCanvas');
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas

        Object.keys(primaryNodes).forEach(lineNum => {
            primaryNodes[lineNum].forEach(node => {
                drawNode(ctx, node.x, node.y);
            });

            // Optionally, draw lines between the nodes
            for (let i = 0; i < primaryNodes[lineNum].length - 1; i++) {
                drawLine(ctx, primaryNodes[lineNum][i], primaryNodes[lineNum][i + 1]);
            }
        });
    }

    // Helper function to draw a node
    function drawNode(ctx, x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2, true);  // Small circle to represent the node
        ctx.fillStyle = 'blue';
        ctx.fill();
    }

    // Helper function to draw a line between two nodes
    function drawLine(ctx, node1, node2) {
        ctx.beginPath();
        ctx.moveTo(node1.x, node1.y);
        ctx.lineTo(node2.x, node2.y);
        ctx.strokeStyle = 'blue';
        ctx.stroke();
    }
});

// Define the getCookie function if it's not defined
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
