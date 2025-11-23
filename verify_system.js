const mongoose = require('mongoose');
const Product = require('./models/Product');
const StockOut = require('./models/StockOut');
const User = require('./models/User');
require('dotenv').config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const productCount = await Product.countDocuments();
        console.log(`Products: ${productCount}`);

        const stockOutCount = await StockOut.countDocuments();
        console.log(`StockOuts: ${stockOutCount}`);

        const userCount = await User.countDocuments();
        console.log(`Users: ${userCount}`);

        if (stockOutCount > 0) {
            const stockOuts = await StockOut.find();
            const totalRevenue = stockOuts.reduce((acc, curr) => acc + (curr.sellingPrice * curr.quantity), 0);
            console.log(`Calculated Revenue: ${totalRevenue}`);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verify();
