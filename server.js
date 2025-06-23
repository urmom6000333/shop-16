const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'public', 'products.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // handle base64 images
app.use(express.static(path.join(__dirname, 'public')));

// API: Get all products
app.get('/api/products', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE);
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Failed to read products.json' });
  }
});

// API: Update a specific product
app.post('/api/products/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const products = JSON.parse(fs.readFileSync(DATA_FILE));
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    products[index] = { ...products[index], ...req.body };
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
