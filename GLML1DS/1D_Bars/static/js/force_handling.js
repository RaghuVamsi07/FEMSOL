document.addEventListener('DOMContentLoaded', () => {
    const lineNumInput = document.getElementById('lineNum');
    const forceNumInput = document.getElementById('forceNum');
    const fxInput = document.getElementById('fx');
    const fyInput = document.getElementById('fy');
    const forceXInput = document.getElementById('forceX');
    const forceYInput = document.getElementById('forceY');
    const addForceBtn = document.getElementById('addForce');

    addForceBtn.addEventListener('click', async () => {
        // Read input values
        const lineNum = parseInt(lineNumInput.value);
        const forceNum = parseInt(forceNumInput.value);
        const fx = parseFloat(fxInput.value);
        const fy = parseFloat(fyInput.value);
        const x = parseFloat(forceXInput.value);
        const y = parseFloat(forceYInput.value);

        console.log('Input values:', { lineNum, forceNum, fx, fy, x, y });

        // Validate input values
        if (isNaN(lineNum) || isNaN(forceNum) || isNaN(fx) || isNaN(fy) || isNaN(x) || isNaN(y)) {
            alert("Please enter valid values for all fields.");
            console.error('Validation failed: Invalid input values.');
            return;
        }
        document.addEventListener('DOMContentLoaded', () => {
    const addForceBtn = document.getElementById('addForce');
    addForceBtn.addEventListener('click', async () => {
        // Your data gathering and sending logic
        try {
            const response = await fetch('/save-force', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(forceData),
            });

            const result = await response.json();

            if (response.ok) {
                console.log('Force data saved successfully:', result);
                alert('Force data saved successfully.');
            } else {
                console.error('Error saving force data:', result.message);
                alert('Failed to save force data: ' + result.message);
            }
        } catch (error) {
            console.error('Error saving force data:', error);
            alert('An error occurred while saving force data.');
        }
    });
});
     
        // Prepare data for sending to the server
        const forceData = {
            line_num: lineNum,
            force_num: forceNum,
            fx: fx,
            fy: fy,
            x: x,
            y: y
        };

        console.log('Force data being sent to server:', forceData);

        try {
            // Make the POST request to save the force data
            const response = await fetch('/save-force', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(forceData)
            });

            const result = await response.json();

            console.log('Server response:', result);

            if (result.status === 'success') {
                alert("Force data saved successfully.");
                // Optionally, refresh the force list or update the UI
            } else {
                alert(result.message || 'Failed to save force data.');
                console.error('Error from server:', result.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error saving force data:', error);
            alert('An error occurred while saving force data.');
        }
    });
});
