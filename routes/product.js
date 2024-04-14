var express = require("express");
var router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage(); // Store image in memory
const upload = multer({ storage: storage });
const Product=require("../model/product");
var User = require("../model/userModel");


router.get("/view-pro", async (req, res) => {
    try {
     
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  
  
  router.get("/view-prod/:productId", async (req, res) => {
    // console.log("aa");
    // res.json({ message: 'Route reached successfully' });
    const productId = req.params.productId;
  
    try {
        const product = await Product.findOne({ pid: productId });
  
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
  
        res.json(product);
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).send('Internal Server Error');
    }
  });

 // Route to add a product to the cart
 router.post('/cart/add', async (req, res) => {
    try {
      const { productId, email, quantity } = req.body;
  
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Check if the product is already in the user's cart
      const cartItemIndex = user.cart.findIndex(item => item.product.equals(productId));
  
      if (cartItemIndex !== -1) {
        // If the product is already in the cart, update the quantity
        user.cart[cartItemIndex].quantity += quantity;
      } else {
        // If the product is not in the cart, add it with the provided quantity
        user.cart.push({
          product: productId,
          quantity: quantity
        });
      }
  
      // Increment the cartQuantity field in the product schema
      product.cartQuantity += quantity;
  

      await Promise.all([user.save(), product.save()]);
  
      res.status(200).json({ message: 'Product added to cart successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  
  
  // Route to get the user's cart
router.get('/cart/:email', async (req, res) => {
    try {
        const email = req.params.email;

        const user = await User.findOne({ email }).populate('cart.product');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user.cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

  
  
  // Route to update the user's cart
  router.put('/cart/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const { productId, quantity } = req.body; 

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const cartItem = user.cart.find(item => item.product.equals(productId));

        if (!cartItem) {
            return res.status(404).json({ error: 'Product not found in cart' });
        }

        cartItem.quantity = quantity;

        await user.save();

        res.status(200).json({ message: 'Cart updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.delete('/cart/:email/:productId', async (req, res) => {
  try {
    const email = req.params.email;
    const productId = req.params.productId;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the index of the item in the cart
    const index = user.cart.findIndex(item => item.product.equals(productId));

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    // Remove the item from the cart array
    user.cart.splice(index, 1);

    await user.save();

    res.status(200).json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.get('/search', async (req, res) => {
  const { query } = req.query;
  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } }, 
        { companyName: { $regex: query, $options: 'i' } } 
      ]
    });
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.delete('/cart/:email/:productId', async (req, res) => {
  const { email, productId } = req.params;

  try {
    // Find the user by email
    console.log("aa")
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove the item from the cart based on the product ID
    user.cart = user.cart.filter(item => String(item.product) !== productId);

    // Save the updated user object
    await user.save();

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.get('/categories-fetch', async (req, res) => {
  try {
      const categories = await Product.distinct('category');
      res.json(categories);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/products-fetch/:category', async (req, res) => {
  const category = req.params.category;
  try {
      const products = await Product.find({ category });
      res.json(products);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
  }
});


  module.exports=router