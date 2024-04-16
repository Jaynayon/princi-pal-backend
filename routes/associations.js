const express = require('express')
const router = express.Router()
const Association = require('../models/association');

//Getting all
router.get('/', async (req, res) => {
    try {
        const assoc = await Association.find()
        res.json(assoc)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Getting one
router.get('/:name', getPositionByName, async (req, res) => {
    try {
        console.log(res.assoc)
        res.send(res.assoc)
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
    if (res.assoc) {
        return res.status(409).json({ message: 'Duplicate School Association' })
    }
    const assoc = new SchoolAssoc({
        name: req.body.name
    })
    try {
        const newAssoc = await assoc.save()
        res.status(201).json(newAssoc)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

//Deleting one
router.delete('/:id', getSchoolAssoc, async (req, res) => {
    try {
        await res.assoc.deleteOne()
        res.json({ message: 'School Association removed' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Update one
router.patch('/:id', getSchoolAssoc, async (req, res) => {
    if (req.body.name != null) {
        res.pos.name = req.body.name
    }
    try {
        const newAssoc = await res.assoc.save()
        res.json(newAssoc)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


//Middleware
async function getDuplicates(req, res, next) {
    let assoc
    try {
        assoc = await Association.findOne({ name: req.body.name })
        if (assoc) {
            return res.status(409).json({ message: 'School Association already exists' })
        }
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    //Creates the object user
    res.assoc = assoc;
    next()//proceeds to the next function
}

async function getSchoolAssoc(req, res, next) {
    let assoc
    try {
        assoc = await Association.findById(req.params.id)
        if (assoc == null)
            return res.status(404).json({ message: 'Cannot find School Association' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.assoc = assoc
    next()
}

async function getPositionByName(req, res, next) {
    let assoc
    try {
        assoc = await Association.findOne({ name: req.params.name })
        if (assoc == null)
            return res.status(404).json({ message: 'Cannot find School Association' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.assoc = assoc
    next()
}

module.exports = router