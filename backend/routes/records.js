const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');

// Routes mapping to Controller methods
router.get('/', recordController.getRecords);
router.post('/', recordController.createRecord);
router.put('/:id', recordController.updateRecord);
router.delete('/:id', recordController.deleteRecord);

module.exports = router;
