const express = require('express');
var app = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Address=require('../model/address');
const otpGenerator = require("otp-generator");

var User = require("../model/userModel");

// app.post('/api/register', async (req, res) => {
//     try {
  
//       const { email, firstName, lastName, phoneNumber, password } = req.body;
  
  
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//         return res.status(400).json({ error: 'Email is already registered' });
//       }
  

//       const newUser = new User({ email, firstName, lastName, phoneNumber, password });
  
 
//       const savedUser = await newUser.save();
  
//       res.json(savedUser);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });
  
  
  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
  
      const user = await User.findOne({ email });
  
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      // Successful login
      res.json({ message: 'Login successful', user: { id: user._id, email: user.email } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/api/forgot-password', async (req, res) => {
    try {
      const { email,phoneNumber } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'Email not found' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000);
  

      user.resetPasswordOTP = otp;
      await user.save();
 
      const transporter = nodemailer.createTransport({
        // configure nodemailer with your email service details
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'grocerygo000@gmail.com',
          pass: 'cnqe cryf vpma xwui',
        },
      });
  
      const mailOptions = {
        from: 'grocerygo000@gmail.com',
        to: email,
        subject: 'Password Reset OTP',
        html: `
          <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #333; font-weight: bold;">Password Reset OTP</h2>
            <p style="font-size: 16px; color: #555;">Dear User,</p>
            <p style="font-size: 16px; color: #555;">Your OTP for password reset is: <span style="color: #FFA500; font-weight: bold;">${otp}</span></p>
            <p style="font-size: 14px; color: #777;">Please use this OTP to reset your password.</p>
            <p style="font-size: 14px; color: #777;">If you did not request a password reset, please ignore this email.</p>
          </div>
        `,
      };
      
  
      await transporter.sendMail(mailOptions);
  
      res.json({ message: 'OTP sent to your email for password reset' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  app.post('/api/reset-password', async (req, res) => {
    try {
      const {  otp, newPassword } = req.body;
  
      const user = await User.findOne({
        resetPasswordOTP: otp,
      });
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid OTP' });
      }
  
      // Update the password
      user.password = newPassword;
      user.resetPasswordOTP = undefined;
      await user.save();
  
      res.json({ message: 'Password reset successful' });
      console.log("Password reset successful")
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



  // Route to save an address and associate it with a user
app.post('/api/addresses', async (req, res) => {
  console.log("got")
  try {
    const { userEmail, houseNo, streetName, city, district, landmark, pincode, mobileNumber } = req.body;

    // Find the user by email
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a new address
    const newAddress = new Address({
      houseNo,
      streetName,
      city,
      district,
      landmark,
      pincode,
      mobileNumber,
    });

    // Save the address
    await newAddress.save();

    // Add the new address to the user's addresses array
    user.addresses.push(newAddress);

    // Save the updated user
    await user.save();

    res.status(201).json(newAddress);
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/api/users/:userEmail/addresses', async (req, res) => {
  try {
    // console.log("a");
    const userEmail = req.params.userEmail;

    // Find user by email and populate addresses
    const user = await User.findOne({ email: userEmail }).populate('addresses');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user.addresses);
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/feedback', async (req, res) => {
  try {
    const { email, message, rating, orderNumber } = req.body;
    
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add feedback to the user's feedbacks array
    user.feedbacks.push({ message, rating, orderNumber }); // Include orderNumber if provided
    await user.save();

    res.status(201).json({ message: 'Feedback added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/complaint', async (req, res) => {
  try {
    const { email, message, rating, orderNumber } = req.body;
    
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add complaint to the user's complaints array
    user.complaints.push({ message, rating, orderNumber }); // Include orderNumber if provided
    await user.save();

    res.status(201).json({ message: 'Complaint added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});




async function sendVerificationEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    // Configure your email transporter here
    service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
    auth: {
      user: 'grocerygo000@gmail.com',
      pass: 'cnqe cryf vpma xwui'
    }
  });

  const mailOptions = {
    from: 'grocerygo000@gmail.com',
    to: email,
    subject: 'Email Verification',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <h2 style="color: #333;">Email Verification</h2>
        <p style="color: #555; font-size: 16px;">Your verification code is: <strong style="color: #FFA500; font-size: 20px;">${otp}</strong></p>
      </div>
    `
  };
  

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
}




app.post("/api/register", async (req, res) => {
  try {
    const { email, firstName, lastName, phoneNumber, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

    // Send OTP via email
    await sendVerificationEmail(email, otp);

    // Store OTP in the database or update if user exists but not verified
    if (existingUser) {
      existingUser.emailVerificationOTP = otp;
      await existingUser.save();
      return res.json({ message: 'OTP sent again. Check your email for verification.' });
    }

    // Store OTP in the database for new user
    const newUser = new User({ email, firstName, lastName, phoneNumber, password, emailVerificationOTP: otp });
    const savedUser = await newUser.save();

    res.json({ message: 'User registered successfully. Check your email for verification.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post("/api/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerificationOTP !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
  


  module.exports = app;