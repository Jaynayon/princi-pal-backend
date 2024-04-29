const mongoose = require('mongoose');
const School = require('../models/School')
const Association = require('../models/Association');
const Notifications = require('../models/Notification')

// Getting all schools with associations
async function getAllSchools(req, res) {
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
}

// Getting one schools name with associations
async function getSchoolByName(req, res) {
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
}

// Creates new school
async function createSchool(req, res, next) {
    const school = new School({
        name: req.body.name
    })
    try {
        const newSchool = await school.save()
        res.status(201).json(newSchool)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

//Update one
async function patchSchool(req, res, next) {
    if (req.body.name != null) {
        res.school.name = req.body.name
    }
    try {
        const newSchool = await res.school.save()
        res.json(newSchool)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

//Deleting one along with its associations
async function deleteSchool(req, res, next) {
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
}

//Middleware
async function getDuplicates(req, res, next) {
    let school;

    try {
        school = await School.findOne({ name: req.body.name });

        if (school) {
            return res.status(409).json({ message: 'School already exists' });
        }
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }

    // If school does not exist, continue to the next middleware
    res.school = school;
    next();
}

async function getName(req, res, next) {
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

    const schoolId = req.params.id || req.body.id
    if (!mongoose.isValidObjectId(schoolId)) {
        return res.status(400).json({ message: 'Invalid school ID format' });
    }

    try {
        school = await School.findById(schoolId)
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

module.exports = {
    getAllSchools,
    getSchoolByName,
    getName,
    createSchool,
    getDuplicates,
    getSchool,
    getAssociation,
    patchSchool,
    deleteSchool
}