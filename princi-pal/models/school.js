const mongoose = require('mongoose')

const schoolSchema = mongoose.Schema({
    id: {
        type: number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
})

module.exports = mongoose.model('Schools', schoolSchema)