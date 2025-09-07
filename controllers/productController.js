const Product = require('../models/Product');
const axios = require('axios');

// Utility function to clean product data for API responses
const cleanProductForResponse = (product) => {
  if (!product) return product;
  
  const cleaned = { ...product };
  
  // Remove internal fields that shouldn't be exposed to users
  delete cleaned.embedding;
  delete cleaned.__v;
  
  // Convert ObjectId to string if it exists
  if (cleaned._id) {
    cleaned._id = cleaned._id.toString();
  }
  
  // Handle categoryId - if it's populated, keep the category object, otherwise convert to string
  if (cleaned.categoryId) {
    if (typeof cleaned.categoryId === 'object' && cleaned.categoryId._id) {
      // It's a populated category object, clean it too
      cleaned.category = {
        _id: cleaned.categoryId._id.toString(),
        name: cleaned.categoryId.name
      };
      delete cleaned.categoryId;
    } else if (typeof cleaned.categoryId === 'object') {
      // It's an ObjectId, convert to string
      cleaned.categoryId = cleaned.categoryId.toString();
    }
  }
  
  // Clean dates to ISO strings
  if (cleaned.createdAt) {
    cleaned.createdAt = new Date(cleaned.createdAt).toISOString();
  }
  if (cleaned.updatedAt) {
    cleaned.updatedAt = new Date(cleaned.updatedAt).toISOString();
  }
  
  return cleaned;
};

// Utility function to clean array of products
const cleanProductsForResponse = (products) => {
  if (!Array.isArray(products)) return products;
  return products.map(cleanProductForResponse);
};

exports.addProduct = async (req, res) => {
  try {
    const { name, description, brand, categoryId, gender, tags } = req.body;
    const product = new Product({ name, description, brand, categoryId, gender, tags });
    await product.save();
    
    // Auto-sync with RAG system
    try {
      console.log("🔄 Auto-syncing new product to RAG system:", product._id);
      await axios.post('http://localhost:5050/sync-product', {
        product_id: product._id.toString()
      });
      console.log("✅ Product auto-synced to RAG system");
    } catch (syncErr) {
      console.warn("⚠️ Auto-sync failed (product still saved):", syncErr.message);
    }
    
    const cleanedProduct = cleanProductForResponse(product.toObject());
    res.status(201).json({
      ...cleanedProduct,
      rag_sync_status: 'attempted',
      message: 'Product created successfully'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('categoryId');
    const cleanedProducts = cleanProductsForResponse(products.map(p => p.toObject()));
    res.json(cleanedProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.aiSearch = async (req, res) => {
  try {
    const { 
      query, 
      agent = 'openai', 
      page = 1, 
      limit = 10, 
      filters = {},
      max_distance = 1.2 
    } = req.body;
    
    console.log("🔍 AI Search Query:", query, "Agent:", agent, "Page:", page, "Limit:", limit);
    console.log("🔍 Filters:", filters);
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        error: 'Query is required',
        message: 'Please provide a search query'
      });
    }

    const response = await axios.post('http://localhost:5050/search', {
      query: query.trim(),
      agent,
      page: parseInt(page),
      limit: parseInt(limit),
      filters,
      max_distance: parseFloat(max_distance)
    });

    // Enhanced response with better error handling
    const responseData = response.data;
    
    // Clean products in the response
    if (responseData.products && Array.isArray(responseData.products)) {
      responseData.products = cleanProductsForResponse(responseData.products);
    }
    
    // Add request metadata
    responseData.request_metadata = {
      original_query: query,
      agent_used: agent,
      page_requested: parseInt(page),
      limit_requested: parseInt(limit),
      filters_applied: filters,
      timestamp: new Date().toISOString()
    };

    res.json(responseData);
  } catch (err) {
    console.error("❌ AI Service Error:", err?.response?.data || err.message);
    
    // Enhanced error response
    const errorResponse = {
      error: 'AI service error',
      message: 'Failed to process search request',
      details: err?.response?.data?.error || err.message,
      request_info: {
        query: req.body.query,
        agent: req.body.agent || 'openai',
        timestamp: new Date().toISOString()
      }
    };

    // Check if it's a connection error
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      errorResponse.message = 'AI service is unavailable';
      errorResponse.details = 'Cannot connect to Flask RAG service on port 5050';
      return res.status(503).json(errorResponse);
    }

    // Check if it's a validation error from Flask
    if (err.response?.status === 400) {
      return res.status(400).json(errorResponse);
    }

    res.status(500).json(errorResponse);
  }
};

// Sync all products to RAG system
exports.syncAllProducts = async (req, res) => {
  try {
    console.log("🔄 Starting full sync to RAG system...");
    
    const response = await axios.post('http://localhost:5050/sync');
    
    res.json({
      message: 'Full sync completed successfully',
      rag_response: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ Sync Error:", err?.response?.data || err.message);
    
    const errorResponse = {
      error: 'Sync failed',
      message: 'Failed to sync products with RAG system',
      details: err?.response?.data?.error || err.message,
      timestamp: new Date().toISOString()
    };

    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      errorResponse.message = 'RAG service is unavailable';
      errorResponse.details = 'Cannot connect to Flask RAG service on port 5050';
      return res.status(503).json(errorResponse);
    }

    res.status(500).json(errorResponse);
  }
};

// Sync single product to RAG system
exports.syncSingleProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({ 
        error: 'Product ID is required',
        message: 'Please provide a valid product ID'
      });
    }

    console.log("🔄 Syncing single product:", productId);
    
    const response = await axios.post('http://localhost:5050/sync-product', {
      product_id: productId
    });
    
    res.json({
      message: 'Product synced successfully',
      product_id: productId,
      rag_response: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ Single Sync Error:", err?.response?.data || err.message);
    
    const errorResponse = {
      error: 'Single product sync failed',
      message: 'Failed to sync product with RAG system',
      product_id: req.params.productId,
      details: err?.response?.data?.error || err.message,
      timestamp: new Date().toISOString()
    };

    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      errorResponse.message = 'RAG service is unavailable';
      errorResponse.details = 'Cannot connect to Flask RAG service on port 5050';
      return res.status(503).json(errorResponse);
    }

    res.status(500).json(errorResponse);
  }
};

// Delete product from RAG system
exports.deleteFromRAG = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({ 
        error: 'Product ID is required',
        message: 'Please provide a valid product ID'
      });
    }

    console.log("🗑️ Deleting product from RAG system:", productId);
    
    const response = await axios.post('http://localhost:5050/delete-product', {
      product_id: productId
    });
    
    res.json({
      message: 'Product deleted from RAG system successfully',
      product_id: productId,
      rag_response: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ Delete from RAG Error:", err?.response?.data || err.message);
    
    const errorResponse = {
      error: 'Delete from RAG failed',
      message: 'Failed to delete product from RAG system',
      product_id: req.params.productId,
      details: err?.response?.data?.error || err.message,
      timestamp: new Date().toISOString()
    };

    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      errorResponse.message = 'RAG service is unavailable';
      errorResponse.details = 'Cannot connect to Flask RAG service on port 5050';
      return res.status(503).json(errorResponse);
    }

    res.status(500).json(errorResponse);
  }
};

// Get RAG system statistics
exports.getRAGStats = async (req, res) => {
  try {
    console.log("📊 Fetching RAG system stats...");
    
    const response = await axios.get('http://localhost:5050/stats');
    
    res.json({
      message: 'RAG system stats retrieved successfully',
      stats: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ RAG Stats Error:", err?.response?.data || err.message);
    
    const errorResponse = {
      error: 'Failed to get RAG stats',
      message: 'Failed to retrieve RAG system statistics',
      details: err?.response?.data?.error || err.message,
      timestamp: new Date().toISOString()
    };

    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      errorResponse.message = 'RAG service is unavailable';
      errorResponse.details = 'Cannot connect to Flask RAG service on port 5050';
      return res.status(503).json(errorResponse);
    }

    res.status(500).json(errorResponse);
  }
};

// Health check for RAG system
exports.ragHealthCheck = async (req, res) => {
  try {
    console.log("🏥 Checking RAG system health...");
    
    const response = await axios.get('http://localhost:5050/test');
    
    res.json({
      message: 'RAG system health check successful',
      rag_status: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ RAG Health Check Error:", err?.response?.data || err.message);
    
    res.status(503).json({
      error: 'RAG system is unhealthy',
      message: 'RAG service is not responding',
      details: err?.response?.data?.error || err.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Debug search functionality
exports.debugSearch = async (req, res) => {
  try {
    const { query = 'lip balm', filters = {} } = req.body;
    
    console.log("🐛 Debug search for:", query, "with filters:", filters);
    
    const response = await axios.post('http://localhost:5050/debug', {
      query,
      filters
    });
    
    // Clean products in debug response
    const debugData = response.data;
    if (debugData.products && Array.isArray(debugData.products)) {
      debugData.products = cleanProductsForResponse(debugData.products);
    }
    
    res.json({
      message: 'Debug search completed',
      debug_data: debugData,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ Debug Search Error:", err?.response?.data || err.message);
    
    const errorResponse = {
      error: 'Debug search failed',
      message: 'Failed to perform debug search',
      details: err?.response?.data?.error || err.message,
      timestamp: new Date().toISOString()
    };

    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      errorResponse.message = 'RAG service is unavailable';
      errorResponse.details = 'Cannot connect to Flask RAG service on port 5050';
      return res.status(503).json(errorResponse);
    }

    res.status(500).json(errorResponse);
  }
};

