const mongoose = require('mongoose');

const documentSchema = mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schools', //School model
    },
    lr: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LR', // Reference to LR model
    }],
    month: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    budget: {
        type: Number,
        required: false,
        validate: {
            validator: function (value) {
                // Validate budget (must be a positive number)
                return value === undefined || value === null || (typeof value === 'number' && value >= 0);
            },
            message: 'Budget must be a non-negative number'
        }
    },
    budget_limit: {
        type: Number,
        required: false,
        validate: {
            validator: function (value) {
                // Validate budget_limit (must be a positive number or null/undefined)
                return value === undefined || value === null || (typeof value === 'number' && value >= 0);
            },
            message: 'Budget limit must be a non-negative number or left blank'
        }
    },
    budget_exceeded: {
        type: Boolean,
        required: false,
        default: false
    },
    sds: {
        type: String,
        required: false
    },
    claimant: {
        type: String,
        required: false
    },
    head_accounting: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('Documents', documentSchema);
