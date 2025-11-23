const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    supplyDate: {
        type: Date
    },
    agreementDate: {
        type: Date
    },
    terminationDate: {
        type: Date
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    }
});

module.exports = mongoose.model('Supplier', SupplierSchema);
