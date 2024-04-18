const express = require('express')
const router = express.Router()
const Notifications = require('../models/notification');
const User = require("../models/user")
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
router.post('/', getUser, getAssociation, async (req, res) => {
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

async function getPositionByName(req, res, next) {
    let pos
    try {
        pos = await Position.findOne({ name: req.params.name })
        if (pos == null)
            return res.status(404).json({ message: 'Cannot find position' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.pos = pos
    next()
}

async function getUser(req, res, next) {
    let user
    try {
        user = await User.findById(req.body.userId)
        if (user == null)
            return res.status(404).json({ message: 'Cannot find user' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.user = user
    next()
}

async function getAssociation(req, res, next) {
    if (!req.body.assocId) {
        // If assocId is not provided in the request body, move to the next middleware
        return next();
    }

    let assoc
    try {
        assoc = await Association.findById(req.body.assocId)
        if (assoc == null)
            return res.status(404).json({ message: 'Cannot find School Association' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.assoc = assoc
    next()
}



module.exports = router