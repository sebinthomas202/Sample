const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: { type: String, required: true },
    companyName: { type: String },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    stock: { type: Number, required: true },
    image: {
        data: Buffer,
        contentType: String
    },
    pid: { type: Number, required: true },
    // Add a field to track the quantity in cart
    cartQuantity: { type: Number, default: 0 } // Default to 0 when not in cart
});


module.exports = mongoose.model('Product',productSchema);