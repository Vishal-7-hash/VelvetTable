const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach full user object to request
      const [users] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
      if (users.length === 0) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      req.user = users[0];
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const isOwner = (req, res, next) => {
    if (req.user && req.user.role === 'owner') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an owner' });
    }
};

module.exports = { protect, isOwner };