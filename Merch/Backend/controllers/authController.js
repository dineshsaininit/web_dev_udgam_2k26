const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const neonDb = require('../config/neonDb');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const userResult = await neonDb.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const newUserResult = await neonDb.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    const user = newUserResult.rows[0];

    // Create token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const userResult = await neonDb.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};
