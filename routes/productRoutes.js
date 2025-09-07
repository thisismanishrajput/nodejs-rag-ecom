const express = require('express');
const router = express.Router();
const { 
  addProduct, 
  getAllProducts, 
  aiSearch,
  syncAllProducts,
  syncSingleProduct,
  deleteFromRAG,
  getRAGStats,
  ragHealthCheck,
  debugSearch
} = require('../controllers/productController');

// Basic CRUD operations
router.post('/', addProduct);
router.get('/', getAllProducts);

// AI Search endpoints
router.post('/ai-search', aiSearch); // Enhanced AI search with pagination and filtering
router.post('/debug-search', debugSearch); // Debug search functionality

// RAG System Management endpoints
router.post('/sync', syncAllProducts); // Sync all products to RAG system
router.post('/sync/:productId', syncSingleProduct); // Sync single product to RAG system
router.delete('/rag/:productId', deleteFromRAG); // Delete product from RAG system

// RAG System Monitoring endpoints
router.get('/rag/stats', getRAGStats); // Get RAG system statistics
router.get('/rag/health', ragHealthCheck); // RAG system health check

module.exports = router;
