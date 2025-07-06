const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();
let PORT = process.env.PORT || 5000;  // Use let instead of const
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  PORT = 3000; // Now it is allowed to reassign
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('MongoDB connection failed:', err);
});
