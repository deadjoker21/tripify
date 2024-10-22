const express = require('express');
const app = express();

// Route for the root URL '/'
app.get('/', (req, res) => {
  res.send('Hello, World! This is your root endpoint.');
});

// Example route for '/get-data'
app.get('/get-data', (req, res) => {
  res.send('This is the /get-data endpoint.');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
