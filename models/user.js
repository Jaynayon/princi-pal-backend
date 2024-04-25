const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

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
        ref: 'Position', //Position model 
    },
    avatar: {
        type: String,
        default: "Blue"
    }
})

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

//This code creates/accesses the 'Users' collection and stores data in that collection
module.exports = mongoose.model('Users', userSchema)