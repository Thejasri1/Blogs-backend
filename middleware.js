/** @format */

const jwt = require("jsonwebtoken");
module.exports = async (req, res, next) => {
  try {
    const token = await req.header("x-token");
    if (!token) {
      return res.status(404).send("Token not found");
    } else {
      const decode = jwt.verify(token, "jwtSecret");
      req.user = decode.user;
      next();
    }
  } catch (e) {
    return res.status(500).send("internal server error");
  }
};
