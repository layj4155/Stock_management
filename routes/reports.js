const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const StockIn = require('../models/StockIn');
const StockOut = require('../models/StockOut');

// @route   GET api/reports/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalSuppliers = await Supplier.countDocuments();

        // Calculate total stock value
        const products = await Product.find();
        const totalStockValue = products.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);

        // Calculate total sales (StockOut)
        const stockOuts = await StockOut.find();
        const totalSales = stockOuts.reduce((acc, curr) => acc + curr.totalProfit, 0); // Using totalProfit as a proxy for "sales performance" or just total revenue? 
        // Let's use total revenue (sellingPrice * quantity)
        const totalRevenue = stockOuts.reduce((acc, curr) => acc + (curr.sellingPrice * curr.quantity), 0);

        res.json({
            totalProducts,
            totalSuppliers,
            totalStockValue,
            totalRevenue
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
