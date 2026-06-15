import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all cart endpoints
router.use(authMiddleware);

// @route   GET /api/cart
// @desc    Get current user's cart
// @access  Private
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.userId }).populate('items.product');
    if (!cart) {
      // Create empty cart for new user
      cart = new Cart({ user: req.userId, items: [] });
      await cart.save();
    }
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/cart/add
// @desc    Add product to cart
// @access  Private
router.post('/add', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
    }

    // Check if product is already in cart
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (itemIndex > -1) {
      // Update quantity
      cart.items[itemIndex].quantity += parseInt(quantity);
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity: parseInt(quantity) });
    }

    await cart.save();
    const populatedCart = await cart.populate('items.product');
    res.json({ success: true, data: populatedCart, message: 'Product added to cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/cart/update
// @desc    Update item quantity in cart
// @access  Private
router.put('/update', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Product ID and quantity are required' });
    }

    const qty = parseInt(quantity);
    if (qty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not in cart' });
    }

    cart.items[itemIndex].quantity = qty;
    await cart.save();
    const populatedCart = await cart.populate('items.product');
    res.json({ success: true, data: populatedCart, message: 'Cart updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove product from cart
// @access  Private
router.delete('/remove/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();
    const populatedCart = await cart.populate('items.product');
    res.json({ success: true, data: populatedCart, message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/cart/clear
// @desc    Clear cart
// @access  Private
router.post('/clear', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    } else {
      cart = new Cart({ user: req.userId, items: [] });
      await cart.save();
    }
    res.json({ success: true, data: cart, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
