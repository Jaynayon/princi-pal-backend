const express = require('express')
const router = express.Router()
const School = require('../models/school')
const User = require('../models/user');
const school = require('../models/school');

//Getting all
router.get('/', async (req, res) => {
    try {
        const school = await School.find().select('-users') //excludes the users
        res.json(school)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Get all users in school
router.get('/users/', async (req, res) => {
    try {
        const schools = await School.find().lean(); // Get all schools

        // Iterate through each school and populate the 'users' field
        for (const school of schools) {
            school.users = await User.find({ schools: school._id })// Find users with the current school's id
                .lean()
                .select('-schools');
        }

        res.json(schools); // Send populated schools array
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Get all users in a certain school
router.get('/:id/users', getSchool, async (req, res) => {
    try {
        const school = res.school.toObject() //converts to plain javascript object to prevent returning a reference

        // Find users associated with the school
        const users = await User.find({ schools: req.params.id })
            .lean()
            .select('-schools');

        // Assign the users to the school object
        school.users = users;

        // Send the school object with users as the response
        res.json(school);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


//Creating one
router.post('/', getDuplicates, async (req, res) => {
    //Check school name if it exists
    if (res.school) {
        return res.status(409).json({ message: 'Duplicate school' })
    }
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

//Deleting one
router.delete('/:id', getSchool, async (req, res) => {
    try {
        await res.school.deleteOne()
        res.json({ message: 'School removed' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Update one
router.patch('/:id', getSchool, async (req, res) => {
    if (req.body.name != null) {
        res.school.name = req.body.name
    }
    try {
        const newSchool = await res.school.save()
        res.json(newSchool)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Middleware
async function getDuplicates(req, res, next) {
    let school
    try {
        school = await School.findOne({ name: req.body.name })
        if (school) {
            return res.status(409).json({ message: 'School already exists' })
        }
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    //Creates the object user
    res.school = school;
    next()//proceeds to the next function
}

async function getSchool(req, res, next) {
    let school
    try {
        school = await School.findById(req.params.id)
        if (school == null)
            return res.status(404).json({ message: 'Cannot find school' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.school = school
    next()
}

module.exports = router