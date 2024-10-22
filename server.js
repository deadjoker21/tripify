const express = require('express');
const app = express();
const path = require('path');

// Serve static files (if necessary)
app.use(express.static(path.join(__dirname, 'public')));

// Default route for `/` - handle base URL
app.get('/', (req, res) => {
  res.send('Hello, World! Your app is running.');
});

// Example route to handle `/get-data`
app.get('/get-data', (req, res) => {
  res.send('This will be your data response.');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
