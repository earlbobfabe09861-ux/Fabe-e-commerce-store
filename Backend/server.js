require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// =================================================================
// 1. DATABASE CONNECTION
// =================================================================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is missing in .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected!"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// =================================================================
// 2. API ROUTES
// =================================================================
// FIXED: Removed 'Backend/' because we are already inside the Backend folder
const User = require('./models/User.js'); 

// CREATE User
app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User({ name: req.body.name, email: req.body.email });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ All Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE User
app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted User' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =================================================================
// 3. SERVE FRONTEND FILES
// =================================================================
// FIXED: We use '../Frontend' to step out of the Backend folder and find Frontend.
// We assume you are serving plain HTML/CSS/JS (not a React build folder).

app.use(express.static(path.join(__dirname, '../Frontend')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend', 'index.html'));
});

// =================================================================
// 4. START SERVER
// =================================================================
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));