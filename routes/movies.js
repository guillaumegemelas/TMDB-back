const express = require("express");
const router = express.Router();
const axios = require("axios");

//first route to get last movies

router.get("/", async (req, res) => {
  const apiKey = process.env.YOUR_API_KEY;
  const { page } = req.query;

  if (!page) {
    page = 1;
  }

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${page}`
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

//troisième route pour similar movie

router.get("/movie/:id/similar", async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const apiKey = process.env.YOUR_API_KEY;

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${apiKey}`
    );

    console.log(response.data, "response similar movies-----");
    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

//quatrième route pour upcoming movie

router.get("/movie/upcoming", async (req, res) => {
  // const { page } = req.query;
  const apiKey = process.env.YOUR_API_KEY;

  // if (!page) {
  //   page = 1;
  // }

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}`
    );

    console.log(response.data, "response upcoming movies-----");
    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = router;
