  // Show the password prompt when "Contact" button is clicked
    document.getElementById('contactButton').addEventListener('click', () => {
        document.getElementById('passwordSection').style.display = 'block';
    });

    // Handle password submission
    document.getElementById('submitPassword').addEventListener('click', async () => {
        const password = document.getElementById('passwordInput').value;

        try {
            // Send the password to the backend for validation
            const response = await fetch('/get-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            if (response.status === 403) {
                // Incorrect password
                document.getElementById('passwordError').style.display = 'block';
            } else if (response.status === 200) {
                // Correct password, fetch and display data
                document.getElementById('passwordError').style.display = 'none';
                document.getElementById('passwordSection').style.display = 'none';
                document.getElementById('dataSection').style.display = 'block';

                const data = await response.json();

                // Display the fetched data in a table
                let html = '<table border="1"><tr><th>Destination</th><th>Date</th><th>Guests</th></tr>';
                data.forEach(row => {
                    const formattedDate = new Date(row.date).toISOString().split('T')[0]; // Extracting only the date part
                    html += `<tr><td>${row.destination}</td><td>${formattedDate}</td><td>${row.guests}</td></tr>`;
                });
                html += '</table>';
                document.getElementById('dataDisplay').innerHTML = html;
            }
        } catch (error) {
            console.error('Error while fetching data:', error);
        }
    });
