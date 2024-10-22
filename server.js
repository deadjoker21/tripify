const express = require('express');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const ExcelJS = require('exceljs');
const fs = require('fs');

const app = express();

// Directly embed the Google Cloud credentials
const credentials = {
project_id: "booming-order-318218",
 client_email : "vercel-access@booming-order-318218.iam.gserviceaccount.com",
private_key: "-----BEGIN PRIVATE KEY-----MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDHIlTIGAB1UmDyL+qwp3ir+oXsMsHMXTaWEIn+Yw6d1ZsoRZEEnt9sdVlSOqSlpO+KJOuGhvIAeTXOfZXTbWeg8wJN7rsWIY7sJWSAwTFM5iqX/KG4OYo807dy4HriFqTtoVCM4kyKZvCTJXyB5xqAzsGZsqXhDbb3nkTZG8vhuCHCAHtXdVhLZE7WnMlQSnSlwVZdqlhMRFVj67MjtjOuCXEwSasyblSMHl1+E1WrhNB4iz5FZH1jdXcmJ0h1ofQk6Ln+7asuqf/E+fHXoXF9IQVwP2hELqAzuZXMe0vuvnA++pi623ZKqJgm1AZP0XGj1tdeUIXEEsWkROz8TfxPAgMBAAECggEAHanyPJHBamNd0wtq8pXVVrPNxLnAP36YkGeLpubVWT27YexlsJfaFdYFUEfcGbDQM3anKeBq/GxnT4igYQvTJsQMe9TW7x0LUAeMnoF+TpjwOg6Ffg6plmto0HwQJ3h9aR4MBHCm5kHKD0wY7WD32b2dqWpWEN3He8Df5gJLWibyqaJQEZFjPf/1of46e5JzwiOwq6LFNOTcSxNhVCY/XQwGPIiO6Xeayvr1AGBFSM8myhp/YXRLBBKLxdH+jiqNQc+h1gmTrLaZRuulEtgBfJiRwlDZ24pOlGKOaaMMKfMre6xpCc2m/adbqS6XJYDN576rt1YKVS7mL6REEANLAQKBgQD/7ZUD3drVmCJEqlIb4/e4TZ+d+BxcOBidINHKObib/grg4RzN4irwIVuDKoyUGWo9NWcbZbf4m/IAOHCqHriDp+qcUdxH5I34XcUWUwihUjrwdApCZFxfDXG0qMr9avnCxEX2qFJWs7AH58IPe6EQaPY2C4+mm40d0zl7EsL9/wKBgQDHMKlyVqwTZMlkQbpNXf+uTvxgPMRvZV7x0CapJ1O4L8z4RmVqF4Wj+215LmWsJRzA5CXGiZF61xnhRtuidgABeIds5MeSHW/ab4naXmyBlvNpPZcTOovaZGpZgytvP79cU0Ud9Wklcl913rkCZjI/lMCnLe0XXUi7OXNCHEGhsQKBgQDa7GPFK/lvLzVZIY0dWJPmL1hz6/JunHnJp3JuF5QotFaf6VEXePmb8hzzBem9IkRz2YO6tvd5jgSkVaNikubpkDEryQay5Prg022tXBgMz2elms3P30P492olzSHfR6whBH6IsZHFou3YxVKGpg2wGOlMb/VQ4s0DD1WjRvhQBwKBgQCzkvhAH0k0lrlFDEhz9VlLAORfsoj5UG9fG2OvPcgpFdb4wSYulhQiOMqB5EU/A5o/f69apK0mDIPFZ4ccmLr6mHmmvz34SVeMmt+xoUy7K6Y365GmgTKR6dNC7ZEb02GmT1/RWWy4mLrc3bT3J8EHNwjT7wB+/tdSCsIRCL5WkQKBgQCyoWQYYlxBmzniitR5B1Yp8HWbY40Xjdl3KbyElcclkR4fql6MZm35jyynAwcMJxXRoCbbK7DBt+CKC97HoYpqM+HWPcaH364nCTqbTB8K3OpgTatvCtKwJaYVufrGPSkVkxAcTCzbvUI2kr1jXjIANxrT94BXXH0TW6WXg7cnFw==-----END PRIVATE KEY-----"
};

const storage = new Storage({
  projectId: credentials.project_id,
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key,
  },
});

// Define your bucket and file
const bucketName = 'your-bucket-name';
const fileName = 'SearchData.xlsx';

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
