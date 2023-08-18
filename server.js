/** @format */
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const userModel = require("./Models/userConnection");
const blogsModel = require("./Models/blogConnection");
const middleware = require("./middleware");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const app = express();

//third-party middlewares
app.use(express.json());
app.use(cors());

//Database connection
const DB_URL = process.env.DB_URL;
mongoose.connect(DB_URL).then((db, err) => {
  try {
    console.log("connected to the database");
  } catch (e) {
    console.log(e);
  }
});
let regex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

//post route
app.post("/register", async (req, res) => {
  try {
    const { username, email, password, confirmpassword } = req.body;
    let emailValid = regex.test(email);
    let exists = await userModel.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email is already existed" });
    } else if (username === "") {
      return res.status(400).json({ message: "Username required" });
    } else if (email === "") {
      return res.status(400).json({ message: "Email required" });
    } else if (!emailValid) {
      return res.status(400).json({ message: "Email is not valid" });
    } else if (password === "") {
      return res.status(400).json({ message: "Password required" });
    } else if (confirmpassword === "") {
      return res.status(400).json({ message: "confirmpassword required" });
    } else if (password !== confirmpassword) {
      return res.status(400).json({ message: "Password incorrect" });
    } else {
      await userModel.create(req.body);
      return res.status(200).json({ message: "registerd successfully" });
    }
  } catch (e) {
    console.log(e);
  }
});
//login user
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let exists = await userModel.findOne({ email });
    if (email === "") {
      return res.status(400).json({ message: "Email is required" });
    } else if (password === "") {
      return res.status(400).json({ message: "Password is required" });
    } else if (!exists) {
      return res.status(404).json({ message: "Email not existed" });
    } else if (exists.password !== password) {
      return res.status(400).json({ message: "password not matched" });
    } else {
      const payload = {
        user: {
          id: exists.id,
        },
      };
      jwt.sign(
        payload,
        "jwtSecret",
        { expiresIn: 3600000 },
        async (err, token) => {
          try {
            if (err) throw err;
            else {
              await res.json({ token });
            }
          } catch (e) {
            console.log(e);
          }
        }
      );
    }
  } catch (e) {
    console.log(e);
  }
});

//get all blogs API
app.get("/blogs", middleware, async (req, res) => {
  try {
    let exist = await userModel.findById(req.user.id);
    if (!exist) {
      return res.status(404).json({ message: "User not found" });
    } else {
      const allBlogs = await blogsModel.find({});
      return res.status(200).send(allBlogs);
    }
  } catch (e) {
    console.log(e);
  }
});

//Blogs post API
app.post("/addBlog", async (req, res) => {
  try {
    const { title, description } = req.body;
    await blogsModel.create(req.body);
    return res.status(200).json({ message: "Blog is posted" });
  } catch (e) {
    console.log(e);
  }
});

//Blogs Update API
app.patch("/addBlog/:id", async (req, res) => {
  try {
    await blogsModel.findByIdAndUpdate(req.params.id, req.body);
    return res.status(200).json({ message: "Blog Updated" });
  } catch (e) {
    console.log(e);
  }
});

//Delete blog API
app.delete("/:id", async (req, res) => {
  try {
    await blogsModel.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Blog is deleted" });
  } catch (e) {
    console.log(e);
  }
});

//server connection
app.listen(8080, () => {
  console.log("connected to the server");
});
