const express = require('express')
const router = express.Router()
const User = require('../models/user')
const School = require('../models/school')
const Position = require('../models/position')

/*
//Getting all users with schools
//Should be /Users/:userID/Schools
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
            .select('-_id -__v') //excludes the _id and __v
            .populate({
                path: 'schools', //populate the schools field in the User model
                select: 'name -_id' // Include only the 'name' field and exclude the '_id'
            })
            .exec()

        // Modify the response data to extract school names
        const modifiedUsers = users.map(user => {
            const schoolNames = user.schools.map(school => school.name);
            return {
                ...user.toObject(), // Convert Mongoose document to plain JavaScript object
                schools: schoolNames // Replace schools array with school names
            };
        });

        res.json(modifiedUsers)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})*/

//Getting all users with positions
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
            .select('-_id -__v') //excludes the _id and __v
            .populate({
                path: 'position', //populate the schools field in the User model
                select: 'name -_id' // Include only the 'name' field and exclude the '_id'
            })
            .exec()

        // Modify the response data to extract school names
        const modifiedUsers = users.map(user => {
            const positionName = user.position.name;
            return {
                ...user.toObject(), // Convert Mongoose document to plain JavaScript object
                position: positionName // Replace schools array with school names
            };
        });

        res.json(modifiedUsers)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Getting one user by email
router.get('/:email', async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.params.email })
            .select('-__v');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Populate the 'position' field with the corresponding position data
        await user.populate({
            path: 'position',
            select: '-__v'
        })

        // Access the populated 'position' field in the user object
        const userWithPosition = user.toObject();

        res.send(userWithPosition);
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

/*
// Insert school to user
router.patch('/:id/school', async (req, res, next) => {
    await getUser(req, res, next); //check if user exists
}, async (req, res, next) => {
    await getSchoolByName(req, res, next) //check if school exists 
}, async (req, res) => {
    try {
        const schoolExists = res.user.schools.some(//check for duplicate objects
            school => school.equals(res.school._id)
        );

        if (!schoolExists) {
            await res.user.schools.push(res.school);
            const insert = await res.user.save();
            return res.send(insert); // Send success response if school doesn't exist
        }
        return res.status(409).json({ message: 'School already exists in User' }); // Send error response if school exists
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});*/

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

async function getUserByEmail(req, res, next, { params = false } = {}) {
    let user
    try {
        user = await User.findOne({ email: params ? req.params.email : req.body.email })
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

module.exports = router