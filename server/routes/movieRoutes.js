const mongoose = require("mongoose");
const Movie = mongoose.model("movies");

module.exports = (app) => {
    app.post("/api/v1/movie/add", async (req, res) => {
    console.log("ADD NEW MOVIE");
    const { title, genre, language, duration,tags,release_date,poster_url, trailer_url,movie_url } = req.body;

    try {
      const movie = await Movie.findOne({ title });

      if (movie) {
        return res.status(400).json({ message: "Movie already exists" });
      }

      movieFields = { title, genre, language, duration,tags,release_date,poster_url, trailer_url,movie_url };
      const response = await Movie.create(movieFields);

      res.status(201).json({ message: "Movie added successfully", response });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  });
  app.get("/api/v1/movie/all/get", async (req, res) => {
    try {
      const movie = await Movie.find();

      if (!movie) {
        return res.status(400).json({ message: "There are no movie." });
      }

      res.status(201).json({ message: "Movie: ", movie });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
    });
};