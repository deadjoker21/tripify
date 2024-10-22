const express = require('express');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const ExcelJS = require('exceljs');
const fs = require('fs');

const app = express();

// Create a Google Cloud Storage client
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,  // Use your Google Cloud Project ID
  keyFilename: './path-to-your-json-key.json',  // Path to your credentials file (for local dev)
});

// Define your bucket name
const bucketName = process.env.GOOGLE_CLOUD_BUCKET || 'your-bucket-name';
const bucket = storage.bucket(bucketName);

// Temporary local path to store the downloaded file
const tempFilePath = path.join(__dirname, 'tmp', 'SearchData.xlsx');

// Ensure the tmp folder exists
if (!fs.existsSync(path.join(__dirname, 'tmp'))) {
  fs.mkdirSync(path.join(__dirname, 'tmp'));
}

// Download Excel file from Google Cloud Storage
const downloadExcelFileFromGCS = async () => {
  try {
    await bucket.file('SearchData.xlsx').download({
      destination: tempFilePath,
    });
    console.log('SearchData.xlsx downloaded successfully.');
  } catch (error) {
    console.error('Error downloading file from GCS:', error);
  }
};

// Route to fetch Excel data from Google Cloud Storage
app.get('/get-data', async (req, res) => {
  try {
    // Download the file from Google Cloud Storage
    await downloadExcelFileFromGCS();

    // Read the Excel file using ExcelJS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(tempFilePath);
    const worksheet = workbook.getWorksheet(1);

    // Extract data from the worksheet
    const data = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {  // Skip header row
        data.push({
          destination: row.getCell(1).value,
          date: row.getCell(2).value,
          guests: row.getCell(3).value,
        });
      }
    });

    // Send the extracted data as a JSON response
    res.json(data);

    // Clean up the local file after reading it (optional)
    fs.unlinkSync(tempFilePath);
  } catch (error) {
    console.error('Error processing the Excel file:', error);
    res.status(500).send('Could not read Excel file');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
