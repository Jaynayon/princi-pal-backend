console.log('testing check')
var XLSX = require("xlsx");
var workbook = XLSX.readFile("templates/file_temp.xlsx");
let worksheet = workbook.Sheets[workbook.SheetNames[0]];
const XlsxPopulate = require('xlsx-populate');
//Use needed models to fetch data

//Data must be in an array even if it's a single data to access foreach
const data = { //set of data to insert
    date: '11/11/2023',
    ors_burs_no: "SI# 2056",
    particulars: "TINONGS FOOD INTRNL- Purchased torta bread (small) for District Meet",
    amount: 3124
}

const dataToWrite = Array(40).fill(data) //duplicate data
const schoolName = 'Jaclupan' //for file naming

//NOTE: Validation occurs in the route, if data is 0, the it is validated in the route
//Dagdag feature kay if ever daghan ang data dapat automatic mo create og new sheet referencing the sum from the previous sheet

//This function starts populating rows in a certain index
const insertLRData = (dataToWrite, schoolName) => {
    XlsxPopulate.fromFileAsync("templates/LR-2024.xlsx")
        .then(workbook => {
            const worksheet = workbook.sheet(0); // Assuming data is in the first sheet 

            let rowIndex = 13; // Start from row 13

            // Populate or change the value of a certain cell
            worksheet.cell('B9').value(2);

            // Write values to specific cells and retain cell styling
            dataToWrite.forEach(data => {
                // Writing values to respective cells
                worksheet.cell(`B${rowIndex}`).value(data.date);
                worksheet.cell(`C${rowIndex}`).value(data.ors_burs_no);
                worksheet.cell(`D${rowIndex}`).value(data.particulars);
                worksheet.cell(`E${rowIndex}`).value(data.amount);

                rowIndex++; // Move to the next row for the next set of data
            });

            // Save the workbook to a new file
            return workbook.toFileAsync(`output/${schoolName}_LR-2024.xlsx`, { force: true }); //overwrites the file if exists
        })
        .then(() => {
            console.log("Values written to Excel file.");
        })
        .catch(error => {
            console.error(error);
        });
}

//insertLRData(dataToWrite, schoolName)






/*
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Serve the Excel file
app.get('/download', (req, res) => {
    const filePath = path.join(__dirname, 'output', 'modified_file_temp.xlsx');
    res.download(filePath, 'modified_file_temp.xlsx', (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(500).send('Error downloading file');
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
*/