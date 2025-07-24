const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/loginDB');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Mongoose Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

// API Endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('🔵 Received login request:', { email, password });

  if (!email || !password) {
    console.log("🔴 Missing email or password in request.");
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const newUser = new User({ email, password });
    await newUser.save();
    console.log("✅ User saved successfully");
    res.status(200).json({ message: "User saved successfully" });
  } catch (error) {
    console.error("❌ Error saving user:", error);
    res.status(500).json({ message: "Error saving user", error: error.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
