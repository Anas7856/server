const { MongoClient } = require("mongodb");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;
app.use(cors());
const uri =
  "mongodb+srv://ngsanas04:ngsanas04@anascluster.lmfsw.mongodb.net/sample_mflix?retryWrites=true&w=majority";

let db; // Make db accessible globally

async function testConnection() {
  const client = new MongoClient(uri);

  try {
    console.log("⏳ Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Successfully connected to MongoDB!");

    db = client.db("sample_mflix"); // Assign global db variable

    // Start the server after the database connection is established
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
  }
}

testConnection();

app.get("/getMovies", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not initialized" });
    }

    const collection = db.collection("movies");

    // Get the search query from request parameters
    const searchTitle = req.query.title || "";

    // Create a search filter
    const query = searchTitle
      ? { title: { $regex: searchTitle, $options: "i" } } // Case-insensitive search
      : {};

    // Fetch movies based on search criteria
    const result = await collection.find(query).limit(50).toArray();
    res.json(result);
  } catch (err) {
    console.log("Error in movie API:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});
