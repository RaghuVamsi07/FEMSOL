document.addEventListener('DOMContentLoaded', function() {
    const meshButton = document.getElementById('mesh');

    if (meshButton) {
        meshButton.addEventListener('click', async function() {
            const sessionId = document.cookie.split('; ').find(row => row.startsWith('session_id')).split('=')[1];

            // Fetching data from sing_bodyCons_FE table
            const bcData = await fetch('/get-bc-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ session_id: sessionId })
            }).then(response => response.json());

            // Fetching data from lines_table
            const lineData = await fetch('/get-line-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ session_id: sessionId })
            }).then(response => response.json());

            // Segregating and combining the coordinates
            const primaryNodes = {};
            lineData.forEach(line => {
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

            // Removing duplicates
            Object.keys(primaryNodes).forEach(lineNum => {
                primaryNodes[lineNum] = removeDuplicates(primaryNodes[lineNum]);
            });

            // Now we have the primary nodes, let's plot them
            plotPrimaryNodes(primaryNodes);
        });
    }

    // Function to remove duplicates based on coordinates
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
