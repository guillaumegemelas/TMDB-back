const mongoose = require("mongoose");

const User = mongoose.model("User", {
  username: String,
  email: String,
  token: String,
  hash: String,
  salt: String,
  //test ajout avatar pour comprendre cloudinary------------------------
  picture: Object,
  //--------------------------------------------------------------------
});

module.exports = User;
