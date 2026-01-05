//Genre filtering & for recommendations based on genre.

const mongoose = require("mongoose");
const Genre = mongoose.model("genres");

module.exports = (app) => {
  // Get all Genres
  app.get("/api/v1/genres", async (req, res) => {
    try {
        const genres = await Genre.find({}, "name");
        res.json(genres);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  });
};






