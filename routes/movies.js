const express = require("express");
const router = express.Router();
const axios = require("axios");

//first route to get last movies

router.get("/", async (req, res) => {
  const apiKey = process.env.YOUR_API_KEY;

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}`
    );
    console.log(response.data);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

//seconde route movie par Id: fonctionne niquel!

router.get("/movie/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const apiKey = process.env.YOUR_API_KEY;

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`
    );

    console.log(response.data);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
