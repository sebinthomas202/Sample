const express = require('express');
const router = express.Router();
const Order = require('../model/orderModel');
const User = require('../model/userModel');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'grocerygo000@gmail.com',
    pass: 'cnqe cryf vpma xwui'
  }
});

// Route to place an order
router.post('/checkout', async (req, res) => {
  console.log("Order placed");
  try {
    const { userEmail, products, totalAmount, paymentMethod, orderType,address } = req.body;

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log(user._id);

    const newOrder = new Order({
      orderId: uuidv4(),
      customer: user._id,
      products: products,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      status: 'Pending',
      orderType: orderType, // Include orderType
      address: address,
    });

    await newOrder.save();

    await User.findByIdAndUpdate(user._id, { $push: { orders: newOrder._id } });

    await User.findOneAndUpdate(
      { email: userEmail },
      { $set: { cart: [] } }
    );

    // Send order confirmation email
    // transporter.sendMail({
    //   from: 'grocerygo000@gmail.com',
    //   to: userEmail,
    //   subject: 'Order Confirmation',
    //   html: `
    //     <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
    //       <h1 style="color: #333333; text-align: center;">Order Confirmation</h1>
    //       <div style="background-color: #ffffff; border-radius: 10px; padding: 20px; box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.1);">
    //         <p>Thank you for your order. Here are your order details:</p>
    //         <p style="margin-bottom: 10px;"><strong>Order ID:</strong> ${newOrder.orderId}</p>
    //         <p style="margin-bottom: 10px;"><strong>Total Amount:</strong> Rs.${totalAmount}</p>
    //         <p style="margin-bottom: 10px;"><strong>Status:</strong> ${newOrder.status}</p> <!-- Include status -->
    //         <p style="margin-bottom: 0;"><strong>Expected Delivery Date:</strong> ${calculateExpectedDeliveryDate()}</p>
    //       </div>
    //     </div>
    //   `
    // });

    res.status(200).json({ success: true, message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
});

function calculateExpectedDeliveryDate() {
  const today = new Date();
  const cutoffTime = 17;

  if (today.getHours() < cutoffTime || (today.getHours() === cutoffTime && today.getMinutes() === 0)) {
    return today.toDateString();
  } else {
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    return nextDay.toDateString();
  }
}

router.get('/orders/:email', async (req, res) => {
  try {
    const { email } = req.params;
    // Find the user by email
    const user = await User.findOne({ email }).populate({
      path: 'orders',
      populate: {
        path: 'products.product',
        model: 'Product' // Replace 'Product' with your actual product model name
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract orders from the user and send as response
    const orders = user.orders;
    res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});




module.exports = router;
