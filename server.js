const mongoose = require("mongoose");

// Your connection string
const MONGO_URI = "mongodb+srv://Fabemongol:1234509@cluster01.8t1wltj.mongodb.net/fabeUsers?retryWrites=true&w=majority";

console.log("Connecting to MongoDB...");

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected!"))
  .catch(err => console.error("❌ MongoDB connection error:", err));
