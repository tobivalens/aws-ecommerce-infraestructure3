const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const productos = await Product.findAll();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products  (para pruebas/seed)
router.post('/', async (req, res) => {
  try {
    const nuevo = await Product.create(req.body);
    res.json(nuevo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
