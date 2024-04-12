const mongoose = require('mongoose')

const positionSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Position', positionSchema)