const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  const ownerToken = req.headers.authorization.replace("Bearer ", "");
  const owner = await User.findOne({ token: ownerToken });
  if (owner) {
    req.user = owner;
    next();
  } else {
    return res.status(401).json("Unauthorized");
  }
};

module.exports = isAuthenticated;
