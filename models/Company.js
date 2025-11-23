const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    telephone: {
        type: String
    },
    location: {
        type: String
    }
});

module.exports = mongoose.model('Company', CompanySchema);
