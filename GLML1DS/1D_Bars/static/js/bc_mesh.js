document.addEventListener('DOMContentLoaded', function() {
    const meshButton = document.getElementById('mesh');

    if (meshButton) {
        meshButton.addEventListener('click', async function() {
            const sessionId = getCookie('session_id');  // Fetch session ID from cookies

            try {
                const response = await fetch('/fetch-mesh-data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ session_id: sessionId })
                });
                
                const result = await response.json();

                if (result.status === 'success') {
                    console.log('BC Data received from server:', result.bc_data);  // Checkpoint: Log BC data
                    console.log('Lines Data received from server:', result.lines_data);  // Checkpoint: Log lines data
                    // Handle the data (e.g., plot on canvas, etc.)
                } else {
                    alert(result.message || 'Failed to fetch mesh data.');
                }
            } catch (error) {
                console.error('Error fetching mesh data:', error);
                alert('An error occurred while fetching mesh data.');
            }
        });
    }
});

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
