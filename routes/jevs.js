const express = require('express')
const mongoose = require('mongoose');
const router = express.Router()
const JEV = require('../models/jev')
const Document = require('../models/document')

//Get all JEVs
router.get('/', async (req, res) => {
    try {
        const JEVs = await JEV.find();
        res.json(JEVs)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Creating one
router.post('/', getDocument, async (req, res) => {
    const { doc_id, respo_center, account_explanation, uacs_obj_code, debit, credit } = req.body;

    // Validate required fields
    if (!doc_id || !respo_center || !account_explanation || !uacs_obj_code ||
        debit === undefined || debit === null || credit === undefined || credit === null
    ) {
        return res.status(400).json({ message: 'docId, espo_center, account_explanation, uacs_obj_code, debit, and credit are required' });
    }

    // Validate amount fields (debit and credit must be valid numbers)
    if (isNaN(debit) || typeof debit !== 'number' || isNaN(credit) || typeof credit !== 'number') {
        return res.status(400).json({ message: 'Debit and credit must be valid numbers' });
    }

    // Create a new LR document 
    const jev = new JEV({
        document: res.doc,
        respo_center,
        account_explanation,
        uacs_obj_code,
        debit,
        credit
    });
    try {
        //first save the lr to get the entire sum
        const newJEV = await jev.save()

        //calculate budget status
        await calculateBudgetLimitStatus(res)

        res.status(201).json(newJEV)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

//Creating one
router.post('/initialize', getDocument, async (req, res) => {
    const { doc_id } = req.body;

    // Validate required fields
    if (!doc_id) {
        return res.status(400).json({ message: 'docId is required' });
    }

    // Predefined objects to be added to JEV
    const predefinedObjects = [
        {
            respo_center: '',
            account_explanation: 'Communication Expenses: Mobile',
            uacs_obj_code: '5020502001',
            debit: 0,
            credit: 0
        },
        {
            respo_center: '',
            account_explanation: 'Electricity Expenses',
            uacs_obj_code: '5020402000',
            debit: 0,
            credit: 0
        },
        {
            respo_center: '',
            account_explanation: 'Internet Subscription Expenses',
            uacs_obj_code: '5020503000',
            debit: 0,
            credit: 0,
        },
        {
            respo_center: '',
            account_explanation: ' Transpo/Delivery Expenses',
            uacs_obj_code: '5029904000',
            debit: 0,
            credit: 0
        },
        {
            respo_center: '',
            account_explanation: 'Training Expenses',
            uacs_obj_code: '5020201000',
            debit: 5000,
            credit: 0
        },
        {
            respo_center: '',
            account_explanation: 'R & M -School Buildings',
            uacs_obj_code: '5021304002',
            debit: 0,
            credit: 0
        },
        {
            respo_center: '',
            account_explanation: 'Other Suplies & Materials Expenses',
            uacs_obj_code: '5020399000',
            debit: 0,
            credit: 0
        },
        {
            respo_center: '',
            account_explanation: 'Advances to Operating Expenses',
            uacs_obj_code: '1990101000',
            debit: 0,
            credit: 0
        }
    ];
    try {
        // Insert predefined objects into JEV collection
        const insertedJEVs = await JEV.insertMany(predefinedObjects.map(obj => ({ document: res.doc, ...obj })));

        res.status(201).json(insertedJEVs)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

//Update one
router.patch('/:id', getJEV, getDocumentByJev, async (req, res) => {
    if (req.body.respo_center != null) {
        res.jev.respo_center = req.body.respo_center
    }
    if (req.body.account_explanation != null) {
        res.jev.account_explanation = req.body.account_explanation
    }
    if (req.body.uacs_obj_code != null) {
        res.jev.uacs_obj_code = req.body.uacs_obj_code
    }
    if (req.body.debit != null) {
        res.jev.debit = req.body.debit
    }
    if (req.body.credit != null) {
        res.jev.credit = req.body.credit
    }
    if (req.body.prepared_by != null) {
        res.jev.prepared_by = req.body.prepared_by
    }
    if (req.body.certified_cor != null) {
        res.jev.certified_cor = req.body.certified_cor
    }
    try {
        const newJev = await res.jev.save()

        //calculate budget status
        await calculateBudgetLimitStatus(res)

        res.json(newJev)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Deleting one
router.delete('/:id', getJEV, getDocumentByJev, async (req, res) => {
    try {
        await res.jev.deleteOne()

        //calculate budget status
        await calculateBudgetLimitStatus(res)

        res.json({ message: 'JEV removed' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


//Middleware
async function getJEV(req, res, next) {
    let jev
    try {
        jev = await JEV.findById(req.params.id)
        if (jev == null)
            return res.status(404).json({ message: 'Cannot find LR' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.jev = jev
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

async function getDocumentByJev(req, res, next) {
    let doc
    const docId = res.jev.document
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
        const jevEntries = await JEV.find({ document: res.doc._id })
            .select('-document') //we need the id to be used as keys

        //get the sum on the amount property
        const amountSum = jevEntries.reduce((total, jev) => total + jev.credit + jev.debit, 0);

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
