const express = require('express')
const mongoose = require('mongoose');
const router = express.Router()
var XLSX = require("xlsx");
const path = require('path');

const XlsxPopulate = require('xlsx-populate');
// Assuming exports.js is in the routes folder
const filePath = path.join(__dirname, '../templates/file_temp.xlsx');
const workbook = XLSX.readFile(filePath);

const LR = require('../models/lr')
const Document = require('../models/document')
const School = require('../models/School');

//Getting all
//Getting one LR based on a year and month
router.get('/lrs/schools/:year/:month', getSchool, async (req, res) => {
    try {
        const document = await Document.findOne({
            school: res.school._id,
            year: req.params.year,
            month: req.params.month
        }).select('-jev -rcd -cdr -__v')

        if (!document) {
            return res.status(404).json({ message: 'No document found for the specified school, year, and month' });
        }

        const dataToWrite = await LR.find({ document: document._id }) //we need the id to be used as keys. 
            .select('-document -__v -payee -uacs_obj_code -nature_of_payment')  //And only select required fields for LR

        // Call the function to insert LR data into Excel
        const schoolName = 'Jaclupan'; // For file naming

        insertLRData(dataToWrite, schoolName);

        res.send({ message: "File exported" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

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

//Middleware
// Middleware to get school based on schoolId
async function getSchool(req, res, next) {
    const schoolId = req.body.school_id;

    if (!mongoose.isValidObjectId(schoolId)) {
        return res.status(400).json({ message: 'Invalid school ID format' });
    }

    try {
        const school = await School.findById(schoolId);

        if (!school) {
            return res.status(404).json({ message: 'Cannot find school' });
        }

        // Attach only necessary properties of school to response
        res.school = {
            _id: school._id,
            name: school.name
        };

        next();
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

module.exports = router