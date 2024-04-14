const mongoose = require("mongoose");

const AddressSchema = mongoose.Schema({
  houseNo: String,
  streetName: String,
  city: String,
  district: String,
  landmark: String,
  pincode: String,
  mobileNumber: String
});

module.exports = mongoose.model("Address", AddressSchema);
