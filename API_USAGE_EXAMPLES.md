# Enhanced E-commerce Backend API Usage Examples

This document provides comprehensive examples of how to use the enhanced Node.js backend that integrates with your Python RAG system.

## 🚀 Quick Start

### 1. Start the Services
```bash
# Terminal 1: Start Python RAG system
cd /path/to/your/python-rag-system
python app.py

# Terminal 2: Start Node.js backend
cd /Users/manish/Desktop/rag-system/ecom-backend
npm start
```

### 2. Health Checks
```bash
# Check Node.js backend
curl http://localhost:3000/health

# Check RAG system through Node.js
curl http://localhost:3000/api/products/rag/health

# Get API documentation
curl http://localhost:3000/api
```

## 🔍 AI-Powered Search Examples

### Basic Search
```bash
curl -X POST http://localhost:3000/api/products/ai-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "lip balm for dry lips",
    "agent": "openai"
  }'
```

### Search with Pagination
```bash
curl -X POST http://localhost:3000/api/products/ai-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "skincare products",
    "agent": "gemini",
    "page": 2,
    "limit": 5
  }'
```

### Search with Filters
```bash
curl -X POST http://localhost:3000/api/products/ai-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "moisturizer",
    "agent": "openai",
    "filters": {
      "brand": "nivea",
      "gender": "women",
      "in_stock": true
    },
    "page": 1,
    "limit": 10
  }'
```

### Advanced Search with Custom Parameters
```bash
curl -X POST http://localhost:3000/api/products/ai-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "anti-aging cream",
    "agent": "gemini",
    "filters": {
      "brand": "olay",
      "category": "skincare"
    },
    "page": 1,
    "limit": 8,
    "max_distance": 1.0
  }'
```

## 🔄 RAG System Management

### Sync All Products
```bash
curl -X POST http://localhost:3000/api/products/sync
```

### Sync Single Product
```bash
curl -X POST http://localhost:3000/api/products/sync/64a1b2c3d4e5f6789012345
```

### Delete Product from RAG
```bash
curl -X DELETE http://localhost:3000/api/products/rag/64a1b2c3d4e5f6789012345
```

### Get RAG System Stats
```bash
curl http://localhost:3000/api/products/rag/stats
```

## 🐛 Debug and Testing

### Debug Search
```bash
curl -X POST http://localhost:3000/api/products/debug-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "lip balm",
    "filters": {
      "brand": "nivea"
    }
  }'
```

## 📦 Product Management

### Create Product (Auto-syncs to RAG)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nivea Lip Balm Cherry",
    "description": "Moisturizing lip balm with cherry flavor",
    "brand": "Nivea",
    "categoryId": "64a1b2c3d4e5f6789012346",
    "gender": "unisex",
    "tags": ["lip care", "moisturizing", "cherry"]
  }'
```

### Get All Products
```bash
curl http://localhost:3000/api/products
```

## 📊 Response Structure Examples

### AI Search Response
```json
{
  "products": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "Nivea Lip Balm Cherry",
      "brand": "Nivea",
      "description": "Moisturizing lip balm with cherry flavor",
      "categoryId": {
        "_id": "64a1b2c3d4e5f6789012346",
        "name": "Lip Care"
      },
      "gender": "unisex",
      "tags": ["lip care", "moisturizing", "cherry"]
    }
  ],
  "hits_meta": [
    {
      "product_id": "64a1b2c3d4e5f6789012345",
      "distance": 0.234,
      "relevance_score": 0.876,
      "document": "nivea lip balm cherry moisturizing lip balm cherry flavor...",
      "metadata": {
        "name": "Nivea Lip Balm Cherry",
        "brand": "Nivea",
        "category": "Lip Care",
        "gender": "unisex",
        "price": 0,
        "tags": "lip care|moisturizing|cherry",
        "in_stock": true
      }
    }
  ],
  "ai_response": "I found some great lip balm options for you! The Nivea Lip Balm Cherry is perfect for dry lips with its moisturizing formula and delightful cherry flavor...",
  "agent_used": "openai",
  "used_fallback": false,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "total_pages": 2,
    "has_next": true,
    "has_prev": false
  },
  "filters_applied": {
    "brand": "nivea"
  },
  "debug": {
    "original_query": "lip balm for dry lips",
    "products_found": 8,
    "vector_search_worked": true,
    "max_distance": 1.2
  },
  "request_metadata": {
    "original_query": "lip balm for dry lips",
    "agent_used": "openai",
    "page_requested": 1,
    "limit_requested": 10,
    "filters_applied": {
      "brand": "nivea"
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response Example
```json
{
  "error": "AI service error",
  "message": "Failed to process search request",
  "details": "Query is required",
  "request_info": {
    "query": "",
    "agent": "openai",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🔧 Configuration

### Environment Variables
Make sure your `.env` file contains:
```env
MONGO_URI=mongodb://localhost:27017/ecommerce-ai
PORT=3000
```

### RAG System Configuration
Your Python RAG system should be running on `http://localhost:5050` with the following endpoints:
- `POST /search` - Main search endpoint
- `POST /sync` - Full sync
- `POST /sync-product` - Single product sync
- `POST /delete-product` - Delete product
- `GET /stats` - System statistics
- `GET /test` - Health check
- `POST /debug` - Debug search

## 🚨 Error Handling

The enhanced backend provides comprehensive error handling:

1. **Connection Errors (503)**: When RAG system is unavailable
2. **Validation Errors (400)**: When required parameters are missing
3. **Server Errors (500)**: When unexpected errors occur

All error responses include:
- Error type and message
- Detailed error information
- Request context
- Timestamp

## 📈 Performance Tips

1. **Use Pagination**: For large result sets, use `page` and `limit` parameters
2. **Apply Filters**: Use filters to narrow down results and improve performance
3. **Adjust max_distance**: Lower values (0.5-1.0) for more precise matches
4. **Monitor Stats**: Use `/api/products/rag/stats` to monitor system health

## 🔄 Workflow Examples

### Complete Product Lifecycle
```bash
# 1. Create a product (auto-syncs to RAG)
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "New Product", "brand": "Brand", ...}'

# 2. Search for the product
curl -X POST http://localhost:3000/api/products/ai-search \
  -H "Content-Type: application/json" \
  -d '{"query": "new product", "agent": "openai"}'

# 3. Check RAG system stats
curl http://localhost:3000/api/products/rag/stats

# 4. Delete product from RAG (if needed)
curl -X DELETE http://localhost:3000/api/products/rag/PRODUCT_ID
```

### Bulk Operations
```bash
# 1. Sync all products
curl -X POST http://localhost:3000/api/products/sync

# 2. Check sync status
curl http://localhost:3000/api/products/rag/stats

# 3. Test search after sync
curl -X POST http://localhost:3000/api/products/debug-search \
  -H "Content-Type: application/json" \
  -d '{"query": "test search"}'
```

This enhanced Node.js backend now provides full integration with your Python RAG system, including pagination, filtering, comprehensive error handling, and automatic synchronization!
