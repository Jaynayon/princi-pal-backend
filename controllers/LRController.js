const mongoose = require('mongoose');
const LR = require('../models/lr')
const UACS = require('../models/UACS')
const Document = require('../models/document')

//Get all LRs
async function getAllLr(req, res) {
    try {
        const LRs = await LR.find();
        res.json(LRs)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

//Creating one
async function createLr(req, res) {
    const { doc_id, date, ors_burs_no, particulars, amount, payee, uacs_obj_code, nature_of_payment } = req.body;

    // Validate required fields
    if (!doc_id || !date || !ors_burs_no || !particulars || !payee || !uacs_obj_code || !nature_of_payment || amount === undefined || amount === null) {
        return res.status(400).json({ message: 'docId, Date, ORS/BURS number, particulars, amount, payee, uacs_obj_code, and nature_of_payment are required' });
    }

    // Validate amount field (must be a number)
    if (isNaN(amount) || typeof amount !== 'number') {
        return res.status(400).json({ message: 'Amount must be a valid number' });
    }

    // Create a new LR document 
    const lr = new LR({
        document: res.doc,
        date,
        ors_burs_no,
        particulars,
        amount,
        payee,
        uacs: res.uacs,
        nature_of_payment
    });
    try {
        //first save the lr to get the entire sum
        const newLR = await lr.save()

        //calculate budget status
        await calculateBudgetLimitStatus(res)

        res.status(201).json(newLR)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

//Update one
async function patchLr(req, res) {
    if (req.body.date != null) {
        res.lr.date = req.body.date
    }
    if (req.body.ors_burs_no != null) {
        res.lr.ors_burs_no = req.body.ors_burs_no
    }
    if (req.body.particulars != null) {
        res.lr.particulars = req.body.particulars
    }
    if (req.body.amount != null) {
        res.lr.amount = req.body.amount
    }
    try {
        const newLr = await res.lr.save()

        //calculate budget status
        await calculateBudgetLimitStatus(res)

        res.json(newLr)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

//Deleting one
async function deleteLr(req, res) {
    try {
        await res.lr.deleteOne()

        //calculate budget status
        await calculateBudgetLimitStatus(res)

        res.json({ message: 'LR removed' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

//Middleware
async function getLR(req, res, next) {
    let lr
    try {
        lr = await LR.findById(req.params.id)
        if (lr == null)
            return res.status(404).json({ message: 'Cannot find LR' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.lr = lr
    next()
}

async function getUacs(req, res, next) {
    let aucs
    try {
        aucs = await UACS.findOne({ uacs_obj_code: req.body.uacs_obj_code })
        if (aucs == null)
            return res.status(404).json({ message: 'Cannot find Uacs or invalid Uacs code' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.uacs = aucs
    next()
}

async function getDocument(req, res, next) {
    let doc
    const docId = req.body.doc_id
    if (!mongoose.isValidObjectId(docId)) {
        return res.status(400).json({ message: 'Invalid Document ID format' });
    }
    try {
        doc = await Document.findById(docId)
        if (doc == null)
            return res.status(404).json({ message: 'Cannot find Document' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.doc = doc
    next()
}

async function getDocumentByLr(req, res, next) {
    let doc
    const docId = res.lr.document
    if (!mongoose.isValidObjectId(docId)) {
        return res.status(400).json({ message: 'Invalid Doc ID format' });
    }
    try {
        doc = await Document.findById(docId)
        if (doc == null)
            return res.status(404).json({ message: 'Cannot find Document' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.doc = doc
    next()
}

async function calculateBudgetLimitStatus(res) {
    try {
        const lrEntries = await LR.find({ document: res.doc._id })
            .select('-document') //we need the id to be used as keys

        //get the sum on the amount property
        const amountSum = lrEntries.reduce((total, lr) => total + lr.amount, 0);

        // Check if the sum exceeds the budget_limit
        if (amountSum > res.doc.budget_limit) {
            res.doc.budget_exceeded = true;
        } else {
            res.doc.budget_exceeded = false;
        }

        const updatedDoc = await res.doc.save()
    } catch (err) {
        // Handle any errors
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = {
    getAllLr,
    createLr,
    patchLr,
    deleteLr,
    getLR,
    getUacs,
    getDocument,
    getDocumentByLr
}
