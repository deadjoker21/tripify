const express = require('express');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const ExcelJS = require('exceljs');
const fs = require('fs');

const app = express();

// Add basic log to ensure server starts
console.log("Starting the server...");

// Test if the route is being accessed
app.get('/get-data', async (req, res) => {
  console.log('GET /get-data endpoint accessed');

  try {
    // Add log to indicate attempt to download the file
    console.log('Attempting to download SearchData.xlsx from Google Cloud Storage...');

    // Simulate some response to check if the route works
    res.send('Endpoint is working but skipping file processing for now.');
  } catch (error) {
    console.error('Error processing the request:', error.message);
    res.status(500).send('Error occurred');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
