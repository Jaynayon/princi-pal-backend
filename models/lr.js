const mongoose = require('mongoose');

const LRSchema = mongoose.Schema({
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Documents', //Users model,
        required: true //Needs to be under a Document 
    },
    date: {
        type: String,
        required: false  // Assuming date is required 
    },
    ors_burs_no: {
        type: String,
        required: false  // Assuming ors_burs_no is required
    },
    particulars: {
        type: String,
        required: false  // Assuming particulars is required
    },
    amount: {
        type: Number,
        required: false,  // Assuming amount is required and should be a number
        validate: [
            {
                validator: function (value) {
                    // Check if 'value' is a number
                    return !isNaN(value) && typeof value === 'number' && value >= 0;
                },
                message: 'Amount must be a valid number positive number'
            },
            {
                validator: function (value) {
                    // Check if 'value' is less than or equal to 10000
                    return value <= 10000;
                },
                message: 'Amount must be less than or equal to 10000'
            }
        ]
    },
    payee: {
        type: String,
        required: false  // Assuming particulars is required
    },
    uacs: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UACS', //Documents model,
        required: true //Needs to be under a UACS 
    },
    nature_of_payment: {
        type: String,
        required: false  // Assuming particulars is required
    },
});

module.exports = mongoose.model('LR', LRSchema);
