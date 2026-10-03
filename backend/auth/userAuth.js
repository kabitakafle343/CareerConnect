const jwt = require("jsonwebtoken");

exports.authorize = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({ message: "Access token required" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
};

exports.allowRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  next();
};

exports.refreshAccessToken = (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign(
      {
        userId: decoded.userId,
        role: decoded.role,
        name: decoded.name,
        email: decoded.email,
      },

      process.env.ACCESS_TOKEN_SECRET,

      {
        expiresIn: "15m",
      },
    );
    return res.status(200).json({ accessToken });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};
