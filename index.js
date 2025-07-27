const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://loginUser:login1234@127.0.0.1:27017/loginDB?authSource=loginDB");
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Mongoose Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true }, // ensure unique emails
  password: String,
  loggedIn: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

// API Endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('🔵 Login:', email);

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Set loggedIn true
    user.loggedIn = true;
    await user.save();

    console.log("✅ Login successful");
    res.status(200).json({ message: "Login successful", username: user.username });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


app.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  console.log('🔵 Register:', { username, email });

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();
    console.log("✅ User registered successfully");
    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post('/logout', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      user.loggedIn = false;
      await user.save();
      return res.status(200).json({ message: "Logout successful" });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
