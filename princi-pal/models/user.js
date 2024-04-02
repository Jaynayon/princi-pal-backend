const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: {
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
    phone: {
        type: String,
        validate: {
            validator: (value) => /^\d{11}$/.test(value), // Custom validation for a 11-digit numeric string
            message: (props) => `${props.value} is an invalid phone number format. Must be 11 digits.`
        }
    },
    schools: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schools' //School model
    }]
})
//This code creates/accesses the 'Users' collection and stores data in that collection
module.exports = mongoose.model('Users', userSchema)