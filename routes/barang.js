const express = require("express");
const router = express.Router();
const barangController = require("../controllers/barangController");

// Middleware untuk mengecek autentikasi
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect("/login");
};

// Routes untuk barang
router.get("/", isAuthenticated, barangController.index);
router.get("/create", isAuthenticated, barangController.create);
router.post("/store", isAuthenticated, barangController.store);
router.get("/edit/:id", isAuthenticated, barangController.edit);
router.post("/update/:id", isAuthenticated, barangController.update);
router.get("/delete/:id", isAuthenticated, barangController.delete);

module.exports = router;
