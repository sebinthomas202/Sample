const express = require('express');
var app = express.Router()

var User = require("../model/userModel");

app.post("/", async(req,res)=>{
    try{
        const {email,phonenumber}=req.body;
        const user = await User.findOne({ email });
  
        if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid email ' });

      }

      


    }
    catch(error){

    }
})