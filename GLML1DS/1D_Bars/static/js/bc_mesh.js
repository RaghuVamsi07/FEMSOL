document.addEventListener('DOMContentLoaded', () => {
    const meshButton = document.getElementById('mesh');

    if (meshButton) {
        meshButton.addEventListener('click', async function() {
            const sessionId = getCookie('session_id');

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
                    const bcData = result.bc_data;
                    const linesData = result.lines_data;

                    const primaryNodes = segregateAndCombineCoordinates(bcData, linesData);

                    plotPrimaryNodes(primaryNodes);  // Assuming you have the function to plot the nodes

                } else {
                    alert(result.message || 'Failed to generate mesh.');
                }
            } catch (error) {
                console.error('Error generating mesh:', error);
                alert('An error occurred while generating mesh.');
            }
        });
    }

    // Function to segregate and combine the coordinates
    function segregateAndCombineCoordinates(bcData, linesData) {
        const primaryNodes = {};

        linesData.forEach(line => {
            if (!primaryNodes[line.line_num]) {
                primaryNodes[line.line_num] = [];
            }
            primaryNodes[line.line_num].push({ x: line.x1, y: line.y1 });
            primaryNodes[line.line_num].push({ x: line.x2, y: line.y2 });
        });

        bcData.forEach(bc => {
            if (!primaryNodes[bc.line_num]) {
                primaryNodes[bc.line_num] = [];
            }
            primaryNodes[bc.line_num].push({ x: bc.x1, y: bc.y1 });
            primaryNodes[bc.line_num].push({ x: bc.x2, y: bc.y2 });
        });

        // Remove duplicate nodes based on their coordinates
        Object.keys(primaryNodes).forEach(lineNum => {
            primaryNodes[lineNum] = removeDuplicates(primaryNodes[lineNum]);
        });

        return primaryNodes;
    }

    // Function to remove duplicate nodes based on coordinates
    function removeDuplicates(nodes) {
        const uniqueNodes = [];
        const seen = new Set();

        nodes.forEach(node => {
            const coord = `${node.x},${node.y}`;
            if (!seen.has(coord)) {
                uniqueNodes.push(node);
                seen.add(coord);
            }
        });

        return uniqueNodes;
    }
});
