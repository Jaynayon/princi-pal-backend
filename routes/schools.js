const express = require('express')
const router = express.Router()
const School = require('../models/school')
const Association = require('../models/association');

// Getting all schools with associations
router.get('/', async (req, res) => {
    try {
        const schools = await School.find().select('-users'); // Exclude the 'users' field

        const modifiedSchools = await Promise.all(schools.map(async (school) => {
            // Find association for the current school
            const associations = await Association.find({ school: school._id })
                .select('-school -_id -__v')
                .populate({
                    path: 'user',
                    select: '-password -_id -__v',
                    populate: {
                        path: 'position',
                        select: '-_id -__v'
                    }
                })

            const formattedUsers = associations.map(association => ({
                fname: association.user.fname,
                mname: association.user.mname,
                lname: association.user.lname,
                username: association.user.username,
                email: association.user.email,
                position: association.user.position ? association.user.position.name : null,
                approved: association.approved,
                invitation: association.invitation,
                admin: association.admin
            }))

            // Create a modified school object with the association
            return {
                ...school.toObject(), // Convert Mongoose document to plain JavaScript object
                users: formattedUsers
            };
        }));

        res.json(modifiedSchools);
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ message: 'Internal server error' });
    }
});


//Creating one
router.post('/', getDuplicates, async (req, res) => {
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

//Deleting one along with its associations
router.delete('/:id', getSchool, async (req, res) => {
    try {
        //Delete user associations
        const result = await Association.deleteMany({
            school: res.school._id// Filter by school id
        });

        await res.school.deleteOne() // Delete school

        res.json({ message: `School removed, along with ${result.deletedCount} association(s)` })
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