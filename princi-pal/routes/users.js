const express = require('express')
const router = express.Router()
const User = require('../models/user')

//Getting all
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Getting one
router.get('/:id', getUser, (req, res) => {
    res.send(res.user)
})

//Creating one
router.post('/', async (req, res) => {
    const user = new User({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
        phone: req.body.phone
    })
    try {
        const newUser = await user.save()
        res.status(201).json(newUser)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

//Updating one
router.patch('/:id', getUser, async (req, res) => {
    if (req.body.name != null) {
        res.user.name = req.body.name
    }
    if (req.body.password != null) {
        res.user.password = req.body.password
    }
    if (req.body.email != null) {
        res.user.email = req.body.email
    }
    if (req.body.phone != null) {
        res.user.phone = req.body.phone
    }
    try {
        const newUser = await res.user.save()
        res.json(newUser)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})


//Deleting one
router.delete('/:id', getUser, async (req, res) => {
    try {
        await res.user.deleteOne()
        res.json({ message: 'User removed' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Getting data from user using email
router.get('/email/:email', getUserByEmail, async (req, res) => {
    //check if email exists
    try {
        res.json(res.user)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

//Middleware
async function getUser(req, res, next) {
    let user
    try {
        user = await User.findById(req.params.id)
        if (user == null)
            return res.status(404).json({ message: 'Cannot find user' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
    //Creates the object user
    res.user = user
    next() //proceeds to the next function
}

async function getUserByEmail(req, res, next) {
    let user
    try {
        user = await User.findOne({ email: req.params.email })
        if (user == null)
            return res.status(404).json({ message: 'Cannot find user with that email' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
    //Creates the object user
    res.user = user
    next() //proceeds to the next function
}

module.exports = router