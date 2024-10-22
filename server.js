const express = require('express');
const { Storage } = require('@google-cloud/storage');
const ExcelJS = require('exceljs');
const app = express();

// Google Cloud Storage setup
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
});

// Name of your bucket and file
const bucketName = process.env.GOOGLE_CLOUD_BUCKET;
const bucket = storage.bucket(bucketName);
const fileName = 'SearchData.xlsx'; // Name of your Excel file in the bucket

// GET /get-data endpoint to fetch and process the Excel file from Google Cloud Storage
app.get('/get-data', async (req, res) => {
  try {
    // Download the Excel file from Google Cloud Storage to a local temporary path
    const tempFilePath = `/tmp/${fileName}`;
    await bucket.file(fileName).download({ destination: tempFilePath });
    console.log(`${fileName} downloaded successfully to ${tempFilePath}`);

    // Read the Excel file using ExcelJS
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(tempFilePath);
    const worksheet = workbook.getWorksheet(1);

    // Process the data from the worksheet
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

    // Send the data as a JSON response
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
