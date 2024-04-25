const express = require('express')
const router = express.Router()
const PositionController = require('../controllers/PositionController')

//Getting all
router.get('/', PositionController.getAllPosition)

//Getting one
router.get('/:name',
    PositionController.getPositionByName,
    PositionController.getOnePosition
);

//Creating one
router.post('/',
    PositionController.getDuplicates,
    PositionController.createPosition
);

//Update one
router.patch('/:id',
    PositionController.getPosition,
    PositionController.patchPosition
);

//Deleting one
router.delete('/:id',
    PositionController.getPosition,
    PositionController.deletePosition
);


module.exports = router