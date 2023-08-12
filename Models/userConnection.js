/** @format */

const mongoose = require("mongoose");
const userModel = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    trim: true,
  },
  confirmpassword: {
    type: String,
    trim: true,
  },
});
const userConnection = new mongoose.model("userslist", userModel);
module.exports = userConnection;
