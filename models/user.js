const mongoose = require('mongoose')
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
        required: true
    },
    position: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Position', //School model
        //unique: false //Because multiple users can have multiple schools
    },
    association: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Associations', //Assocation model
        unique: false //Because multiple users can have multiple schools
    }]
})
//This code creates/accesses the 'Users' collection and stores data in that collection
module.exports = mongoose.model('Users', userSchema)