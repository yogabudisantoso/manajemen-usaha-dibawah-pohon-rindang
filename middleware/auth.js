const jwt = require("jsonwebtoken");
const JWT_SECRET = "your-secret-key"; // Gunakan secret key yang sama dengan di controller

const auth = (req, res, next) => {
  // Lewati autentikasi untuk POST /api/pemasukan
  if (req.path === "/api/pemasukan" && req.method === "POST") {
    return next();
  }

  try {
    // Prioritaskan sesi yang sudah login
    if (req.session && req.session.user) {
      req.user = req.session.user;
      return next();
    }

    const authHeader =
      req.header("Authorization") || req.header("authorization");
    const token = authHeader ? authHeader.replace("Bearer ", "") : null;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Akses ditolak. Token tidak ditemukan" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token tidak valid" });
  }
};

module.exports = auth;
