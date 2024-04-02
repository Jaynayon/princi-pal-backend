console.log('testing check')
var XLSX = require("xlsx");
var workbook = XLSX.readFile("templates/file_temp.xlsx");

let worksheet = workbook.Sheets[workbook.SheetNames[0]];

/*for (let index = 2; index < 7; index++) {
    const id = worksheet[`A${index}`].v;
    const name = worksheet[`B${index}`].v;

    console.log({
        id: id, name: name
    })
}*/
/*
// Define the values to write
const dataToWrite = [
    { id: 1, name: "John2" },
    { id: 2, name: "Alice2" },
    { id: 3, name: "Bob2" },
    { id: 4, name: "Emma2" },
    { id: 5, name: "James2" }
];

// Write values to specific cells
dataToWrite.forEach((data, index) => {
    const rowIndex = index + 2; // Start from row 2
    worksheet[`A${rowIndex}`] = { t: 'n', v: data.id }; // Writing numeric value
    worksheet[`B${rowIndex}`] = { t: 's', v: data.name }; // Writing string value
});

// Write the modified worksheet back to the workbook
const newWorkbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWorkbook, worksheet, workbook.SheetNames[0]);

// Save the workbook to a new file
const outputPath = 'output/modified_file_temp.xlsx';
XLSX.writeFile(newWorkbook, outputPath);

console.log(`Values written to Excel file: ${outputPath}`);
*/

const XlsxPopulate = require('xlsx-populate');

/*
XlsxPopulate.fromFileAsync("templates/file_temp.xlsx")
    .then(workbook => {
        const worksheet = workbook.sheet(0); // Assuming data is in the first sheet

        const dataToWrite = [
            { id: 1, name: "John" },
            { id: 2, name: "Alice" },
            { id: 3, name: "Bob" },
            { id: 4, name: "Emma" },
            { id: 5, name: "James" }
        ];

        // Write values to specific cells and retain cell styling
        dataToWrite.forEach((data, index) => {
            const rowIndex = index + 2; // Start from row 2

            // Writing numeric value
            worksheet.cell(`A${rowIndex}`).value(data.id);

            // Writing string value
            worksheet.cell(`B${rowIndex}`).value(data.name);
        });

        // Save the workbook to a new file
        return workbook.toFileAsync('output/modified_file_temp.xlsx');
    })
    .then(() => {
        console.log("Values written to Excel file.");
    })
    .catch(error => {
        console.error(error);
    });
    */


/*
//This function changes the value of a certain cell
const filename = "templates/file_temp.xlsx";

XlsxPopulate.fromFileAsync(filename)
    .then(workbook => {
        const worksheet = workbook.sheet(0); // Assuming data is in the first sheet

        // Populate or change the value of a certain cell
        const cellAddress = 'C3'; // Example: Change value in cell C3
        worksheet.cell(cellAddress).value('New Value');

        // Save the workbook
        return workbook.toFileAsync(filename);
    })
    .then(() => {
        console.log("Value changed in Excel file.");
    })
    .catch(error => {
        console.error(error);
    });
*/

/*
//This function starts populating rows in a certain index and inserts a row after each data.
XlsxPopulate.fromFileAsync("templates/file_temp.xlsx")
    .then(workbook => {
        const worksheet = workbook.sheet(0); // Assuming data is in the first sheet

        const dataToWrite = [
            { id: 1, name: "John" },
            { id: 2, name: "Alice" },
            { id: 3, name: "Bob" },
            { id: 4, name: "Emma" },
            { id: 5, name: "James" }
        ];

        let rowIndex = 5; // Start from row 5

        // Write values to specific cells and retain cell styling
        dataToWrite.forEach((data, index) => {
            // Writing numeric value
            worksheet.cell(`A${rowIndex}`).value(data.id);

            // Writing string value
            worksheet.cell(`B${rowIndex}`).value(data.name);

            rowIndex++; // Move to the next row for the next set of data 
        });

        // Save the workbook to a new file
        return workbook.toFileAsync('output/modified_file_temp.xlsx', { force: true }); //overwrites the file if exists
    })
    .then(() => {
        console.log("Values written to Excel file.");
    })
    .catch(error => {
        console.error(error);
    });
*/

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