const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const [emailTaken, usernameTaken] = await Promise.all([
      UserModel.emailExists(email),
      UserModel.usernameExists(username)
    ]);

    if (emailTaken) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    if (usernameTaken) {
      return res.status(409).json({ error: 'This username is already taken.' });
    }

    const user = await UserModel.create({ username, email, password });
    const token = generateToken(user);

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Failed to create account.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await UserModel.verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Logged in successfully.',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    return res.status(200).json({ user });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ error: 'Failed to fetch user.' });
  }
};

module.exports = { register, login, getMe };
