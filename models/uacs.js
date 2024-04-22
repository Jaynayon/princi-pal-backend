const mongoose = require('mongoose')

const uacsSchema = mongoose.Schema({
    account_explanation: {
        type: String,
        required: true
    },
    uacs_obj_code: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('UACS', uacsSchema)