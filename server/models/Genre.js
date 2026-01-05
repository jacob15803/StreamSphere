const mongoose = require("mongoose");
const { Schema } = mongoose;

const genreSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }
});

mongoose.model("genres", genreSchema);

// db.genres.insertMany([
//   { name: "Action" },
//   { name: "Adventure" },
//   { name: "Comedy" },
//   { name: "Drama" },
//   { name: "Thriller" },
//   { name: "Horror" },
//   { name: "Romance" },
//   { name: "Science Fiction" },
//   { name: "Fantasy" },
//   { name: "Mystery" },
//   { name: "Crime" },
//   { name: "Animation" },
//   { name: "Family" },
//   { name: "Documentary" }
// ]);