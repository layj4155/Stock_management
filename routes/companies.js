const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Company = require('../models/Company');

// @route   GET api/companies
// @desc    Get all companies
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const companies = await Company.find().sort({ name: 1 });
        res.json(companies);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/companies
// @desc    Add new company
// @access  Private
router.post('/', auth, async (req, res) => {
    const { name, telephone, location } = req.body;

    try {
        const newCompany = new Company({
            name,
            telephone,
            location
        });

        const company = await newCompany.save();
        res.json(company);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/companies/:id
// @desc    Update company
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { name, telephone, location } = req.body;

    // Build company object
    const companyFields = {};
    if (name) companyFields.name = name;
    if (telephone) companyFields.telephone = telephone;
    if (location) companyFields.location = location;

    try {
        let company = await Company.findById(req.params.id);

        if (!company) return res.status(404).json({ msg: 'Company not found' });

        company = await Company.findByIdAndUpdate(
            req.params.id,
            { $set: companyFields },
            { new: true }
        );

        res.json(company);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/companies/:id
// @desc    Delete company
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let company = await Company.findById(req.params.id);

        if (!company) return res.status(404).json({ msg: 'Company not found' });

        await Company.findByIdAndRemove(req.params.id);

        res.json({ msg: 'Company removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
