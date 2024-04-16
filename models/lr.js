const mongoose = require('mongoose')

const LRSchema = mongoose.Schema({
    date: String,
    ors_burs_no: String,
    particulars: String,
    amount: String, //partial
    claimant: String,
    sds: String,
    head_accounting: String
})

module.exports = mongoose.model('LR', LRSchema);