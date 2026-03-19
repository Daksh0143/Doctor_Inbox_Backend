const jwt = require('jsonwebtoken');

const HARDCODED_USER = {
    email: "admin@test.com",
    password: "123456"
};

const loginUser = async (req, res) => {
    console.log("Login request received with body:", process.env.JWT_SECRET);
    try {
        const { email, password } = req.body;

        if (email !== HARDCODED_USER.email || password !== HARDCODED_USER.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.json({
            message: "Login successful",
            token
        });
    } catch (error) {
        console.log("Login error:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { loginUser }