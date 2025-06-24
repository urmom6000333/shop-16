const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'public', 'products.json');

// Setup multer for image uploads
const upload = multer({ dest: path.join(__dirname, 'public', 'images') });  // Save images to public/images/

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

    // Merge the new product data (from request body) with the existing product data
    products[index] = { ...products[index], ...req.body };
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// API: Upload image for a specific product (only admin can do this)
app.post('/api/products/:id/upload', upload.single('image'), (req, res) => {
  const id = parseInt(req.params.id);

  // Check if the image was uploaded successfully
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  // Create image path relative to the public folder
  const imagePath = `/images/${req.file.filename}`;

  try {
    const products = JSON.parse(fs.readFileSync(DATA_FILE));
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update the product image
    products[index].image = imagePath;

    // Write the updated product data back to products.json
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));

    res.json({ message: 'Image uploaded and product updated', imagePath });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product with new image' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
