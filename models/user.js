const mongoose = require('mongoose')

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
    school_assoc: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SchoolAssoc', //School model
        unique: false //Because multiple users can have multiple schools
    }]
    /*phone: {
        type: String,
        validate: {
            validator: (value) => /^\d{11}$/.test(value), // Custom validation for a 11-digit numeric string
            message: (props) => `${props.value} is an invalid phone number format. Must be 11 digits.`
        }
    },*/
    /*schools: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schools', //School model
        unique: false //Because multiple users can have multiple schools
    }]*/
})
//This code creates/accesses the 'Users' collection and stores data in that collection
module.exports = mongoose.model('Users', userSchema)