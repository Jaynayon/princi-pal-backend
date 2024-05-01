const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController')

// Getting all users with positions and their associations with schools
router.get('/', UserController.getAllUsers);

// Getting a user with position and their association/s with schools
router.get('/id/',
    UserController.getUser,
    UserController.getOneUserById
);

// Getting one user by email
router.get('/:email', UserController.getOneUserByEmail);

// Getting one user by email
router.get('/exists/:details', UserController.getExistingEmailUsername);

// Getting existing 
router.post('/',
    UserController.getDuplicatesByEmail,
    UserController.getDuplicatesByUsername,
    UserController.getPositionByName,
    UserController.createUser
);

// Insert one User with designated Position
router.post('/',
    UserController.getPositionByName,
    UserController.getDuplicatesByEmail,
    UserController.getDuplicatesByUsername,
    UserController.createUser
);

//Updating one 
router.patch('/:user_id',
    UserController.getPositionByName,
    UserController.getUser,
    UserController.patchUser
);

//Deleting one along with its associations
router.delete('/:user_id',
    UserController.getUser,
    UserController.deleteUser
);

// Validate credentials 
router.post('/validate',
    UserController.getUserByEmail,
    UserController.validateUser
);

module.exports = router