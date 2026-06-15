import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// ─── GET All Products with Search & Filter ────────────────────────────────────
// GET /api/products?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      category = '',
      minPrice = 0,
      maxPrice = Infinity,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
      isActive,
    } = req.query;

    // Build filter object
    const filter = {};

    // Text search
    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Price range filter
    filter.price = {
      $gte: parseFloat(minPrice) || 0,
      ...(maxPrice !== 'Infinity' && maxPrice
        ? { $lte: parseFloat(maxPrice) }
        : {}),
    };

    // Active status filter
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Sort configuration
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortConfig = { [sort]: sortOrder };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortConfig).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limitNum),
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET Single Product ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── CREATE Product ───────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category, stock, imageUrl, isActive } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      imageUrl,
      isActive,
    });

    const savedProduct = await product.save();
    res.status(201).json({ success: true, data: savedProduct, message: 'Product created successfully' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── UPDATE Product ───────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, category, stock, imageUrl, isActive } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, stock, imageUrl, isActive },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── DELETE Product ───────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET Product Stats ────────────────────────────────────────────────────────
router.get('/stats/overview', async (req, res) => {
  try {
    const [totalProducts, activeProducts, categoryCounts, avgPrice] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$stock' } } },
        { $sort: { count: -1 } },
      ]),
      Product.aggregate([{ $group: { _id: null, avgPrice: { $avg: '$price' } } }]),
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        inactiveProducts: totalProducts - activeProducts,
        categoryCounts,
        avgPrice: avgPrice[0]?.avgPrice?.toFixed(2) || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
