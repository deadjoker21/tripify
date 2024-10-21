const express = require('express');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const app = express();

// Middleware to parse form data (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// POST route to handle form submission and save data to Excel
app.post('/save-search-data', async (req, res) => {
    const { destination, date, guests } = req.body;

    const filePath = path.join(__dirname, 'SearchData.xlsx');
    let workbook;

    // Check if the Excel file exists
    if (fs.existsSync(filePath)) {
        workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
    } else {
        workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Search Data');
        sheet.addRow(['Destination', 'Date', 'Guests']); // Add header row if file doesn't exist
    }

    const worksheet = workbook.getWorksheet('Search Data');

    // Append new search data to Excel
    worksheet.addRow([destination, date, guests]);

    // Save the updated Excel file
    await workbook.xlsx.writeFile(filePath);

    // Redirect back to the home page after submission
    res.redirect('/');
});

// Default route (Home page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Dynamic PORT for Render
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
