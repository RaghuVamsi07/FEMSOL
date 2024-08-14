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
                    
                    // Plot the primary nodes
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

    // Utility function to get the session_id from cookies
    function getCookie(name) {
        let cookieArr = document.cookie.split(";");
        
        for(let i = 0; i < cookieArr.length; i++) {
            let cookiePair = cookieArr[i].split("=");
            
            if(name == cookiePair[0].trim()) {
                return decodeURIComponent(cookiePair[1]);
            }
        }
        
        return null;
    }

    // Function to plot primary nodes on the canvas
    function plotPrimaryNodes(primaryNodes) {
        const canvas = document.getElementById('graphCanvas');
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        Object.keys(primaryNodes).forEach(lineNum => {
            primaryNodes[lineNum].forEach(node => {
                drawNode(ctx, node.x, node.y);
            });

            for (let i = 0; i < primaryNodes[lineNum].length - 1; i++) {
                drawLine(ctx, primaryNodes[lineNum][i], primaryNodes[lineNum][i + 1]);
            }
        });
    }

    // Function to draw a node on the canvas
    function drawNode(ctx, x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2, true);
        ctx.fillStyle = 'blue';
        ctx.fill();
    }

    // Function to draw a line between two nodes
    function drawLine(ctx, node1, node2) {
        ctx.beginPath();
        ctx.moveTo(node1.x, node1.y);
        ctx.lineTo(node2.x, node2.y);
        ctx.strokeStyle = 'blue';
        ctx.stroke();
    }
});
