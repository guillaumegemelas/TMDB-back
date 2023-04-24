const mongoose = require("mongoose");

const Favourite = mongoose.model("Favourite", {
  name: String,
  image: String,
  token: String,
  //   user: String,
});

module.exports = Favourite;
