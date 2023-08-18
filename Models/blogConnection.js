/** @format */

const mongoose = require("mongoose");
const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
});
const blogModel = new mongoose.model("BlogsList", BlogSchema);
module.exports = blogModel;
