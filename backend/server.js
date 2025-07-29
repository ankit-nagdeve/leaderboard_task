require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
    name: String,
    totalPoints: { type: Number, default: 0 }
});

const historySchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    points: Number,
    timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const History = mongoose.model("History", historySchema);

// Create user
app.post("/api/users", async (req, res) => {
    const { name } = req.body;
    const newUser = new User({ name });
    await newUser.save();
    res.json(newUser);
});

// Get all users
app.get("/api/users", async (req, res) => {
    const users = await User.find().sort({ totalPoints: -1 });
    res.json(users);
});

// Claim points
app.post("/api/claim/:userId", async (req, res) => {
    const { userId } = req.params;
    const points = Math.floor(Math.random() * 10) + 1;
    const user = await User.findById(userId);
    user.totalPoints += points;
    await user.save();
    const history = new History({ userId, points });
    await history.save();
    res.json({ user, points });
});

// Get history
app.get("/api/history", async (req, res) => {
    const history = await History.find().sort({ timestamp: -1 });
    res.json(history);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));