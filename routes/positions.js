const express = require('express')
const router = express.Router()
const Position = require('../models/position');

//Getting all
router.get('/', async (req, res) => {
    try {
        const pos = await Position.find()
        res.json(pos)
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
router.post('/', getDuplicates, async (req, res) => {
    //Check position name if it exists
    if (res.pos) {
        return res.status(409).json({ message: 'Duplicate position' })
    }
    const pos = new Position({
        name: req.body.name
    })
    try {
        const newPos = await pos.save()
        res.status(201).json(newPos)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

//Deleting one
router.delete('/:id', getPosition, async (req, res) => {
    try {
        await res.pos.deleteOne()
        res.json({ message: 'Position removed' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Update one
router.patch('/:id', getPosition, async (req, res) => {
    if (req.body.name != null) {
        res.pos.name = req.body.name
    }
    try {
        const newPos = await res.pos.save()
        res.json(newPos)
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

async function getPosition(req, res, next) {
    let pos
    try {
        pos = await Position.findById(req.params.id)
        if (pos == null)
            return res.status(404).json({ message: 'Cannot find position' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.pos = pos
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