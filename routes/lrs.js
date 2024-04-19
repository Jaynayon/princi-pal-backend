const express = require('express')
const router = express.Router()
const LR = require('../models/lr')

//Get all LRs
router.get('/', async (req, res) => {
    try {
        const LRs = await LR.find();
        res.json(LRs)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Creating one
router.post('/', async (req, res) => {
    const { date, ors_burs_no, particulars, amount } = req.body;

    // Validate required fields
    if (!date || !ors_burs_no || !particulars || amount === undefined || amount === null) {
        return res.status(400).json({ message: 'Date, ORS/BURS number, particulars, and amount are required' });
    }

    // Validate amount field (must be a number)
    if (isNaN(amount) || typeof amount !== 'number') {
        return res.status(400).json({ message: 'Amount must be a valid number' });
    }

    // Create a new LR document
    const lr = new LR({
        date,
        ors_burs_no,
        particulars,
        amount
    });
    try {
        const newLR = await lr.save()
        res.status(201).json(newLR)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

//Update one
router.patch('/:id', getLR, async (req, res) => {
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
        res.json(newLr)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Deleting one
router.delete('/:id', getLR, async (req, res) => {
    try {
        await res.lr.deleteOne()
        res.json({ message: 'LR removed' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


//Middleware
async function getDuplicates(req, res, next) {
    let lr
    try {
        lr = await LR.findOne({ name: req.body.name })
        if (lr) {
            return res.status(409).json({ message: 'LR already exists' })
        }
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    //Creates the object user
    res.lr = lr;
    next()//proceeds to the next function
}

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

module.exports = router
