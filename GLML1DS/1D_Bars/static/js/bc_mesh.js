document.addEventListener('DOMContentLoaded', function() {
    const meshButton = document.getElementById('mesh');

    if (meshButton) {
        meshButton.addEventListener('click', async function() {
            const sessionId = getCookie('session_id');  // Function to retrieve session_id from cookies

            try {
                const response = await fetch('/process-mesh-data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ session_id: sessionId })
                });

                const result = await response.json();

                if (result.status === 'success') {
                    plotPrimaryNodes(result.primary_nodes);
                } else {
                    alert('Failed to process mesh data: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while processing mesh data.');
            }
        });
    }
});
