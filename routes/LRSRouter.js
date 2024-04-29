const express = require('express')
const router = express.Router()
const LRController = require('../controllers/LRController')

//Get all LRs
router.get('/', LRController.getAllLr)

//Creating one
router.post('/',
    LRController.getDocument,
    LRController.getUacs,
    LRController.createLr
);

//Update one
router.patch('/:id',
    LRController.getLR,
    LRController.getDocumentByLr,
    LRController.patchLr
);

//Deleting one
router.delete('/:id',
    LRController.getLR,
    LRController.getDocumentByLr,
    LRController.deleteLr
);

module.exports = router
