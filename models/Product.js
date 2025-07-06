const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  brand: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  gender: String,
  tags: [String],
});

module.exports = mongoose.model('Product', productSchema);
