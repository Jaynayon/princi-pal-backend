const express = require('express')
const router = express.Router()
const AuthMiddleware = require('../controllers/AuthMiddleware')

//Getting all
//router.get('/', PositionController.getAllPosition)

//Creating one
router.post('/verify/:token',
    AuthMiddleware.verifyToken
);

module.exports = router