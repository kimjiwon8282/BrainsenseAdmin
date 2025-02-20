const jwt = require('jsonwebtoken');

const loginAuthMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/admin/login');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // 예: { adminId: ... }
    next();
  } catch (error) {
    return res.redirect('/admin/login');
  }
};

module.exports = loginAuthMiddleware;
