const mongoose = require('mongoose');

const StockInSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unitPrice: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number
    },
    date: {
        type: Date,
        default: Date.now
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier'
    }
});

// Pre-save hook to calculate total price
// Pre-save hook to calculate total price
StockInSchema.pre('save', function () {
    this.totalPrice = this.quantity * this.unitPrice;
});

module.exports = mongoose.model('StockIn', StockInSchema);
