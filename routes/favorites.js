const express = require("express");
const router = express.Router();

// Import du middleware isAuthenticated
const isAuthenticated = require("../middlewares/isAuthenticated");

//import du modèle mongoose
const Favourite = require("../models/Favourites");
//-------import du modèle mongoose User pour récup et envoie Id lors de l'ajout d'un favoris(userId-----------------------------------
const User = require("../models/User");
//--------------------------------------

//route 1 pour ajouter des favoris en post:-----------
router.post("/addfavourites", isAuthenticated, async (req, res) => {
  try {
    const { image, name, token } = req.body;

    //------------test recup user avec token--------------------------------
    const userToPick = await User.findOne({ token: token });
    let userId = userToPick._id;
    console.log(userId);
    //-------------fin test recup user token--------------------------------

    //declaration nouveau favori
    const newFavourite = new Favourite({
      name: name,
      image: image,
      token: token,
      //--ajout de userId lors de addfavourites--------------------------------------------
      userId: userToPick._id,
      //----------------------------------------------
    });

    //vérification si le favori est déjà présent en base de données: avec token ET name
    // pour être sure que chacun puisse ajouter favori (si valide que sur le nom, alors deux
    //user différents ne peuvent pas ajouter le meme favori car le nom existe deja en BDD)
    const newFavAlreadyAdded = await Favourite.findOne({ name, token });

    //------voir si on met plutot le userId au lieu du token si il change avec la modif du profil--------------------
    // const newFavAlreadyAdded = await Favourite.findOne({ name, userId });
    //------------------------------------------------

    if (newFavAlreadyAdded) {
      return res.status(409).json({ message: "Favourite already added" });
    }
    //enregistrement nouveau fav en BDD
    await newFavourite.save();

    //déclaration réponse au client
    const clientResponse = {
      name: newFavourite.name,
      image: newFavourite.image,
    };
    //réponse
    res.status(200).json(clientResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//route2 pour récupérer les favoris en get: requete ok postman--------------------------
router.get(
  "/favourites",
  //ajout isAuth pour authentification: ça fonctionne!
  isAuthenticated,
  async (req, res) => {
    try {
      const favourites = await Favourite.find();
      res.json({ favourites: favourites });
    } catch (error) {
      console.log(error.message);
      res.status(400).json({ message: error.message });
    }
  }
);

//route2 bis TEST pour récupérer les favoris en get: requete ok postman: avantage: ne renvoie que les favoris reliés à l'Id du User: en front pas besoin de faire un token vérif--------------------------
router.get(
  "/favourites/:id",
  //ajout isAuth pour authentification: ça fonctionne!
  isAuthenticated,
  async (req, res) => {
    const id = req.params.id;
    console.log(id);
    try {
      const favouritesbyId = await Favourite.find({ userId: id });
      res.json({ favourites: favouritesbyId });
    } catch (error) {
      console.log(error.message);
      res.status(400).json({ message: error.message });
    }
  }
);

//route3 pour supprimer des favoris+++++++++++++++++++++++++++++++++++++++++++++++++++
router.delete("/favourites/delete/:id", isAuthenticated, async (req, res) => {
  try {
    favToDelete = await Favourite.findById(req.params.id);
    console.log(req.params.id, "params id++++++++++++++++");
    console.log(favToDelete, "favtodelete-----------------");
    await favToDelete.deleteOne();
    //utilisation de deleteOne() car .delete() is not a function
    const favourites = await Favourite.find();
    res.json({ favourites: favourites });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

// router.delete("/");

module.exports = router;
