const express = require('express')
const router = express.Router()
const UACS = require('../models/UACS');

//Getting all
router.get('/', async (req, res) => {
    try {
        const uacs = await UACS.find()
        res.json(uacs)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Getting one
router.get('/:name', getUacsByName, async (req, res) => {
    try {
        console.log(res.uacs)
        res.send(res.uacs)
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
router.post('/', getDuplicates, async (req, res) => {
    //Check position name if it exists
    if (res.uacs) {
        return res.status(409).json({ message: 'Duplicate uacs' })
    }
    const uacs = new UACS({
        account_explanation: req.body.account_explanation,
        uacs_obj_code: req.body.uacs_obj_code
    })
    try {
        const newUacs = await uacs.save()
        res.status(201).json(newUacs)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

//Deleting one
router.delete('/:id', getUacs, async (req, res) => {
    try {
        await res.uacs.deleteOne()
        res.json({ message: 'Uacs removed' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Update one
router.patch('/:id', getUacs, async (req, res) => {
    if (req.body.uacs_obj_code != null) {
        res.uacs.uacs_obj_code = req.body.uacs_obj_code
    }
    if (req.body.account_explanation != null) {
        res.uacs.account_explanation = req.body.account_explanation
    }
    try {
        const newUacs = await res.uacs.save()
        res.json(newUacs)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


//Middleware
async function getDuplicates(req, res, next) {
    let uacs
    try {
        uacs = await UACS.findOne({ uacs_obj_code: req.body.uacs_obj_code })
        if (uacs) {
            return res.status(409).json({ message: 'Uacs already exists' })
        }
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    //Creates the object user
    res.uacs = uacs;
    next()//proceeds to the next function
}

async function getUacs(req, res, next) {
    let uacs
    try {
        uacs = await UACS.findById(req.params.id)
        if (uacs == null)
            return res.status(404).json({ message: 'Cannot find Uacs' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.uacs = uacs
    next()
}

async function getUacsByName(req, res, next) {
    let uacs
    try {
        uacs = await UACS.findOne({ name: req.params.name })
        if (uacs == null)
            return res.status(404).json({ message: 'Cannot find Uacs' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.uacs = uacs
    next()
}

module.exports = router