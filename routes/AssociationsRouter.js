const express = require('express')
const router = express.Router()
const AssociationController = require('../controllers/AssociationController')

//Getting all
router.get('/', AssociationController.getAllAssociations)

//Getting one
router.get('/:id',
    AssociationController.getAssociationById,
    AssociationController.getOneAssociation
);

// Insert an Association between User and School
router.post('/user/school',
    AssociationController.getUser,
    AssociationController.getSchool,
    AssociationController.getAssociation,
    AssociationController.createAssociation
);

//Deleting one
router.delete('/:id',
    AssociationController.getAssociationById,
    AssociationController.deleteAssociation
);

//Update one
router.patch('/:id',
    AssociationController.getAssociationById,
    AssociationController.patchAssociation
);

module.exports = router