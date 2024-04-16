const mongoose = require('mongoose')

const schoolAssocSchema = mongoose.Schema({
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
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schools', //School model
        //unique: false //Because multiple users can have multiple schools
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users', //School model
        //unique: false //Because multiple users can have multiple schools
    },
    /*schools: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schools', //School model
        unique: false //Because multiple users can have multiple schools
    }]*/
})
//This code creates/accesses the 'Users' collection and stores data in that collection
module.exports = mongoose.model('SchoolAssoc', schoolAssocSchema)