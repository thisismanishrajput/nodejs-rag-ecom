const express = require('express');
const router = express.Router();
const { addCategory, getAllCategories } = require('../controllers/categoryController');

router.post('/', addCategory);
router.get('/', getAllCategories);

module.exports = router;
