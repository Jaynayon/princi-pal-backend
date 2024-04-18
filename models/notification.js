const mongoose = require('mongoose')

const notificationSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users', //Users model,
        required: true //Needs to be under a User
    },
    assoc: {
        type: mongoose.Schema.Types.ObjectId, //Has associations if needed
        ref: 'Associations', //Associations model
    },
    details: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        defualt: false //notification is not read
    },
})

// Middleware to set default value for isRead if not provided
notificationSchema.pre('save', function (next) {
    if (this.isNew && this.isRead === undefined) {
        this.isRead = false; // Set isRead to false if not provided during creation
    }
    next();
});

module.exports = mongoose.model('Notifications', notificationSchema)