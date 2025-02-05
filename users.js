const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const { ObjectId } = require("mongodb"); // Import ObjectId
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
const mongoURI =
  "mongodb+srv://ngsanas04:ngsanas04@anascluster.lmfsw.mongodb.net/Usersdatabase";

app.use(bodyParser.json());

let db;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    const client = new MongoClient(mongoURI, {
      tls: true, // Enable TLS
    });

    await client.connect();
    db = client.db(); // Connect to the database
    console.log("✅ Connected to MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB Atlas Connection Error:", err);
    process.exit(1);
  }
}

connectToMongoDB();

// Route to insert data into MongoDB
app.post("/addUser", async (req, res) => {
  try {
    const userData = req.body; // Get data from request body

    if (!userData.name || !userData.email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const collection = db.collection("Users"); // Specify the collection
    const result = await collection.insertOne(userData); // Insert data

    res.status(201).json({ message: "User added successfully", data: result });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to update user data in MongoDB
app.put("/updateUser/:id", async (req, res) => {
  try {
    const userId = req.params.id; // Get user ID from URL
    const updatedData = req.body; // Get updated data from request body

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const collection = db.collection("Users"); // Access the users collection

    const result = await collection.updateOne(
      { _id: new ObjectId(userId) }, // Find user by _id
      { $set: updatedData } // Update user data
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to delete a user from MongoDB
app.delete("/deleteUser/:id", async (req, res) => {
  try {
    const userId = req.params.id; // Get user ID from URL

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const collection = db.collection("Users"); // Access the users collection

    const result = await collection.deleteOne({ _id: new ObjectId(userId) }); // Delete user

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const collection = db.collection("Users");
    const result = await collection.find().toArray();
    res.json(result);
  } catch (err) {
    console.log("error in users api", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});
