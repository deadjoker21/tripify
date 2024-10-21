const express = require('express');
const path = require('path');
const ExcelJS = require('exceljs');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Define a route to fetch Excel data
app.get('/get-data', async (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, 'SearchData.xlsx');
    
    try {
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
