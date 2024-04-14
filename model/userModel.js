const mongoose = require("mongoose");

const FeedbackSchema = mongoose.Schema({
  message: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  orderNumber: String, // Add orderNumber field
  date: {
    type: Date,
    default: Date.now
  }
});

const ComplaintSchema = mongoose.Schema({
  message: String,
  orderNumber: String, // Add orderNumber field
  date: {
    type: Date,
    default: Date.now
  }
});

const UserSchema = mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  phoneNumber: String,
  addresses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  }],
  password: String,
  resetPasswordOTP: Number,
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number
  }],
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  feedbacks: [FeedbackSchema],
  complaints: [ComplaintSchema],
  emailVerificationOTP: String,
  isEmailVerified: {
    type: Boolean,
    default: false
  } // Use the ComplaintSchema for complaints
});

module.exports = mongoose.model("User", UserSchema);
