document.addEventListener('DOMContentLoaded', function() {
    const meshButton = document.getElementById('mesh');

    if (meshButton) {
        meshButton.addEventListener('click', async function() {
            const sessionId = getCookie('session_id');  // Fetch session ID from cookies

            try {
                const response = await fetch('/generate-mesh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ session_id: sessionId })
                });

                const result = await response.json();

                if (result.status === 'success') {
                    const primaryNodes = result.primary_nodes;

                    // Plot the primary nodes on the existing canvas
                    plotPrimaryNodes(primaryNodes);
                } else {
                    alert(result.message || 'Failed to generate mesh.');
                }
            } catch (error) {
                console.error('Error generating mesh:', error);
                alert('An error occurred while generating mesh.');
            }
        });
    }

    // Function to get the session_id from cookies
    function getCookie(name) {
        let cookieArr = document.cookie.split(";");

        for(let i = 0; i < cookieArr.length; i++) {
            let cookiePair = cookieArr[i].split("=");

            if(name === cookiePair[0].trim()) {
                return decodeURIComponent(cookiePair[1]);
            }
        }

        return null;
    }

    // Function to plot primary nodes on the canvas
    function plotPrimaryNodes(primaryNodes) {
        // Assuming 'canvas' and 'ctx' are already defined in draw.js
        ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas
        drawGrid();  // Redraw the grid

        Object.keys(primaryNodes).forEach(lineNum => {
            primaryNodes[lineNum].forEach(node => {
                drawNode(node.x, node.y);  // Plot each node
            });

            for (let i = 0; i < primaryNodes[lineNum].length - 1; i++) {
                drawLine(primaryNodes[lineNum][i], primaryNodes[lineNum][i + 1]);  // Connect the nodes with lines
            }
        });
    }

    // Function to draw a node on the canvas
    function drawNode(x, y) {
        ctx.beginPath();
        ctx.arc(originX + x * scale, originY - y * scale, 3, 0, Math.PI * 2, true);
        ctx.fillStyle = 'blue';
        ctx.fill();
    }

    // Function to draw a line between two nodes on the canvas
    function drawLine(node1, node2) {
        ctx.beginPath();
        ctx.moveTo(originX + node1.x * scale, originY - node1.y * scale);
        ctx.lineTo(originX + node2.x * scale, originY - node2.y * scale);
        ctx.strokeStyle = 'blue';
        ctx.stroke();
    }
});
