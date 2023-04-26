const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

//test envoi photo style avatar pour comprendre mécanique cloudinary-----------------
const cloudinary = require("cloudinary").v2;
//---------------------------------------------------------------------------------

const app = express();
app.use(express.json());
app.use(cors());

//connection à la DB
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URI);

//---------------------------------------------------------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
//---------------------------------------------------------------------------------

//route test: le serveur fonctionne!--------
app.get("/", (req, res) => {
  res.json({ message: "Hi" });
});

//routes movie et movie par id fonctionnent
//il va falloir ensuite faire un peu de css sur le front
//puis faire page login et signup sur le font
//ensuite ajouter routes login et signup au niveau du back
//avec mise en base de données mogoose pour les signup (modèle User)
//voir l'utilité d'un middleware isAutenthicated

//ROUTE Movies
const moviesRoutes = require("./routes/movies");
app.use(moviesRoutes);

//ROUTE User
const userRoutes = require("./routes/user");
app.use(userRoutes);

//ROUTE Favourites
const favouriteRoutes = require("./routes/favorites");
app.use(favouriteRoutes);

//ROUTE Cast
const castRoutes = require("./routes/cast");
app.use(castRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "This routes doesn't exist" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Serveur started 😀");
});
