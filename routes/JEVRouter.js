const express = require('express')
const router = express.Router()
const JEVController = require('../controllers/JEVController')

//Get all JEVs
router.get('/', JEVController.getAllJev)

//Creating one
router.post('/',
    JEVController.getDocument,
    JEVController.getUACS,
    JEVController.getDuplicatesUACS,
    JEVController.createJev
);

//Initialize one
router.post('/initialize',
    JEVController.getDocument,
    JEVController.initializeJev
);

//Update one
router.patch('/:id',
    JEVController.getJEV,
    JEVController.getDocumentByJev,
    JEVController.patchJev
);

//Deleting one
router.delete('/:id',
    JEVController.getJEV,
    JEVController.getDocumentByJev,
    JEVController.deleteJev
);

//Deleting all JEV from Document
router.delete('/document/:doc_id',
    JEVController.getDocument,
    JEVController.deleteAll
);

module.exports = router
