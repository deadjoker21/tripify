const express = require('express');
const { Storage } = require('@google-cloud/storage');
const ExcelJS = require('exceljs');
const app = express();

// Create a Google Cloud Storage client
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),  // Ensure newlines are properly formatted
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

    app.get('/get-data', async (req, res) => {
  try {
    console.log('Attempting to download SearchData.xlsx from Google Cloud Storage...');
    
    // Ensure you're using the correct file path
    const tempFilePath = `/tmp/SearchData.xlsx`;
    await bucket.file('SearchData.xlsx').download({ destination: tempFilePath });
    console.log('File downloaded successfully to:', tempFilePath);

    // Use ExcelJS to read the Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(tempFilePath);
    const worksheet = workbook.getWorksheet(1);

    // Process data
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

    console.log('Successfully processed Excel data:', data);
    res.json(data);

  } catch (error) {
    console.error('Error in /get-data endpoint:', error.message);
    res.status(500).send('Error fetching data');
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
