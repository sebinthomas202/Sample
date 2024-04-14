const mongoose = require("mongoose");

const OrderSchema = mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manager'
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: Number
    }],
    totalAmount: Number,
    orderDate: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ['UPI', 'Cash'], 
        required: true 
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Shipped', 'Ready to take'],
        default: 'Pending'
    },
    orderType: {
        type: String,
        enum: ['Takeaway', 'Home Delivery'],
        required: true
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address' 
    },
    acceptedAt: {
        type: Date,
        default: null
    },
    declinedAt: {
        type: Date,
        default: null
    },
    shippedAt: {
        type: Date,
        default: null
    },
    deliveryPerson: {
        type: String,
        default: null
    },
});

module.exports = mongoose.model("Order", OrderSchema);
