const { User } = require('../model/User');

const register = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and Password are required' });
    }
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'username already exists' });
        }
        const newUser = await User.create({
            username,
            password
        });
        res.status(201).json({ message: 'User registered successfully', username: newUser.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'username and password are required.' });
        }
        const userDoc = await User.findOne({ username });
        if (!userDoc || !userDoc.validPassword(password)) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        return res.status(200).json({ message: 'Login Success', canConnect: true, mongoId: userDoc._id })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'something broke', canConnect: false });
    }
}

module.exports = { register, login }