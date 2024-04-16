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
    //Check school name if it exists
    const lr = new LR({
        date: req.body.date,
        ors_burs_no: req.body.ors_burs_no,
        particulars: req.body.particulars,
        amount: req.body.amount,
        claimant: req.body.claimant,
        sds: req.body.sds,
        head_accounting: req.body.head_accounting
    })
    try {
        const newLR = await lr.save()
        res.status(201).json(newLR)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

module.exports = router
