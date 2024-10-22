const express = require('express');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

const app = express();
app.use(express.json()); // To parse JSON bodies

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Password for viewing the data
const correctPassword = 'securepassword'; // Replace with your password

// Route to fetch Excel data if the password is correct
app.post('/get-data', async (req, res) => {
    const { password } = req.body;

    console.log('Password received:', password);

    if (password !== correctPassword) {
        console.log('Invalid password');
        return res.status(403).json({ error: 'Invalid password' });
    }

    const filePath = path.join(__dirname, 'public', 'SearchDatas.xlsx');

    if (!fs.existsSync(filePath)) {
        console.log('File not found:', filePath);
        return res.status(404).json({ error: 'File not found' });
    }

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
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
    } catch (error) {
        console.error('Error reading Excel file:', error);
        res.status(500).json({ error: 'Failed to read Excel file' });
    }
});

// Default route to serve the main page (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
