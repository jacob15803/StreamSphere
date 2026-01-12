const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const { Media } = require("./models/Media");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Your S3 Bucket Configuration
const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME || "streamsphere-bucket";

// Helper to create S3 URL
const createS3Url = (filename) => {
  return `s3://${S3_BUCKET}/${filename}`;
};

// Sample Media Content (matches your backend Media schema)
const getSampleMedia = () => [
  // ============================================
  // STRANGER THINGS SEASON 5 (Series)
  // ============================================
  {
    type: "series",
    name: "Stranger Things",
    description:
      "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.",
    rating: 8.7,
    languages: ["English"],
    genres: ["Sci-Fi", "Horror", "Drama"],
    releaseDate: new Date("2016-07-15"),
    posterUrl:
      "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    sliderPosterUrl:
      "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    trailerUrl: createS3Url("Stranger-Things-5-trailer.mp4"),
    director: "The Duffer Brothers",
    cast: [
      "Millie Bobby Brown",
      "Finn Wolfhard",
      "Winona Ryder",
      "David Harbour",
    ],
    country: "USA",
    ageRating: "TV-14",
    episodes: [
      {
        episodeNumber: 1,
        seasonNumber: 5,
        title: "The Crawl",
        description:
          "After the fall of the Mind Flayer, Hawkins attempts to return to normal. But something sinister lurks beneath the surface.",
        duration: 50,
        releaseDate: new Date("2024-01-01"),
        rating: 8.8,
        thumbnailUrl:
          "https://image.tmdb.org/t/p/w500/AdwF1v8OhcLGJMi6imPXf59cOKJ.jpg",
        videoUrl: createS3Url("StrangerThingsS05E01.mkv"),
      },
      {
        episodeNumber: 2,
        seasonNumber: 5,
        title: "The Dive",
        description:
          "The group uncovers a dark secret that connects back to the Upside Down.",
        duration: 52,
        releaseDate: new Date("2024-01-08"),
        rating: 8.6,
        thumbnailUrl:
          "https://image.tmdb.org/t/p/w500/qpj1R5lp6Ntv9xj5I5I71lsLq1f.jpg",
        videoUrl: createS3Url("StrangerThingsS05E02.mkv"),
      },
      {
        episodeNumber: 3,
        seasonNumber: 5,
        title: "The Monster",
        description: "A new threat emerges from the depths of the Upside Down.",
        duration: 48,
        releaseDate: new Date("2024-01-15"),
        rating: 8.9,
        thumbnailUrl:
          "https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1ms8r6ec.jpg",
        videoUrl: createS3Url("StrangerThingsS05E03.mkv"),
      },
    ],
  },

  // ============================================
  // THE DARK KNIGHT (Movie)
  // ============================================
  {
    type: "movie",
    name: "The Dark Knight",
    description:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    rating: 9.0,
    languages: ["English"],
    genres: ["Action", "Thriller", "Drama"],
    releaseDate: new Date("2008-07-18"),
    duration: 152,
    posterUrl:
      "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    sliderPosterUrl:
      "https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg",
    trailerUrl: createS3Url("The-Dark-Knight-trailer.mp4"),
    videoUrl: createS3Url("The-Dark-Knight-trailer.mp4"),
    director: "Christopher Nolan",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine"],
    country: "USA",
    ageRating: "PG-13",
  },

  // ============================================
  // INCEPTION (Movie)
  // ============================================
  {
    type: "movie",
    name: "Inception",
    description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    rating: 8.8,
    languages: ["English"],
    genres: ["Action", "Sci-Fi", "Thriller"],
    releaseDate: new Date("2010-07-16"),
    duration: 148,
    posterUrl:
      "https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg",
    sliderPosterUrl:
      "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
    trailerUrl: createS3Url("Inception-trailer.mp4"),
    videoUrl: createS3Url("Inception-trailer.mp4"),
    director: "Christopher Nolan",
    cast: [
      "Leonardo DiCaprio",
      "Joseph Gordon-Levitt",
      "Ellen Page",
      "Tom Hardy",
    ],
    country: "USA",
    ageRating: "PG-13",
  },

  // ============================================
  // F1 (Movie)
  // ============================================
  {
    type: "movie",
    name: "F1",
    description:
      "A Formula 1 driver comes out of retirement to mentor a younger driver and take his final stab at glory on the track.",
    rating: 7.5,
    languages: ["English"],
    genres: ["Action", "Drama"],
    releaseDate: new Date("2025-06-27"),
    duration: 130,
    posterUrl:
      "https://play-lh.googleusercontent.com/GAPgLw1XBPUkygT9c7JOIvYB3K9A6z-Pde-Tt12CxXUQ42WaWExG7ZtCSdGgK12Y02u6Qq5Bb0d6FCDqhIQ",
    sliderPosterUrl:
      "https://images.travelandleisureasia.com/wp-content/uploads/sites/2/2025/06/27132035/f1-movie-1600x900.jpeg",
    trailerUrl: createS3Url("F1-The-Movie-trailer.mp4"),
    videoUrl: createS3Url("F1-The-Movie-trailer.mp4"),
    director: "Joseph Kosinski",
    cast: ["Brad Pitt", "Damson Idris", "Kerry Condon", "Javier Bardem"],
    country: "USA",
    ageRating: "PG-13",
  },

  // ============================================
  // INTERSTELLAR (Movie)
  // ============================================
  {
    type: "movie",
    name: "Interstellar",
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    rating: 8.6,
    languages: ["English"],
    genres: ["Sci-Fi", "Drama", "Adventure"],
    releaseDate: new Date("2014-11-07"),
    duration: 169,
    posterUrl:
      "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    sliderPosterUrl:
      "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    trailerUrl: createS3Url("Interstellar-trailer.mp4"),
    videoUrl: createS3Url("Interstellar-trailer.mp4"),
    director: "Christopher Nolan",
    cast: [
      "Matthew McConaughey",
      "Anne Hathaway",
      "Jessica Chastain",
      "Michael Caine",
    ],
    country: "USA",
    ageRating: "PG-13",
  },

  // ============================================
  // THE SHAWSHANK REDEMPTION (Movie)
  // ============================================
  {
    type: "movie",
    name: "The Shawshank Redemption",
    description:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    rating: 9.3,
    languages: ["English"],
    genres: ["Drama"],
    releaseDate: new Date("1994-09-23"),
    duration: 142,
    posterUrl:
      "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    sliderPosterUrl:
      "https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
    trailerUrl: createS3Url("Shawshank-trailer.mp4"),
    videoUrl: createS3Url("Shawshank-trailer.mp4"),
    director: "Frank Darabont",
    cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton", "William Sadler"],
    country: "USA",
    ageRating: "R",
  },

  // ============================================
  // BREAKING BAD (Series)
  // ============================================
  {
    type: "series",
    name: "Breaking Bad",
    description:
      "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    rating: 9.5,
    languages: ["English"],
    genres: ["Crime", "Drama", "Thriller"],
    releaseDate: new Date("2008-01-20"),
    posterUrl: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    sliderPosterUrl:
      "https://image.tmdb.org/t/p/original/9faGSFi5jam6pDWGNd0p8JcJgXQ.jpg",
    trailerUrl: createS3Url("Breaking-Bad-trailer.mp4"),
    director: "Vince Gilligan",
    cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn", "Dean Norris"],
    country: "USA",
    ageRating: "TV-MA",
    episodes: [
      {
        episodeNumber: 1,
        seasonNumber: 1,
        title: "Pilot",
        description:
          "Diagnosed with terminal lung cancer, chemistry teacher Walter White teams up with former student Jesse Pinkman to cook and sell crystal meth.",
        duration: 58,
        releaseDate: new Date("2008-01-20"),
        rating: 9.0,
        thumbnailUrl:
          "https://image.tmdb.org/t/p/w500/ydlY3iPfeOAvu8gVqrxPoMvzNCn.jpg",
        videoUrl: createS3Url("BreakingBadS01E01.mkv"),
      },
      {
        episodeNumber: 2,
        seasonNumber: 1,
        title: "Cat's in the Bag...",
        description:
          "Walt and Jesse attempt to dispose of the two bodies in the RV, which proves to be more challenging than anticipated.",
        duration: 48,
        releaseDate: new Date("2008-01-27"),
        rating: 8.7,
        thumbnailUrl:
          "https://image.tmdb.org/t/p/w500/tjDNvbEqDW425VUrlzVsPL46WVb.jpg",
        videoUrl: createS3Url("BreakingBadS01E02.mkv"),
      },
    ],
  },

  // ============================================
  // PULP FICTION (Movie)
  // ============================================
  {
    type: "movie",
    name: "Pulp Fiction",
    description:
      "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
    rating: 8.9,
    languages: ["English"],
    genres: ["Crime", "Drama"],
    releaseDate: new Date("1994-10-14"),
    duration: 154,
    posterUrl:
      "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    sliderPosterUrl:
      "https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    trailerUrl: createS3Url("Pulp-Fiction-trailer.mp4"),
    videoUrl: createS3Url("Pulp-Fiction-trailer.mp4"),
    director: "Quentin Tarantino",
    cast: ["John Travolta", "Uma Thurman", "Samuel L. Jackson", "Bruce Willis"],
    country: "USA",
    ageRating: "R",
  },

  // ============================================
  // THE MATRIX (Movie)
  // ============================================
  {
    type: "movie",
    name: "The Matrix",
    description:
      "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    rating: 8.7,
    languages: ["English"],
    genres: ["Action", "Sci-Fi"],
    releaseDate: new Date("1999-03-31"),
    duration: 136,
    posterUrl:
      "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    sliderPosterUrl:
      "https://image.tmdb.org/t/p/original/icmmSD4vTTDKOq2vvdulafOGw93.jpg",
    trailerUrl: createS3Url("The-Matrix-trailer.mp4"),
    videoUrl: createS3Url("The-Matrix-trailer.mp4"),
    director: "The Wachowskis",
    cast: [
      "Keanu Reeves",
      "Laurence Fishburne",
      "Carrie-Anne Moss",
      "Hugo Weaving",
    ],
    country: "USA",
    ageRating: "R",
  },

  // ============================================
  // FORREST GUMP (Movie)
  // ============================================
  {
    type: "movie",
    name: "Forrest Gump",
    description:
      "The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man with an IQ of 75.",
    rating: 8.8,
    languages: ["English"],
    genres: ["Drama", "Romance"],
    releaseDate: new Date("1994-07-06"),
    duration: 142,
    posterUrl:
      "https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg",
    sliderPosterUrl:
      "https://image.tmdb.org/t/p/original/hjyHPnzY5bfhDL2DrJhQvbBsBKE.jpg",
    trailerUrl: createS3Url("Forrest-Gump-trailer.mp4"),
    videoUrl: createS3Url("Forrest-Gump-trailer.mp4"),
    director: "Robert Zemeckis",
    cast: ["Tom Hanks", "Robin Wright", "Gary Sinise", "Sally Field"],
    country: "USA",
    ageRating: "PG-13",
  },

  // ============================================
  // GAME OF THRONES (Series)
  // ============================================
  {
    type: "series",
    name: "Game of Thrones",
    description:
      "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
    rating: 9.3,
    languages: ["English"],
    genres: ["Fantasy", "Drama", "Adventure"],
    releaseDate: new Date("2011-04-17"),
    posterUrl:
      "https://image.tmdb.org/t/p/w500/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg",
    sliderPosterUrl:
      "https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
    trailerUrl: createS3Url("Game-Of-Thrones-trailer.mp4"),
    director: "David Benioff, D.B. Weiss",
    cast: ["Emilia Clarke", "Kit Harington", "Peter Dinklage", "Lena Headey"],
    country: "USA",
    ageRating: "TV-MA",
    episodes: [
      {
        episodeNumber: 1,
        seasonNumber: 1,
        title: "Winter Is Coming",
        description:
          "Eddard Stark is torn between his family and an old friend when asked to serve at the side of King Robert Baratheon.",
        duration: 62,
        releaseDate: new Date("2011-04-17"),
        rating: 9.0,
        thumbnailUrl:
          "https://image.tmdb.org/t/p/w500/xIfvIM7YgkADTrqp23jm9Usa5w7.jpg",
        videoUrl: createS3Url("GameOfThronesS01E01.mkv"),
      },
      {
        episodeNumber: 2,
        seasonNumber: 1,
        title: "The Kingsroad",
        description:
          "The Lannisters plot to ensure Bran's silence while Catelyn secretly makes her way to King's Landing.",
        duration: 56,
        releaseDate: new Date("2011-04-24"),
        rating: 8.8,
        thumbnailUrl:
          "https://image.tmdb.org/t/p/w500/4VKp7YJLbD1g5ZrWQPCkxMkqQ6d.jpg",
        videoUrl: createS3Url("GameOfThronesS01E02.mkv"),
      },
    ],
  },

  // ============================================
  // FIGHT CLUB (Movie)
  // ============================================
  {
    type: "movie",
    name: "Fight Club",
    description:
      "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.",
    rating: 8.8,
    languages: ["English"],
    genres: ["Drama"],
    releaseDate: new Date("1999-10-15"),
    duration: 139,
    posterUrl:
      "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    sliderPosterUrl:
      "https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
    trailerUrl: createS3Url("Fight-Club-trailer.mp4"),
    videoUrl: createS3Url("Fight-Club-trailer.mp4"),
    director: "David Fincher",
    cast: ["Brad Pitt", "Edward Norton", "Helena Bonham Carter", "Meat Loaf"],
    country: "USA",
    ageRating: "R",
  },
];

// Seed Function
async function seedDatabase() {
  try {
    console.log("\n🌱 Starting database seed...\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Media.deleteMany({});
    console.log("✅ Existing data cleared\n");

    // Create media
    console.log("🎬 Creating media content...");
    const sampleMedia = getSampleMedia();
    const createdMedia = await Media.insertMany(sampleMedia);
    console.log(`✅ ${createdMedia.length} media items created\n`);

    // Summary
    const movies = createdMedia.filter((m) => m.type === "movie");
    const series = createdMedia.filter((m) => m.type === "series");
    const totalEpisodes = series.reduce((sum, s) => sum + s.episodes.length, 0);

    console.log("📊 Seed Summary:");
    console.log(`   ✔ Total Media: ${createdMedia.length}`);
    console.log(`   ✔ Movies: ${movies.length}`);
    console.log(`   ✔ Series: ${series.length}`);
    console.log(`   ✔ Total Episodes: ${totalEpisodes}`);

    // List all genres
    const allGenres = new Set();
    createdMedia.forEach((media) => {
      media.genres.forEach((genre) => allGenres.add(genre));
    });
    console.log(`   ✔ Unique Genres: ${allGenres.size}`);
    console.log(`     (${Array.from(allGenres).join(", ")})`);

    // List all video files expected in S3
    console.log("\n📹 S3 Video Files Referenced:");
    createdMedia.forEach((media) => {
      if (media.type === "series") {
        console.log(`\n   📺 Series: ${media.name}`);
        media.episodes.forEach((ep) => {
          // ✅ Check if videoUrl exists before processing
          if (ep.videoUrl) {
            const filename = ep.videoUrl.split("/").pop();
            console.log(
              `      - S${ep.seasonNumber}E${ep.episodeNumber
                .toString()
                .padStart(2, "0")}: ${filename}`
            );
          }
        });
        // ✅ Check if trailerUrl exists before processing
        if (media.trailerUrl) {
          const trailerFile = media.trailerUrl.split("/").pop();
          console.log(`      - Trailer: ${trailerFile}`);
        }
      } else {
        // For movies
        console.log(`\n   🎬 Movie: ${media.name}`);

        // ✅ Check if videoUrl exists before processing
        if (media.videoUrl) {
          const filename = media.videoUrl.split("/").pop();
          console.log(`      - Video: ${filename}`);
        }

        // ✅ Check if trailerUrl exists before processing
        if (media.trailerUrl) {
          const trailerFile = media.trailerUrl.split("/").pop();
          console.log(`      - Trailer: ${trailerFile}`);
        }
      }
    });

    console.log("\n✨ Database seeded successfully!");
    console.log("\n📚 Next Steps:");
    console.log(
      "   1. ✅ Ensure all video files listed above are uploaded to S3 bucket"
    );
    console.log(`      Bucket: ${S3_BUCKET}`);
    console.log("   2. 🚀 Start your backend: npm start or npm run dev");
    console.log("   3. 🎨 Start your frontend: cd ../frontend && npm run dev");
    console.log("   4. 🌐 Open http://localhost:3000 and test!");
    console.log("\n💡 Tip: Use AWS CLI to upload videos:");
    console.log(`   aws s3 cp your-video.mp4 s3://${S3_BUCKET}/\n`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    console.error("\n🔧 Troubleshooting:");
    console.error("   - Check MongoDB connection string in .env");
    console.error("   - Verify MONGO_URI is correct");
    console.error("   - Ensure MongoDB is running");
    console.error("   - Check that Media model is properly exported");
    console.error("\nError details:", error.message);
    console.error("\nStack trace:", error.stack);
    process.exit(1);
  }
}

// Run the seed
console.log("🚀 StreamSphere Database Seeder");
console.log("================================");
console.log(`📦 Target Bucket: ${S3_BUCKET}`);
console.log(
  `🗄️  MongoDB: ${process.env.MONGO_URI ? "Connected" : "Not configured"}\n`
);
seedDatabase();
