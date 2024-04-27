const express = require('express')
const mongoose = require('mongoose');
const router = express.Router()
const Notifications = require('../models/Notification');
const User = require("../models/User")
const Association = require("../models/Association")
const NotificationController = require('../controllers/NotificationController')

//Getting all
router.get('/', NotificationController.getAllNotifications)

//Creating one with a User (default)
router.post('/',
    NotificationController.getUser,
    NotificationController.getAssociation,
    NotificationController.createNotification
);

//Deleting one
router.delete('/:id',
    NotificationController.getNotification,
    NotificationController.deleteNotification
);

//Deleting many Notification by userId
router.delete('/all/users/:user_id',
    NotificationController.getUser,
    NotificationController.deleteAllNotificationByUser
);

//Update one
router.patch('/:id',
    NotificationController.getNotification,
    NotificationController.patchNotification
);

module.exports = router