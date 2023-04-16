const express = require("express");

//test ajout fileUpload() pour  comprendre mécanisme Coulinary----------------------------
// const fileUpload = require("express-fileupload");
// const convertToBase64 = require("../utils/convertToBase64");
// const cloudinary = require("cloudinary").v2;
//----------------------------------------------------------------------------------------

//packages installés: crypto-js et uid2
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const router = express.Router();

const User = require("../models/User");

//Route1 signup: fonctionne avec Postman
router.post("/user/signup", async (req, res) => {
  try {
    const { username, email, password, passwordConf } = req.body;
    // const { picture } = req.files.picture;

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
      //   picture,
      //--------------------------------------------------------
    });
    //test envoi image à Cloudinary-----------------------------------------------
    //  const result = await cloudinary.uploader.upload(
    //     convertToBase64(req.files.picture),
    //     {
    //       folder: `gamepad/users/${newUser._id}`,
    //     }
    //   );
    //   newUser.picture = result;
    //--------------------------------------------------------

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

module.exports = router;
