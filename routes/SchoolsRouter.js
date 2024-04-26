const express = require('express')
const mongoose = require('mongoose');
const router = express.Router()
const School = require('../models/school')
const Association = require('../models/association');
const Notifications = require('../models/notification')

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

// Getting all schools with associations
router.get('/:name', getSchoolByName, async (req, res) => {
    try {
        const school = await School.findById(res.school._id).select('-users'); // Exclude the 'users' field

        // Find associations for the current school
        const associations = await Association.find({ school: school._id })
            .select('-school -_id -__v')
            .populate({
                path: 'user',
                select: '-password -_id -__v',
                populate: {
                    path: 'position',
                    select: '-_id -__v'
                }
            });

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
        }));

        // Create a modified school object with the users
        const modifiedSchool = {
            ...school.toObject(), // Convert Mongoose document to plain JavaScript object
            users: formattedUsers
        };


        res.json(modifiedSchool);
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
router.delete('/:id', getSchool, getAssociation, async (req, res) => {
    const associations = res.assoc
    try {
        // Convert single association object to an array if needed
        if (!Array.isArray(associations) && associations) {
            associations = [associations]; // Convert single association to an array
        }

        // Check if associations exist and are not empty
        if (associations && associations.length > 0) {
            // Collect all assoc_ids from associations for filtering notifications
            const assocIds = associations.map(assoc => assoc._id);

            // Delete notifications associated with the collected assoc_ids
            const deleteNotificationsResult = await Notifications.deleteMany({ assoc: { $in: assocIds } });
        }

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

async function getSchoolByName(req, res, next) {
    let school
    try {
        school = await School.findOne({ name: req.params.name })
        if (!school) {
            return res.status(404).json({ message: 'School doesnt exists' })
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

async function getAssociation(req, res, next) {
    const schoolId = res.school._id

    if (!mongoose.isValidObjectId(schoolId)) {
        return res.status(400).json({ message: 'Invalid school ID format' });
    }

    try {
        const assoc = await Association.find({ school: schoolId });
        res.assoc = assoc; // Attach user object to response
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = router