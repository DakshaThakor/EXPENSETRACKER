const User = require('../models/User');
const jwt = require('jsonwebtoken');

// JWT Token Generator
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Register User
const registerUser = async (req, res) => {
    const { fullName, email, password, profileImageUrl } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const user = await User.create({
            fullName,
            email,
            password,
            profileImageUrl,
        });

        return res.status(201).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        });
    } catch (err) {
        return res.status(500).json({ message: "Error registering user", error: err.message });
    }
};

// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        return res.status(200).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        });
    } catch (err) {
        return res.status(500).json({ message: "Login error", error: err.message });
    }
};

// Get User Info (protected route)
const getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching user info", error: err.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserInfo
};