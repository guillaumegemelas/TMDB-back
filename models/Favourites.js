const mongoose = require("mongoose");

const Favourite = mongoose.model("Favourite", {
  name: String,
  image: String,
  token: String,
  //---modif du model pour stocker le Id du user lors de l'ajout du favoris: ok!------------
  userId: String,
  //---------------
});

module.exports = Favourite;
