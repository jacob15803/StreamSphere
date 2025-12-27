const mongoose = require("mongoose");
const Series = mongoose.model("series");

module.exports = (app) => {
    app.post("/api/v1/series/add", async (req, res) => {
    console.log("ADD NEW SERIES");
    const { title, genre, language, season_number,episodes, tags,release_date,poster_url, trailer_url,series_episode_url } = req.body;

    try {
      const series = await Series.findOne({ title });

      if (series) {
        return res.status(400).json({ message: "Series already exists" });
      }

      seriesFields = { title, genre, language,season_number, episodes,tags,release_date,poster_url, trailer_url,series_episode_url };
      const response = await Series.create(seriesFields);

      res.status(201).json({ message: "Series added successfully", response });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  });
  app.get("/api/v1/series/all/get", async (req, res) => {
    try {
      const series = await Series.find();

      if (!series) {
        return res.status(400).json({ message: "There are no movie." });
      }

      res.status(201).json({ message: "Series: ", series });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
    });
};