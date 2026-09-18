const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ error: 'Access Denied: No Token Provided!' });
  }

  try {
    // Assuming Bearer token
    const tokenStr = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    const verified = jwt.verify(tokenStr, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid Token' });
  }
};
