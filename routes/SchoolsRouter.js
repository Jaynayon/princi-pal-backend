const express = require('express')
const mongoose = require('mongoose');
const router = express.Router()
const School = require('../models/School')
const Association = require('../models/association');
const Notifications = require('../models/notification')
const SchoolController = require('../controllers/SchoolController')

// Getting all schools with associations
router.get('/', SchoolController.getAllSchools);

// Getting schools by name with associations
router.get('/:name',
    SchoolController.getName,
    SchoolController.getSchoolByName
);

//Creating one
router.post('/',
    SchoolController.getDuplicates,
    SchoolController.createSchool
);

//Deleting one along with its associations 
router.delete('/:id',
    SchoolController.getSchool,
    SchoolController.getAssociation,
    SchoolController.deleteSchool
);

//Update one
router.patch('/:id',
    SchoolController.getDuplicates,
    SchoolController.getSchool,
    SchoolController.patchSchool
);

module.exports = router