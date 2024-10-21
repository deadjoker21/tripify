const express = require('express');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Define a route to fetch Excel data
app.get('/get-data', async (req, res) => {
    const filePath = path.join(__dirname, 'SearchData.xlsx');
    
    // Check if the file exists, if not, create an empty file
    if (!fs.existsSync(filePath)) {
        try {
            // Create a new Excel workbook and add a worksheet with a header row
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Search Data');
            worksheet.addRow(['Destination', 'Date', 'Guests']);
            await workbook.xlsx.writeFile(filePath);
        } catch (error) {
            console.error("Error creating Excel file:", error);
            return res.status(500).send("Could not create Excel file");
        }
    }

    // Read and parse the existing Excel file
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);

        // Extract data from the worksheet
        const data = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Skip header row
                data.push({
                    destination: row.getCell(1).value,
                    date: row.getCell(2).value,
                    guests: row.getCell(3).value
                });
            }
        });

        res.json(data); // Send the data as JSON
    } catch (error) {
        console.error("Error reading Excel file:", error);
        res.status(500).send("Could not read data");
    }
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
