const mongoose = require('mongoose');

const JEVSchema = mongoose.Schema({
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Documents', //Documents model,
        required: true //Needs to be under a Document 
    },
    respo_center: {
        type: String,
        required: false  // Assuming date is required 
    },
    account_explanation: {
        type: String,
        required: false  // Assuming particulars is required
    },
    uacs_obj_code: {
        type: String,
        required: false  // Assuming ors_burs_no is required
    },
    debit: {
        type: Number,
        required: false,
        validate: [
            {
                validator: function (value) {
                    // Check if 'value' is a number and >= 0
                    return !isNaN(value) && typeof value === 'number' && value >= 0;
                },
                message: 'Amount must be a valid positive number'
            },
            {
                validator: function (value) {
                    // Check if 'value' is less than or equal to 10000
                    return value <= 10000;
                },
                message: 'Amount must be less than or equal to 10000'
            }
        ],
        default: 0, // Default value if not provided or invalid
        set: function (value) {
            // Automatically cap 'value' at 10000 if it exceeds this limit
            return Math.min(value, 10000);
        }
    },
    credit: {
        type: Number,
        required: false,
        validate: [
            {
                validator: function (value) {
                    // Check if 'value' is a number and >= 0
                    return !isNaN(value) && typeof value === 'number' && value >= 0;
                },
                message: 'Amount must be a valid positive number'
            },
            {
                validator: function (value) {
                    // Check if 'value' is less than or equal to 10000
                    return value <= 10000;
                },
                message: 'Amount must be less than or equal to 10000'
            }
        ],
        default: 0, // Default value if not provided or invalid
        set: function (value) {
            // Automatically cap 'value' at 10000 if it exceeds this limit
            return Math.min(value, 10000);
        }
    }
});

module.exports = mongoose.model('JEV', JEVSchema);
