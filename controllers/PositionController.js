const express = require('express')
const mongoose = require('mongoose');
const User = require('../models/User')
const Position = require('../models/Position')

//Getting all
async function getAllPosition(req, res) {
    try {
        const pos = await Position.find()
        res.json(pos)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Getting one position 
async function getOnePosition(req, res) {
    try {
        console.log(res.pos)
        res.send(res.pos)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// Creates new position
async function createPosition(req, res, next) {
    //Check position name if it exists
    if (res.pos) {
        return res.status(409).json({ message: 'Duplicate position' })
    }
    const pos = new Position({
        name: req.body.name
    })
    try {
        const newPos = await pos.save()
        res.status(201).json(newPos)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

async function patchPosition(req, res, next) {
    if (req.body.name != null) {
        res.pos.name = req.body.name
    }
    try {
        const newPos = await res.pos.save()
        res.json(newPos)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

async function deletePosition(req, res, next) {
    try {
        await res.pos.deleteOne()
        res.json({ message: 'Position removed' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

//Middleware
async function getDuplicates(req, res, next) {
    let pos
    try {
        pos = await Position.findOne({ name: req.body.name })
        if (pos) {
            return res.status(409).json({ message: 'Position already exists' })
        }
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    //Creates the object user
    res.pos = pos;
    next()//proceeds to the next function
}
async function getPosition(req, res, next) {
    let pos_id = req.params.id || req.body.id
    if (!mongoose.isValidObjectId(pos_id)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    try {
        pos = await Position.findById(pos_id)
        if (pos == null)
            return res.status(404).json({ message: 'Cannot find position' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.pos = pos
    next()
}

async function getPositionByName(req, res, next) {
    let pos
    const pos_name = req.params.name || req.body.name
    try {
        pos = await Position.findOne({ name: pos_name })
        if (pos == null)
            return res.status(404).json({ message: 'Cannot find position' })
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
    res.pos = pos
    next()
}

module.exports = {
    getAllPosition,
    getOnePosition,
    createPosition,
    patchPosition,
    deletePosition,
    getDuplicates,
    getPosition,
    getPositionByName,
}