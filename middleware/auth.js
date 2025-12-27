const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: "NO_TOKEN" });

    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer" || !token)
      return res.status(401).json({ error: "INVALID_TOKEN_FORMAT" });

    if (!process.env.JWT_SECRET)
      return res.status(500).json({ error: "JWT_SECRET_NOT_SET" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.id;
    req.adminUsername = decoded.username;

    next();
  } catch (err) {
    return res.status(401).json({ error: "TOKEN_EXPIRED" });
  }
};
