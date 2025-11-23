const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const StockIn = require('../models/StockIn');
const StockOut = require('../models/StockOut');
const Product = require('../models/Product');

// @route   POST api/stock/in
// @desc    Record incoming stock
// @access  Private
router.post('/in', auth, async (req, res) => {
    const { product, quantity, unitPrice, supplier } = req.body;

    try {
        // Create StockIn record
        const newStockIn = new StockIn({
            product,
            quantity,
            unitPrice,
            supplier
        });

        const stockIn = await newStockIn.save();

        // Update Product quantity (Trigger logic)
        const productDoc = await Product.findById(product);
        if (productDoc) {
            productDoc.quantity += parseInt(quantity);
            await productDoc.save();
        }

        res.json(stockIn);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/stock/in
// @desc    Get recent stock in entries
// @access  Private
router.get('/in', auth, async (req, res) => {
    try {
        const stockIn = await StockIn.find()
            .populate('product', ['name'])
            .populate('supplier', ['firstName', 'lastName'])
            .sort({ date: -1 })
            .limit(10);
        res.json(stockIn);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/stock/out
// @desc    Record outgoing stock (Bulk/Cart)
// @access  Private
router.post('/out', auth, async (req, res) => {
    const { cart, customerName } = req.body; // cart is array of { product, quantity, unitPrice, sellingPrice }

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ msg: 'No items in cart' });
    }

    try {
        // 1. Validate all items first
        for (const item of cart) {
            const productDoc = await Product.findById(item.product);
            if (!productDoc) {
                return res.status(404).json({ msg: `Product not found: ${item.product}` });
            }
            const qty = parseInt(item.quantity);
            if (productDoc.quantity < qty) {
                return res.status(400).json({ msg: `Insufficient stock for product: ${productDoc.name}` });
            }
        }

        // 2. Process items
        const createdRecords = [];
        const invoiceId = 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

        for (const item of cart) {
            const qty = parseInt(item.quantity);

            // Create StockOut record
            const newStockOut = new StockOut({
                product: item.product,
                quantity: qty,
                unitPrice: parseFloat(item.unitPrice),
                sellingPrice: parseFloat(item.sellingPrice),
                customerName,
                invoiceId,
                seller: req.user.id // Record the seller
            });

            const stockOut = await newStockOut.save();

            // Update Product quantity
            const productDoc = await Product.findById(item.product);
            productDoc.quantity -= qty;
            await productDoc.save();

            // Populate for response
            await stockOut.populate('product', 'name');
            createdRecords.push(stockOut);
        }

        res.json(createdRecords);
    } catch (err) {
        console.error('Stock Out Error:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   GET api/stock/out/my-sales
// @desc    Get sales made by the logged-in user
// @access  Private
router.get('/out/my-sales', auth, async (req, res) => {
    try {
        const stockOut = await StockOut.find({ seller: req.user.id })
            .populate('product', ['name'])
            .sort({ date: -1 });
        res.json(stockOut);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/stock/out
// @desc    Get recent stock out entries (with optional date filter)
// @access  Private
router.get('/out', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = {};

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59))
            };
        }

        const stockOut = await StockOut.find(query)
            .populate('product', ['name'])
            .sort({ date: -1 })
            .limit(startDate && endDate ? 0 : 20); // No limit if filtering, else recent 20

        res.json(stockOut);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/stock/out/invoice/:invoiceId
// @desc    Get stock out entries by invoice ID
// @access  Private
router.get('/out/invoice/:invoiceId', auth, async (req, res) => {
    try {
        const stockOut = await StockOut.find({ invoiceId: req.params.invoiceId })
            .populate('product', ['name']);
        res.json(stockOut);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
