const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    unitPrice: {
        type: Number,
        required: true,
        default: 0.00
    },
    mfgDate: {
        type: Date
    },
    expDate: {
        type: Date
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for total price
ProductSchema.virtual('totalPrice').get(function () {
    return this.quantity * this.unitPrice;
});

module.exports = mongoose.model('Product', ProductSchema);
