const mongoose = require('mongoose')

const schoolSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users', //User model
        unique: false //Because multiple users can belong to multiple schools
    }]
})

module.exports = mongoose.model('Schools', schoolSchema)