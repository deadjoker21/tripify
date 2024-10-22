const express = require('express');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const ExcelJS = require('exceljs');
const fs = require('fs');

const app = express();

// Load Google Cloud credentials from a JSON file
const credentials = require('./google-credentials.json'); // Path to your JSON file

// Initialize Google Cloud Storage with credentials
const storage = new Storage({
  projectId: credentials.project_id,
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key.replace(/\\n/g, '\n'),
  },
});

// Define your bucket and file
const bucketName = 'your-bucket-name';
const fileName = 'SearchData.xlsx';

// Root route for the base URL
app.get('/', (req, res) => {
  res.send('Hello, World! The server is running.');
});

// Route to fetch Excel data from Google Cloud Storage
app.get('/get-data', async (req, res) => {
  try {
    console.log(`Downloading file: ${fileName} from bucket: ${bucketName}`);

    const tempFilePath = path.join('/tmp', fileName);

    await storage.bucket(bucketName).file(fileName).download({
      destination: tempFilePath,
    });
    console.log('File downloaded successfully');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(tempFilePath);
    const worksheet = workbook.getWorksheet(1);

    const data = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        data.push({
          destination: row.getCell(1).value,
          date: row.getCell(2).value,
          guests: row.getCell(3).value,
        });
      }
    });

    res.json(data);
    fs.unlinkSync(tempFilePath); // Clean up temp file
  } catch (error) {
    console.error('Error processing file:', error.message);
    res.status(500).send('Error processing request');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
