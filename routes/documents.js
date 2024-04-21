const express = require('express')
const mongoose = require('mongoose');
const router = express.Router()
const Document = require('../models/document');
const LR = require('../models/lr');
const School = require('../models/school');

/*//Getting all SHOULD NOT BE IMPLEMENTED
router.get('/', async (req, res) => {
    try {
        const documents = await Document.find()
            .select('-__v')
        const modifiedDocuments = await Promise.all(documents.map(async (doc) => {
            const lrEntries = await LR.find({ document: doc._id })
                .select('-__v -document') //we need the id to be used as keys

            const modifiedDocument = {
                ...doc.toObject(),
                lr: lrEntries
            }

            return modifiedDocument;
        }))

        res.json(modifiedDocuments)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})*/

//Getting one LR
router.get('/lrs/schools/:year/:month', getSchool, async (req, res) => {
    try {
        const document = await Document.findOne({
            school: res.school._id,
            year: req.params.year,
            month: req.params.month
        }).select('-__v')

        if (!document) {
            return res.status(404).json({ message: 'No document found for the specified school, year, and month' });
        }

        const lrEntries = await LR.find({ document: document._id })
            .select('-document -__v') //we need the id to be used as keys

        const amountSum = lrEntries.reduce((total, lr) => total + lr.amount, 0); //get the sum on the amount property

        const modifiedDocument = {
            ...document.toObject(),
            lr: lrEntries,
            sum: amountSum
        }
        res.send(modifiedDocument)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Getting LR entries based on a keyword (supports string and numeric properties)
router.get('/lrs/schools/:year/:month/:keyword', getSchool, async (req, res) => {
    try {
        const keyword = req.params.keyword;
        const document = await Document.findOne({
            school: res.school._id,
            year: req.params.year,
            month: req.params.month,
        }).select('-__v');

        if (!document) {
            return res.status(404).json({ message: 'No document found for the specified school, year, and month' });
        }

        // Create a regular expression pattern to match the keyword (case-insensitive)
        const regexPattern = new RegExp(keyword, 'i');

        // Find LR entries matching the keyword using $or for string and numeric properties
        const lrEntries = await LR.find({
            document: document._id,
            $or: [
                { date: { $regex: regexPattern } },  // Match date as string
                { ors_burs_no: { $regex: regexPattern } },  // Match ors_burs_no as string
                { particulars: { $regex: regexPattern } },  // Match particulars as string
                { amount: !isNaN(keyword) ? { $eq: parseInt(keyword) } : undefined } // Match amount as integer (use $eq for exact match)
                // Add more properties as needed
            ]
        }).select('-_id -document -__v');

        if (lrEntries.length === 0) {
            return res.status(404).json({ message: `No LR records found matching the keyword '${keyword}'` });
        }

        const modifiedDocument = {
            ...document.toObject(),
            lr: lrEntries
        };

        res.json(modifiedDocument);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//Creating one LR
router.post('/', getSchool, async (req, res) => {
    const { month, year, budget, budget_limit, sds, claimant, head_accounting } = req.body;

    // Validate required fields
    if (!month || !year || !budget || !budget_limit || !sds || !claimant || !head_accounting) {
        return res.status(400).json({ message: 'Month, year, budget, budget_limit, SDS, claimant, and head_accounting are required' });
    }

    // Create a new document
    const doc = new Document({
        school: res.school,
        month,
        year,
        budget,
        budget_limit,
        sds,
        claimant,
        head_accounting
    });
    try {
        const newDoc = await doc.save();
        res.status(201).json(newDoc);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//Deleting one Document
router.delete('/:id', getDocument, async (req, res) => {
    try {
        await res.doc.deleteOne()
        res.json({ message: 'Document removed' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Update one Document
router.patch('/:id', getDocument, async (req, res) => {
    if (req.body.budget != null) {
        res.doc.budget = req.body.budget
    }
    if (req.body.budget_limit != null) {
        res.doc.budget_limit = req.body.budget_limit
    }
    if (req.body.budget_exceeded != null) {
        res.doc.budget_exceeded = req.body.budget_exceeded
    }
    if (req.body.sds != null) {
        res.doc.sds = req.body.sds
    }
    if (req.body.claimant != null) {
        res.doc.claimant = req.body.claimant
    }
    if (req.body.head_accounting != null) {
        res.doc.head_accounting = req.body.head_accounting
    }
    try {
        const newDoc = await res.doc.save()
        res.json(newDoc)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


//Middleware
async function getDocument(req, res, next) {
    let doc
    try {
        doc = await Document.findById(req.params.id)
        if (doc == null)
            return res.status(404).json({ message: 'Cannot find document' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.doc = doc
    next()
}

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

async function calculateLRAmountSum(req, res, next) {
    const documentId = req.params.document_id; // Extract document ID from request parameters

    try {
        const lrEntries = await LR.find({ document: documentId }); // Find LR entries by document ID

        // Calculate sum of 'amount' property across LR entries
        const amountSum = lrEntries.reduce((total, lr) => total + lr.amount, 0);

        req.lrAmountSum = amountSum; // Attach calculated sum to request object

        next(); // Proceed to next middleware or route handler
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = router