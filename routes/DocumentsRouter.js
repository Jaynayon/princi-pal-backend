const express = require('express')
const router = express.Router()
const DocumentController = require('../controllers/DocumentController')

//Getting one LR based on a year and month
router.get('/lr/schools/:year/:month',
    DocumentController.getSchool,
    DocumentController.getLrByYearMonth
);

//Getting one RCD based on a year and month
router.get('/rcd/schools/:year/:month',
    DocumentController.getSchool,
    DocumentController.getRcdByYearMonth
);

//Getting one JEV based on a year and month
router.get('/jev/schools/:year/:month',
    DocumentController.getSchool,
    DocumentController.getJevByYearMonth
);

//Getting one CDR based on a year and month

// Getting LR entries based on a keyword (supports string and numeric properties)
router.get('/lr/schools/:year/:month/:keyword',
    DocumentController.getSchool,
    DocumentController.searchLr
);

//Getting one LR for Dashboard
router.get('/schools/:year/:month',
    DocumentController.getSchool,
    DocumentController.getDashboard
);

//Creating one Document
router.post('/',
    DocumentController.getSchool,
    DocumentController.getDocumentDuplicates,
    DocumentController.createDocument
);

//Deleting one Document
router.delete('/:id',
    DocumentController.getDocumentById,
    DocumentController.deleteDocument
);

//Update one Document
router.patch('/:id',
    DocumentController.getDocumentById,
    DocumentController.patchDocument
);

module.exports = router