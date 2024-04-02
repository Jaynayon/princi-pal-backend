const express = require('express')
const router = express.Router()
const School = require('../models/school')

//Getting all
router.get('/', async (req, res) => {
    try {
        const school = await School.find()
        res.json(school)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Check school name if it exists

//Creating one
router.post('/', async (req, res) => {
    const school = new School({
        name: req.body.name
    })
    try {
        const newSchool = await school.save()
        res.status(201).json(newSchool)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

module.exports = router