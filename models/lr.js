const mongoose = require('mongoose');

const LRSchema = mongoose.Schema({
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
                    return !isNaN(value) && typeof value === 'number';
                },
                message: 'Amount must be a valid number'
            },
            {
                validator: function (value) {
                    // Check if 'value' is less than or equal to 10000
                    return value <= 10000;
                },
                message: 'Amount must be less than or equal to 10000'
            }
        ]
    }
});

module.exports = mongoose.model('LR', LRSchema);
