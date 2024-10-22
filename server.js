const express = require('express');
const { Storage } = require('@google-cloud/storage');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const app = express();

// Log environment variable details for debugging
console.log('GOOGLE_CLOUD_PROJECT:', process.env.GOOGLE_CLOUD_PROJECT);
console.log('GOOGLE_CLOUD_BUCKET:', process.env.GOOGLE_CLOUD_BUCKET);
console.log('GOOGLE_CLOUD_CLIENT_EMAIL:', process.env.GOOGLE_CLOUD_CLIENT_EMAIL);

// Ensure private key is being loaded
if (!process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
  console.error('ERROR: GOOGLE_CLOUD_PRIVATE_KEY is missing.');
} else {
  console.log('Private key loaded');
}

let privateKey;
try {
  privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n');
  console.log('Private key formatted correctly.');
} catch (error) {
  console.error('Error formatting private key:', error.message);
}

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: privateKey,
  },
});

// Define your bucket and file
const bucketName = process.env.GOOGLE_CLOUD_BUCKET;
const fileName = 'SearchData.xlsx'; // Change to your actual file

// Route to fetch Excel data from Google Cloud Storage
app.get('/get-data', async (req, res) => {
  try {
    console.log('Starting to process /get-data request...');

    // Log bucket and file details
    console.log(`Bucket: ${bucketName}, File: ${fileName}`);

    // Temporary local path to store the downloaded file
    const tempFilePath = path.join('/tmp', fileName);
    console.log(`Temp file path: ${tempFilePath}`);

    // Download the file from Google Cloud Storage
    await storage.bucket(bucketName).file(fileName).download({
      destination: tempFilePath,
    });
    console.log(`${fileName} downloaded successfully to ${tempFilePath}`);

    // Read the Excel file using ExcelJS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(tempFilePath);
    const worksheet = workbook.getWorksheet(1);

    // Process data from worksheet
    const data = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip the header row
        data.push({
          destination: row.getCell(1).value,
          date: row.getCell(2).value,
          guests: row.getCell(3).value,
        });
      }
    });
    console.log('Data processed successfully:', data);

    // Send the data as JSON response
    res.json(data);

    // Clean up the temp file
    fs.unlinkSync(tempFilePath);
    console.log('Temporary file deleted successfully');
  } catch (error) {
    console.error('Error in /get-data function:', error.message);
    res.status(500).send('Error processing request');
  }
});

// Default route to check if the server is running
app.get('/', (req, res) => {
  res.send('Hello, World! This server is running.');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
