const express = require('express');
const cors = require('cors');
const app = express();

const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

app.use(cors());
app.use(express.json());

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// General health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'E-commerce backend is running',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: 'connected',
      rag_system: 'check /api/products/rag/health for status'
    }
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'E-commerce Backend API',
    version: '1.0.0',
    endpoints: {
      products: {
        'GET /api/products': 'Get all products',
        'POST /api/products': 'Create new product (auto-syncs to RAG)',
        'POST /api/products/ai-search': 'AI-powered product search with pagination and filtering',
        'POST /api/products/debug-search': 'Debug search functionality',
        'POST /api/products/sync': 'Sync all products to RAG system',
        'POST /api/products/sync/:productId': 'Sync single product to RAG system',
        'DELETE /api/products/rag/:productId': 'Delete product from RAG system',
        'GET /api/products/rag/stats': 'Get RAG system statistics',
        'GET /api/products/rag/health': 'RAG system health check'
      },
      categories: {
        'GET /api/categories': 'Get all categories',
        'POST /api/categories': 'Create new category'
      },
      system: {
        'GET /health': 'General health check'
      }
    },
    features: [
      'MongoDB integration',
      'RAG system integration with ChromaDB',
      'AI-powered search with OpenAI and Gemini',
      'Pagination and filtering support',
      'Auto-sync with RAG system',
      'Comprehensive error handling'
    ]
  });
});

module.exports = app;
