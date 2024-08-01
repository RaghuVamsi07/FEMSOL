document.getElementById('startAnalysis').addEventListener('click', function() {
    fetch('/start-analysis', {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        // Redirect to the new page for analysis result
        window.location.href = "/analysis_result";
    })
    .catch(error => console.error('Error:', error));
});
