/** @format */
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const middleware = require("./middleware");
const userModel = require("./Models/userConnection");
const express = require("express");
const cors = require("cors");
const blogModel = require("./Models/blogConnection");
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

//register
app.post("/register", async (req, res) => {
  try {
    const { username, email, password, confirmpassword } = req.body;
    let exists = await userModel.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already existed" });
    } else if (username === "") {
      return res.status(400).json({ message: "User name is required" });
    } else if (email === "") {
      return res.status(400).json({ message: "Email is required" });
    } else if (password === "") {
      return res.status(400).json({ message: "Password is required" });
    } else if (confirmpassword === "") {
      return res.status(400).json({ message: "Confirm password is required" });
    } else if (password !== confirmpassword) {
      return res.status(400).json({ message: "Password not matched" });
    } else {
      await userModel.create(req.body);
      return res.status(200).json({ message: "registration successfull" });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).send("Internal server error");
  }
});

//login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let exists = await userModel.findOne({ email });
    if (!exists) {
      return res.status(404).send({ message: "Email not found" });
    } else if (email === "") {
      return res.status(400).send({ message: "Email is required" });
    } else if (password === "") {
      return res.status(400).send({ message: "Password is required" });
    } else if (exists.password !== password) {
      return res.status(404).json({ message: "incorrect password" });
    }
    const payload = {
      user: {
        id: exists.id,
      },
    };
    jwt.sign(payload, "jwtSecret", { expiresIn: 3600000 }, (err, token) => {
      try {
        if (err) throw err;
        res.json({ token });
      } catch (e) {
        console.log(e);
        return res.status(500).send({ message: "Token not generated" });
      }
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send("Internal server error");
  }
});
//blog Apis
app.get("/blogs", middleware, async (req, res) => {
  try {
    const exists = await userModel.findById(req.user.id);
    if (!exists) {
      return res.status(404).send({ message: "User not existed" });
    } else {
      const resObj = await blogModel.find({});
      res.status(200).send(resObj);
    }
  } catch (e) {
    console.log(e);
  }
});
app.post("/addBlog", async (req, res) => {
  try {
    const { title, description } = req.body;
    await blogModel.create(req.body);
    res.status(200).json({ message: "Blog posted" });
  } catch (e) {
    console.log(e);
  }
});

app.patch("/blog/:id", async (req, res) => {
  try {
    await blogModel.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({ message: "Blog Updated" });
  } catch (e) {
    console.log(e);
  }
});
app.delete("/blog/:id", async (req, res) => {
  try {
    await blogModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Blog deleted" });
  } catch (e) {
    console.log(e);
  }
});

//server connection
app.listen(8080, () => {
  console.log("connected to the server");
});
