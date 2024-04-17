const express = require('express')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const router = express.Router()
const User = require('../models/user')
const School = require('../models/school')
const Position = require('../models/position')
const Association = require('../models/association')

// Getting all users with positions and their associations with schools
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
            .select('-__v') // Exclude the '__v' field
            .populate({
                path: 'position',
                select: 'name -_id' // Include only the 'name' field from the 'position' reference
            })
            .exec();

        const modifiedUsers = await Promise.all(users.map(async (user) => {
            // Find associations (schools) for the current user
            const associations = await Association.find({ user: user._id })
                .select('-user -__v') // Exclude 'user' and '__v' fields
                .populate({
                    path: 'school',
                    select: 'name -_id' // Include only the 'name' field from the 'school' reference
                })
                .exec();

            // Extract position name
            const positionName = user.position ? user.position.name : null;

            // Create a modified user object
            const modifiedUser = {
                ...user.toObject(), // Convert Mongoose document to plain JavaScript object
                position: positionName, // Assign position name directly
                schools: associations.map(association => ({
                    name: association.school.name,
                    approved: association.approved,
                    invitation: association.invitation,
                    admin: association.admin
                }))
            };

            return modifiedUser;
        }));

        res.json(modifiedUsers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Getting one user by email
router.get('/:email', async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.params.email })
            .select('-__v')
            .populate({
                path: 'position',
                select: '-__v'
            })
            .exec()

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Find associations (schools) for the current user
        const associations = await Association.find({ user: user._id })
            .select('-user -_id -__v') // Exclude 'user' and '__v' fields
            .populate({
                path: 'school',
                select: 'name -_id' // Include only the 'name' field from the 'school' reference
            })
            .exec();

        // Extract position name from user.position or set to null if user.position is null
        const positionName = user.position ? user.position.name : null;

        // Modify the response data to include the extracted position name
        const modifiedUser = {
            ...user.toObject(), // Convert Mongoose document to plain JavaScript object
            position: positionName, // Replace position object with position name
            schools: associations.map(association => ({
                name: association.school.name,
                approved: association.approved,
                invitation: association.invitation,
                admin: association.admin
            }))
        };

        res.send(modifiedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Insert one User with designated Position
router.post('/', async (req, res, next) => {
    await getPositionByName(req, res, next)
}, async (req, res, next) => {
    await getDuplicatesByEmail(req, res, next)
}, async (req, res) => {
    const user = new User({
        fname: req.body.fname,
        mname: req.body.mname,
        lname: req.body.lname,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        position: res.pos
    })
    try {
        const newUser = await user.save()
        res.status(201).json(newUser)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Insert an Association between User and School
router.patch('/:id/school/:school_id', async (req, res, next) => {
    await getUser(req, res, next); // Get user by ID
}, async (req, res, next) => {
    await getSchool(req, res, next); // Get school by school_id
}, async (req, res, next) => {
    await getAssociation(req, res, next); // Check if association exists
}, async (req, res) => {
    try {
        if (!res.assoc) {
            // Create association if it doesn't exist
            const newAssoc = new Association({
                user: res.user._id, // Use user ID
                school: res.school._id // Use school ID
            });
            const savedAssoc = await newAssoc.save();

            await res.user.save();

            return res.json(res.user); // Send success response with updated user object
        } else {
            return res.status(409).json({ message: 'School already exists in User' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//Updating one
router.patch('/:id', async (req, res, next) => {
    await getPositionByName(req, res, next)
}, async (req, res, next) => {
    await getUser(req, res, next)
})
router.patch('/:id', getUser, async (req, res) => {
    if (req.body.name != null) {
        res.user.name = req.body.name
    }
    if (req.body.password != null) {
        res.user.password = req.body.password
    }
    if (req.body.position != null) {
        res.user.position = res.pos
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

// Validate credentials
router.post('/validate', getUserByEmail, async (req, res) => {
    try {
        const isMatch = await bcrypt.compare(req.body.password, res.user.password);
        res.json({ isMatch });
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Middleware
async function getUser(req, res, next) {
    const userId = req.params.id;

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }

    try {
        const user = await User.findById(userId);
        if (user == null) {
            return res.status(404).json({ message: 'Cannot find user' });
        }
        res.user = user; // Attach user object to response
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getUserByEmail(req, res, next) {
    let user
    try {
        user = await User.findOne({ email: req.body.email })
        if (user == null)
            return res.status(404).json({ message: 'Cannot find user with that email' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
    //Creates the object user
    res.user = user
    next() //proceeds to the next function
}

async function getDuplicatesByEmail(req, res, next) {
    let user
    try {
        user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(409).json({ message: 'User already exists' })
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
    //Creates the object user
    res.user = user
    next() //proceeds to the next function
}

async function getSchoolByName(req, res, next) {
    let school
    try {
        school = await School.findOne({ name: req.body.name })
        if (school == null)
            return res.status(404).json({ message: 'Cannot find school with that name' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    //Creates the object user
    res.school = school;
    next();
}

async function getPositionByName(req, res, next) {
    let pos
    try {
        pos = await Position.findOne({ name: req.body.position })
        if (pos == null)
            return res.status(404).json({ message: 'Cannot find position' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.pos = pos
    next()
}

async function getSchool(req, res, next) {
    const schoolId = req.params.school_id;

    if (!mongoose.isValidObjectId(schoolId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    try {
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ message: 'Cannot find school' });
        }
        res.school = school; // Attach school object to response
        next();
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function getAssociation(req, res, next) {
    try {
        const assoc = await Association.findOne({ user: res.user._id, school: res.school._id });

        if (!assoc) {
            res.assoc = null; // Set res.assoc to null if association doesn't exist
        } else {
            res.assoc = assoc; // Attach found association to response
        }
        next();
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

module.exports = router