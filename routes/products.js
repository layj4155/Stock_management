const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');

// @route   GET api/products
// @desc    Get all products
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const products = await Product.find().sort({ name: 1 });
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/products
// @desc    Add new product
// @access  Private
router.post('/', auth, async (req, res) => {
    const { name, quantity, unitPrice, mfgDate, expDate } = req.body;

    try {
        const newProduct = new Product({
            name,
            quantity,
            unitPrice,
            mfgDate,
            expDate
        });

        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/products/:id
// @desc    Update product
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { name, quantity, unitPrice, mfgDate, expDate } = req.body;

    // Build product object
    const productFields = {};
    if (name) productFields.name = name;
    if (quantity !== undefined) productFields.quantity = quantity;
    if (unitPrice !== undefined) productFields.unitPrice = unitPrice;
    if (mfgDate) productFields.mfgDate = mfgDate;
    if (expDate) productFields.expDate = expDate;

    try {
        let product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ msg: 'Product not found' });

        product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: productFields },
            { new: true }
        );

        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/products/:id
// @desc    Delete product
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ msg: 'Product not found' });

        await Product.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
