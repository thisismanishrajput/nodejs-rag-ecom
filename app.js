const express = require('express');
const cors = require('cors');
const app = express();

const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

app.use(cors());
app.use(express.json());

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

module.exports = app;
