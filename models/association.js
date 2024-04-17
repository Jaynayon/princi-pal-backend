const mongoose = require('mongoose')

const associationsSchema = mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schools', //School model
        //unique: false //Because multiple users can have multiple schools
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users', //Users model
        //unique: false //Because multiple users can have multiple users
    },
    approved: {
        type: Boolean,
        required: true,
        default: false
    },
    invitation: {
        type: Boolean,
        required: true,
        default: false
    },
    admin: {
        type: Boolean,
        required: true,
        default: false
    }
    /*schools: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schools', //School model
        unique: false //Because multiple users can have multiple schools
    }]*/
})
//This code creates/accesses the 'Users' collection and stores data in that collection
module.exports = mongoose.model('Associations', associationsSchema)