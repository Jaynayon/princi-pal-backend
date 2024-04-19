const express = require('express')
const router = express.Router()
const Document = require('../models/document');
const LR = require('../models/lr');

//Getting all
router.get('/', async (req, res) => {
    try {
        const documents = await Document.find()
            .select('-__v')
        const modifiedDocuments = await Promise.all(documents.map(async (doc) => {
            const lrEntries = await LR.find({ document: doc._id })
                .select('-_id -__v -document')

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
})

//Getting one
router.get('/:name', getPositionByName, async (req, res) => {
    try {
        console.log(res.pos)
        res.send(res.pos)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

/*
// Getting one
router.get('/:name', async (req, res, next) => {
    await getUserByEmail(req, res, next, { params: true });
}, (req, res) => {
    try {
        res.send(res.user);
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
});*/


//Creating one
router.post('/', async (req, res) => {
    const { month, year, budget, budget_limit, sds, claimant, head_accounting } = req.body;

    // Validate required fields
    if (!month || !year || !budget || !budget_limit || !sds || !claimant || !head_accounting) {
        return res.status(400).json({ message: 'Month, year, budget, budget_limit, SDS, claimant, and head_accounting are required' });
    }

    /*// Validate budget and budget_limit fields (must be numbers)
    if (isNaN(budget) || isNaN(budget_limit) || typeof budget !== 'number' || typeof budget_limit !== 'number') {
        return res.status(400).json({ message: 'Budget and budget_limit must be valid numbers' });
    }*/

    // Create a new pos document
    const doc = new Document({
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

//Deleting one
router.delete('/:id', getDocument, async (req, res) => {
    try {
        await res.doc.deleteOne()
        res.json({ message: 'Document removed' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Update one
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
async function getDuplicates(req, res, next) {
    let pos
    try {
        pos = await Position.findOne({ name: req.body.name })
        if (pos) {
            return res.status(409).json({ message: 'Position already exists' })
        }
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    //Creates the object user
    res.pos = pos;
    next()//proceeds to the next function
}

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

async function getPositionByName(req, res, next) {
    let pos
    try {
        pos = await Position.findOne({ name: req.params.name })
        if (pos == null)
            return res.status(404).json({ message: 'Cannot find position' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.pos = pos
    next()
}

module.exports = router