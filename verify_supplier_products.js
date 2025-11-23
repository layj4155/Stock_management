const mongoose = require('mongoose');
const Supplier = require('./models/Supplier');
const Product = require('./models/Product');
require('dotenv').config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Find some products
        const products = await Product.find().limit(2);
        if (products.length < 2) {
            console.log('Not enough products to test multi-select. Please create at least 2 products.');
            process.exit(0);
        }

        const productIds = products.map(p => p._id);
        console.log('Testing with Product IDs:', productIds);

        // Create a test supplier
        const newSupplier = new Supplier({
            firstName: 'Test',
            lastName: 'MultiProduct',
            products: productIds
        });

        const savedSupplier = await newSupplier.save();
        console.log('Saved Supplier:', savedSupplier);

        // Verify retrieval
        const fetchedSupplier = await Supplier.findById(savedSupplier._id).populate('products');
        console.log('Fetched Supplier Products:', fetchedSupplier.products.map(p => p.name));

        if (fetchedSupplier.products.length === 2) {
            console.log('SUCCESS: Supplier has multiple products.');
        } else {
            console.log('FAILURE: Supplier product count mismatch.');
        }

        // Cleanup
        await Supplier.findByIdAndDelete(savedSupplier._id);
        console.log('Test Supplier Deleted');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verify();
