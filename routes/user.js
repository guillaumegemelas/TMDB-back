const express = require("express");

//test ajout fileUpload() pour  comprendre mécanisme Coulinary----------------------------
const fileUpload = require("express-fileupload");
const convertToBase64 = require("../utils/convertToBase64");
const cloudinary = require("cloudinary").v2;
//--------------------------------------------------------------------------------------------

//packages installés: crypto-js et uid2
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const router = express.Router();

const User = require("../models/User");
const isAuthenticated = require("../middlewares/isAuthenticated");

//import du modèle Favourites pour mise à jour du token pour les favoris
const Favourite = require("../models/Favourites");

//Route1 signup: fonctionne avec Postman
router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    const { username, email, password, passwordConf } = req.body;
    const { picture } = req.files.picture;

    //si un parmaètre est manquant, message d'erreur
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing parameter" });
    }

    //si email existe déjà:
    const emailAlreadyUsed = await User.findOne({ email });

    if (emailAlreadyUsed) {
      return res.status(409).json({ message: "This email is already used" });
    }

    //si le username existe déjà
    const usernameAlreadyUsed = await User.findOne({ username });

    if (usernameAlreadyUsed) {
      return res.status(409).json({ message: "This username is already used" });
    }

    //test pour password et passwordconf qui doivent être identiques
    if (password !== passwordConf) {
      return res.status(409).json({ message: "Passwords are different" });
    }

    //partie génération du token
    const token = uid2(64);
    const salt = uid2(16);
    const hash = SHA256(salt + password).toString(encBase64);

    const newUser = new User({
      username,
      email,
      token,
      hash,
      salt,
      //ajout avatar pour image Cloudinary----------------------------------------
      picture,
      //--------------------------------------------------------
    });
    //test envoi image à Cloudinary-------------------------------------------------
    const result = await cloudinary.uploader.upload(
      convertToBase64(req.files.picture),
      {
        folder: `tmdb/users/${newUser._id}`,
      }
    );
    newUser.picture = result;
    //----------------------------------------------------------

    //enregistrement du nouveau user en BDD
    await newUser.save();
    const response = {
      username: newUser.username,
      _id: newUser._id,
      token: newUser.token,
    };

    //envoi de la réponse
    res.status(200).json(response);

    //sinon erreur
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Route2 login: fonctionne avec Postman
router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ message: "Unknown email" });
    }
    const newHash = SHA256(user.salt + password).toString(encBase64);
    if (newHash !== user.hash) {
      return res.status(401).json({ message: "Wrong password" });
    }
    res.json({ _id: user._id, token: user.token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Route3 en get récup user------------------------

router.get("/user", async (req, res) => {
  try {
    const users = await User.find();
    res.json({ users: users });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});
//--------------------------------------------------

//Route4 en get récup infos sur le user: route fonctionne--------------

router.get("/user/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const user = await User.findOne({ _id: id });
    res.json({ user: user });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});
//--------------------------------------------------

//Route5 en put: update les infos du user--------------------

router.put(
  "/user/update/:id",
  fileUpload(),
  //dans Postman, il faudra mettre Authorization avec Berer token
  // isAuthenticated,
  async (req, res) => {
    const id = req.params.id;
    // console.log(id);
    const { username, email, password, passwordConf } = req.body;
    const { picture } = req.files.picture;

    //si un parmaètre est manquant, message d'erreur
    // if (!username || !email || !password) {
    //   return res.status(400).json({ message: "Missing parameter" });
    // }

    //on cherche le user à modifier
    const userToModify = await User.findOne({ _id: id });
    try {
      //username-------------------------------------
      if (username) {
        userToModify.username = username;
      }
      //gérer le cas où le username existe déjà
      const usernameAlreadyUsed = await User.findOne({
        username: req.body.username,
      });

      if (usernameAlreadyUsed) {
        return res
          .status(409)
          .json({ message: "This username is already used" });
      }
      if (email) {
        userToModify.email = email;
      }
      const emailAlreadyUsed = await User.findOne({
        email: req.body.email,
      });
      if (emailAlreadyUsed) {
        return res
          .status(409)
          .json({ message: "This username is already used" });
      }
      //test pour password et passwordconf qui doivent être identiques
      if (password !== passwordConf) {
        return res.status(409).json({ message: "Passwords are different" });
      }
      //---------------------------------------------
      //puis si on recoit une nouvelle photo
      if (req.files?.picture) {
        //on supprime l'ancienne
        await cloudinary.uploader.destroy(userToModify.picture.public_id);
      }
      //et on upload la nouvelle
      const result = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture),
        {
          folder: `tmdb/users/${userToModify._id}`,
        }
      );
      userToModify.picture = result;

      //-----------------------------------------------
      // //il va falloir gérer le changement du mot de passe avec confirmation
      // const favouritesToModify = await Favourite.find({
      //findOne fonction ne mais ne renvoie qu'un seul favori: il faudra trouver poru en envoyer plusieurs avec find() mais erreur de réponse car tableau d'objet.. fonctionne bien avec findOne mais pas avec find()
      //   token: userToModify.token,
      // });
      // console.log(favouritesToModify);

      //partie génération du token: générer un nouveau token?
      const token = uid2(64);
      const salt = uid2(16);
      const hash = SHA256(salt + req.body.password).toString(encBase64);

      userToModify.token = token;
      userToModify.salt = salt;
      userToModify.hash = hash;

      // favouritesToModify.token = token;
      // favouritesToModify.updateMany(
      //   { token: userToModify.token },
      //   { token: token }
      // );
      // //prochaine etape : implémenter en prod et vérifier si on peut ajouter le changement de mail
      // console.log(favouritesToModify);
      //la commande ci dessous envoie is not a function car je pense il y a un tableau d'objet
      //et il faut enregistrer les elements independamment ou le tableau (voir dans la brochure mongoDB)
      // await favouritesToModify.save();
      //on sauvegarde les favoris

      //à priori les hash, salt et token sont bien modifiés
      // à voir si on peut le recuperer dans le header? et si cela fonctionne avec
      //le token et le isauthenticated

      //il faut mettre à jour les favoris associés au compte: token et username
      //rechercher les favoris associés au compte

      //en front il va falloir faire un formulaire avec mise à jour des infos et de l"image avec aperçu

      //-----------------------------------------------------------

      //on sauvegarde le user
      await userToModify.save();

      //envoi de la répon,se au front
      const response = {
        username: userToModify.username,
        token: userToModify.token,
      };

      //envoi de la réponse
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json(error.message);
    }
  }
);

module.exports = router;
