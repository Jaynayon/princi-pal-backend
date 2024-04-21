const express = require('express')
const mongoose = require('mongoose');
const router = express.Router()
const RCD = require('../models/rcd')
const Document = require('../models/document')

//Get all RCDs
router.get('/', async (req, res) => {
    try {
        const RCDs = await RCD.find();
        res.json(RCDs)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Creating one
router.post('/', getDocument, async (req, res) => {
    const { doc_id, date, ors_burs_no, respo_code, payee, uacs_obj_code, nature_payment, amount, disbursing_officer } = req.body;

    // Validate required fields
    if (!doc_id || !date || !ors_burs_no || !respo_code || !payee || !uacs_obj_code || !nature_payment || !disbursing_officer ||
        amount === undefined || amount === null
    ) {
        return res.status(400).json({ message: 'docId, date, ors_burs_no, respo_code, payee, uacs_obj_code, nature_payment, and amount are required' });
    }

    // Validate amount fields (debit and credit must be valid numbers)
    if (isNaN(amount) || typeof amount !== 'number') {
        return res.status(400).json({ message: 'Amount must be a valid number' });
    }

    // Create a new LR document 
    const rcd = new RCD({
        document: res.doc,
        date,
        ors_burs_no,
        respo_code,
        payee,
        uacs_obj_code,
        nature_payment,
        amount,
        disbursing_officer
    });
    try {
        //first save the lr to get the entire sum
        const newRCD = await rcd.save()

        //calculate budget status
        await calculateBudgetLimitStatus(res)

        res.status(201).json(newRCD)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

//Update one
router.patch('/:id', getRCD, getDocumentByRcd, async (req, res) => {
    if (req.body.date != null) {
        res.rcd.date = req.body.date
    }
    if (req.body.ors_burs_no != null) {
        res.rcd.ors_burs_no = req.body.ors_burs_no
    }
    if (req.body.respo_code != null) {
        res.rcd.respo_code = req.body.respo_code
    }
    if (req.body.payee != null) {
        res.rcd.payee = req.body.payee
    }
    if (req.body.uacs_obj_code != null) {
        res.rcd.uacs_obj_code = req.body.uacs_obj_code
    }
    if (req.body.nature_payment != null) {
        res.rcd.nature_payment = req.body.nature_payment
    }
    if (req.body.amount != null) {
        res.rcd.amount = req.body.amount
    }
    if (req.body.disbursing_officer != null) {
        res.rcd.disbursing_officer = req.body.disbursing_officer
    }
    try {
        const newRcd = await res.rcd.save()

        //calculate budget status
        await calculateBudgetLimitStatus(res)

        res.json(newRcd)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Deleting one
router.delete('/:id', getRCD, getDocumentByRcd, async (req, res) => {
    try {
        await res.rcd.deleteOne()

        //calculate budget status
        await calculateBudgetLimitStatus(res)

        res.json({ message: 'RCD removed' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


//Middleware
async function getRCD(req, res, next) {
    let rcd
    try {
        rcd = await RCD.findById(req.params.id)
        if (rcd == null)
            return res.status(404).json({ message: 'Cannot find RCD' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.rcd = rcd
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

async function getDocumentByRcd(req, res, next) {
    let doc
    const docId = res.rcd.document
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
        const rcdEntries = await RCD.find({ document: res.doc._id })
            .select('-document') //we need the id to be used as keys

        //get the sum on the amount property
        const amountSum = rcdEntries.reduce((total, rcd) => total + rcd.amount, 0);

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

module.exports = router
