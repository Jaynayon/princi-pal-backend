const express = require('express')
const router = express.Router()
const Role = require('../models/role');

//Getting all
router.get('/', async (req, res) => {
    try {
        const role = await Role.find()
        res.json(role)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Creating one
router.post('/', getDuplicates, async (req, res) => {
    //Check position name if it exists
    if (res.role) {
        return res.status(409).json({ message: 'Duplicate role' })
    }
    const role = new Role({
        name: req.body.name
    })
    try {
        const newRole = await role.save()
        res.status(201).json(newRole)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

//Deleting one
router.delete('/:id', getPosition, async (req, res) => {
    try {
        await res.role.deleteOne()
        res.json({ message: 'Role removed' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Update one
router.patch('/:id', getPosition, async (req, res) => {
    if (req.body.name != null) {
        res.role.name = req.body.name
    }
    try {
        const newRole = await res.role.save()
        res.json(newRole)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


//Middleware
async function getDuplicates(req, res, next) {
    let role
    try {
        role = await Role.findOne({ name: req.body.name })
        if (role) {
            return res.status(409).json({ message: 'Role already exists' })
        }
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    //Creates the object user
    res.role = role;
    next()//proceeds to the next function
}

async function getPosition(req, res, next) {
    let role
    try {
        role = await Role.findById(req.params.id)
        if (role == null)
            return res.status(404).json({ message: 'Cannot find role' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.role = role
    next()
}

module.exports = router