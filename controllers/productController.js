const Product = require('../models/Product');
const axios = require('axios');

exports.addProduct = async (req, res) => {
  try {
    const { name, description, brand, categoryId, gender, tags } = req.body;
    const product = new Product({ name, description, brand, categoryId, gender, tags });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('categoryId');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.aiSearch = async (req, res) => {
  try {
    const { query, agent } = req.body; // <- include agent
    console.log("🔍 AI Search Query:", query, "Agent:", agent);
    const response = await axios.post('http://localhost:5050/search', {
      query,
      agent: agent || 'openai', // fallback to openai if not provided
    });
    res.json(response.data);
  } catch (err) {
    console.error("❌ AI Service Error:", err?.response?.data || err.message);
    res.status(500).json({ message: 'AI service error', error: err.message });
  }
};

