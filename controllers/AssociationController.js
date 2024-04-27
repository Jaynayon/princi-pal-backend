const express = require('express')
const mongoose = require('mongoose');
const router = express.Router()
const User = require('../models/User')
const School = require('../models/School')
const Association = require('../models/Association')

//Getting all
async function getAllAssociations(req, res) {
    try {
        const assoc = await Association.find()
        res.json(assoc)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

//Get one association by id
async function getOneAssociation(req, res) {
    try {
        res.json(res.assoc)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Insert an Association between User and School
async function createAssociation(req, res) {
    try {
        if (!res.assoc) {
            // Create association if it doesn't exist
            const newAssoc = new Association({
                user: res.user._id, // Use user ID
                school: res.school._id, // Use school ID
                invitation: req.body.invitation != null ? req.body.invitation : false
            });

            await newAssoc.save(); //save that association

            return res.json(newAssoc); // Send success response with updated user object
        } else {
            return res.status(409).json({ message: 'Association already exists in User' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

//Deleting one
async function deleteAssociation(req, res) {
    try {
        await res.assoc.deleteOne()
        res.json({ message: 'School Association removed' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

//Update one
async function patchAssociation(req, res) {
    if (req.body.approved != null) {
        res.assoc.approved = req.body.approved
    }
    if (req.body.admin != null) {
        res.assoc.admin = req.body.admin
    }
    try {
        const newAssoc = await res.assoc.save()
        res.json(newAssoc)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

//Middleware
async function getAssociationById(req, res, next) {
    let assoc
    const assocId = req.params.id

    if (!mongoose.isValidObjectId(assocId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }

    try {
        assoc = await Association.findById(req.params.id)
        if (assoc == null)
            return res.status(404).json({ message: 'Cannot find Association' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.assoc = assoc
    next()
}

async function getUser(req, res, next) {
    const userId = req.params.user_id || req.body.user_id

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

async function getSchool(req, res, next) {
    const schoolId = req.params.school_id || req.body.school_id

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

module.exports = {
    getAllAssociations,
    getOneAssociation,
    createAssociation,
    deleteAssociation,
    patchAssociation,
    getAssociationById,
    getUser,
    getSchool,
    getAssociation
}