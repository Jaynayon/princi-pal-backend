const express = require('express')
const mongoose = require('mongoose');
const router = express.Router()
const Notifications = require('../models/notification');
const User = require("../models/User")
const Association = require("../models/association")

//Getting all
router.get('/', async (req, res) => {
    try {
        const notif = await Notifications.find()
            .populate({
                path: 'user',
                select: '-_id -__v -password -position -username'
            })
            .select('-__v')
        res.json(notif)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

/*//Getting one
router.get('/:name', getPositionByName, async (req, res) => {
    try {
        console.log(res.pos)
        res.send(res.pos)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})*/

//Creating one with a User (default)
router.post('/', async (req, res, next) => {
    await getUser(req, res, params = false, next)
}, async (req, res, next) => {
    await getAssociation(req, res, params = false, next)
}, async (req, res) => {
    const notif = new Notifications({
        user: res.user,
        assoc: res.assoc,
        details: req.body.details
    })
    // Only include assoc if res.assoc is available (not null or undefined)
    if (!res.assoc) {
        delete notif.assoc;
    }
    try {
        const newNotif = await notif.save()
        res.status(201).json(newNotif)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

//Deleting one
router.delete('/:id', getNotification, async (req, res) => {
    try {
        await res.notif.deleteOne()
        res.json({ message: 'Notification removed' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Deleting many Notification by userId
router.delete('/all/users/:user_id', async (req, res, next) => {
    await getUser(req, res, params = true, next)
}, async (req, res) => {
    const userId = req.params.user_id; // Assuming user_id is provided in the request body
    try {
        const result = await Notifications.deleteMany({
            user: userId// Filter by userId
        });

        if (result.deletedCount > 0) {
            res.json({ message: `${result.deletedCount} notification(s) removed` });
        } else {
            res.status(404).json({ message: 'No matching notifications found for deletion' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Update one
router.patch('/:id', getNotification, async (req, res) => {
    if (req.body.details != null) {
        res.notif.details = req.body.details
    }
    if (req.body.isRead != null) {
        res.notif.isRead = req.body.isRead
    }
    try {
        const newNotif = await res.notif.save()
        res.json(newNotif)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//Middleware
async function getDuplicates(req, res, next) {
    let notif
    try {
        notif = await Notifications.findOne({ name: req.body.name })
        if (pos) {
            return res.status(409).json({ message: 'Notification already exists' })
        }
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    //Creates the object user
    res.notif = notif;
    next()//proceeds to the next function
}

async function getNotification(req, res, next) {
    let notif
    try {
        notif = await Notifications.findById(req.params.id)
        if (notif == null)
            return res.status(404).json({ message: 'Cannot find notification' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.notif = notif
    next()
}

async function getUser(req, res, params = true, next) {
    const userId = params ? req.params.user_id : req.body.user_id
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

async function getAssociation(req, res, params = true, next) {
    const assocId = params ? req.params.assoc_id : req.body.assoc_id
    if (!assocId) {
        return next()
    }
    if (!mongoose.isValidObjectId(assocId)) {
        return res.status(400).json({ message: 'Invalid assoc ID format' });
    }

    try {
        const assoc = await Association.findById(assocId);
        if (assoc == null) {
            return res.status(404).json({ message: 'Cannot find Association' });
        }
        res.assoc = assoc; // Attach user object to response
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = router