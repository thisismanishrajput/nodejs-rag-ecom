const express = require('express');
const router = express.Router();
const { addProduct, getAllProducts, aiSearch } = require('../controllers/productController');

router.post('/', addProduct);
router.get('/', getAllProducts);
router.post('/ai-search', aiSearch); // AI search endpoint

module.exports = router;
