const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const association = require('./association')

const userSchema = mongoose.Schema({
    fname: {
        type: String,
        required: true
    },
    mname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minLength: [6, 'Minimum password length is 6 character']
    },
    position: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Position', //School model
        //unique: false //Because multiple users can have multiple schools
    }
})

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

//This code creates/accesses the 'Users' collection and stores data in that collection
module.exports = mongoose.model('Users', userSchema)