const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }
    
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    // Pass to errorHandler for standardized response
    next(err);
  }
};
