const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Supplier = require('../models/Supplier');

// @route   GET api/suppliers
// @desc    Get all suppliers
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const suppliers = await Supplier.find()
            .populate('company', ['name'])
            .populate('products', ['name'])
            .sort({ date: -1 });
        res.json(suppliers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/suppliers
// @desc    Add new supplier
// @access  Private
router.post('/', auth, async (req, res) => {
    const {
        firstName,
        lastName,
        address,
        supplyDate,
        agreementDate,
        terminationDate,
        products,
        company
    } = req.body;

    try {
        const newSupplier = new Supplier({
            firstName,
            lastName,
            address,
            supplyDate,
            agreementDate,
            terminationDate,
            products,
            company
        });

        const supplier = await newSupplier.save();
        res.json(supplier);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/suppliers/:id
// @desc    Update supplier
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const {
        firstName,
        lastName,
        address,
        supplyDate,
        agreementDate,
        terminationDate,
        products,
        company
    } = req.body;

    // Build supplier object
    const supplierFields = {};
    if (firstName) supplierFields.firstName = firstName;
    if (lastName) supplierFields.lastName = lastName;
    if (address) supplierFields.address = address;
    if (supplyDate) supplierFields.supplyDate = supplyDate;
    if (agreementDate) supplierFields.agreementDate = agreementDate;
    if (terminationDate) supplierFields.terminationDate = terminationDate;
    if (products) supplierFields.products = products;
    if (company) supplierFields.company = company;

    try {
        let supplier = await Supplier.findById(req.params.id);

        if (!supplier) return res.status(404).json({ msg: 'Supplier not found' });

        supplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            { $set: supplierFields },
            { new: true }
        );

        res.json(supplier);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/suppliers/:id
// @desc    Delete supplier
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let supplier = await Supplier.findById(req.params.id);

        if (!supplier) return res.status(404).json({ msg: 'Supplier not found' });

        await Supplier.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Supplier removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
