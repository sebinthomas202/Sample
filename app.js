require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
var user=require("./routes/route")
var product=require("./routes/product");
var orderRoutes=require('./routes/orderRoutes')



const app = express();

app.use(cors());
const PORT = process.env.PORT || 3001;

mongoose.connect('mongodb+srv://grocerygo6:Qwe4321@grocerygo.sjw6252.mongodb.net/?retryWrites=true&w=majority&appName=GroceryGo' );

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(user);
app.use(product);
app.use(orderRoutes);
