const mongoose = require('mongoose');

const documentSchema = mongoose.Schema({
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schools', //School model
    },
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
                return value === undefined || value === null || (typeof value === 'number' && value >= 0 && value <= 999999);
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
                return value === undefined || value === null || (typeof value === 'number' && value >= 0 && value <= 999999);
            },
            message: 'Budget limit must be a non-negative number or left blank'
        }
    },
    cash_advance: {
        type: Number,
        required: false,
        validate: {
            validator: function (value) {
                // Validate budget_limit (must be a positive number or null/undefined)
                return value === undefined || value === null || (typeof value === 'number' && value >= 0 && value <= 999999);
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

// Middleware to enforce maximum value of 999999 for budget and budget_limit
documentSchema.pre('validate', function (next) {
    if (this.budget !== undefined && this.budget !== null) {
        this.budget = Math.min(this.budget, 999999);
    }
    if (this.budget_limit !== undefined && this.budget_limit !== null) {
        this.budget_limit = Math.min(this.budget_limit, 999999);
    }
    next();
});

module.exports = mongoose.model('Documents', documentSchema);
