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

module.exports = router