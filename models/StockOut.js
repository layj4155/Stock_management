const mongoose = require('mongoose');

const StockOutSchema = new mongoose.Schema({
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
    sellingPrice: {
        type: Number,
        required: true
    },
    profitPerUnit: {
        type: Number
    },
    totalProfit: {
        type: Number
    },
    date: {
        type: Date,
        default: Date.now
    },
    customerName: {
        type: String
    },
    invoiceId: {
        type: String,
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Pre-save hook to calculate profits
// Pre-save hook to calculate profits
StockOutSchema.pre('save', function () {
    this.profitPerUnit = this.sellingPrice - this.unitPrice;
    this.totalProfit = this.profitPerUnit * this.quantity;
});

module.exports = mongoose.model('StockOut', StockOutSchema);
