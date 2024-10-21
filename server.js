const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');
const fs = require('fs');

const app = express();

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (like index.html, style.css)
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

    res.redirect('/'); // Redirect back to the homepage after submission
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
console.log('Serving static files from:', path.join(__dirname, 'public'));
