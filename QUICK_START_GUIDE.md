# 🚀 Quick Start Guide - RAG E-commerce System

## ⚡ 5-Minute Setup

### 1. Start Services
```bash
# Terminal 1: Python RAG System
cd /path/to/python-rag-system
python app.py

# Terminal 2: Node.js Backend  
cd /Users/manish/Desktop/rag-system/ecom-backend
npm start
```

### 2. Test the System
```bash
# Health check
curl http://localhost:3000/health

# Test search
curl -X POST http://localhost:3000/api/products/ai-search \
  -H "Content-Type: application/json" \
  -d '{"query": "Do you have any Nivea products?", "agent": "openai"}'
```

## 🔍 How Search Works (Simple)

1. **User asks**: "Do you have any Nivea products?"
2. **Node.js** forwards query to Python RAG system
3. **Python** converts query to vector embedding
4. **ChromaDB** finds similar product vectors
5. **MongoDB** fetches full product details
6. **AI** generates helpful response
7. **User gets**: Clean JSON with products + AI explanation

## 📊 Current System Status
- ✅ **4 Products** in database
- ✅ **4 Vectors** in ChromaDB (synced)
- ✅ **2 AI Agents** (OpenAI + Gemini)
- ✅ **Auto-sync** working
- ✅ **Clean responses** (no embeddings exposed)

## 🎯 Key Endpoints

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `POST /api/products/ai-search` | Main search | `{"query": "lipstick", "agent": "openai"}` |
| `GET /api/products` | List products | `curl http://localhost:3000/api/products` |
| `POST /api/products` | Add product | Auto-syncs to RAG |
| `GET /api/products/rag/stats` | System stats | Check sync status |
| `GET /api/products/rag/health` | RAG health | Service status |

## 🔧 Common Tasks

### Add New Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "description": "Product description",
    "brand": "BrandName",
    "categoryId": "CATEGORY_ID",
    "gender": "unisex",
    "tags": ["tag1", "tag2"]
  }'
```

### Search with Filters
```bash
curl -X POST http://localhost:3000/api/products/ai-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "makeup products",
    "agent": "gemini",
    "filters": {"brand": "MAC", "gender": "Female"},
    "page": 1,
    "limit": 5
  }'
```

### Sync Products
```bash
# Full sync
curl -X POST http://localhost:3000/api/products/sync

# Single product sync
curl -X POST http://localhost:3000/api/products/sync/PRODUCT_ID
```

## 🐛 Troubleshooting

### RAG Service Not Responding
```bash
# Check if Python service is running
curl http://localhost:5050/test

# Restart Python service
cd /path/to/python-rag-system
python app.py
```

### No Search Results
```bash
# Check sync status
curl http://localhost:3000/api/products/rag/stats

# Force sync if needed
curl -X POST http://localhost:3000/api/products/sync
```

### Embeddings in Response
- ✅ **Fixed**: Embeddings are now removed from all responses
- ✅ **Clean JSON**: Only user-relevant data returned

## 📈 Performance Tips

1. **Use pagination**: `"page": 1, "limit": 10`
2. **Apply filters**: Reduce search scope
3. **Choose agent**: `"openai"` or `"gemini"`
4. **Monitor stats**: Check `/api/products/rag/stats`

## 🎉 Success Indicators

- ✅ Health checks return 200
- ✅ Search returns relevant products
- ✅ AI responses are helpful
- ✅ No embeddings in responses
- ✅ Auto-sync working
- ✅ Clean JSON structure

---

**Need more details?** Check `COMPREHENSIVE_SYSTEM_DOCUMENTATION.md` for complete technical documentation! 📚

