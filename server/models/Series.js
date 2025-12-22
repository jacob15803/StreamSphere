const mongoose = require("mongoose");
const { Schema } = mongoose;

const seriesSchema = new Schema({
  title: { type: String },
  genre: { type: String },
  language: { type: String },
  season_number: {type: Number},
  episodes: { type: Array,
    episode: {
        type: Object,
        properties: {
            episode_name: {type:String},
            episode_number: {type: Number},
            airDate: {type: Date}
        }
    }
   },
  tags: { type: String },
  release_date: {type: Date},
  poster_url: { type: String },
  thumbnail_url: { type: String },
  trailer_url: { type: String },
  series_episode_url: { type: String }
}); 

mongoose.model("series", seriesSchema);