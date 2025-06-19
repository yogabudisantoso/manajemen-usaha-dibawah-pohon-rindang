const express = require("express");
const router = express.Router();
const pengeluaranController = require("../controllers/pengeluaranController");
// const auth = require("../middleware/auth"); // Middleware auth (token-based) - Dihapus
const isAuthenticated = require("../middleware/isAuthenticated"); // Import middleware isAuthenticated (session-based) - Hanya digunakan untuk rute index jika perlu
// const authorize = require('../middleware/authorize'); // Middleware untuk otorisasi role

// Route untuk menampilkan halaman tambah pengeluaran (Ditempatkan sebelum rute dinamis /:id)
router.get("/create", pengeluaranController.renderCreatePengeluaranPage);

// Route untuk menampilkan halaman daftar pengeluaran (Menggunakan isAuthenticated jika hanya halaman ini memerlukannya, atau dihapus jika requireAuth di app.js sudah cukup)
router.get("/", isAuthenticated, pengeluaranController.renderPengeluaranIndex);

// Route untuk menampilkan halaman edit pengeluaran
router.get("/edit/:id", pengeluaranController.renderEditPengeluaranPage);

// Route untuk mengupdate pengeluaran
router.post("/update/:id", pengeluaranController.updatePengeluaranForm);

// Route untuk mendapatkan data pengeluaran barang berdasarkan ID (Dilindungi oleh requireAuth di app.js)
router.get(
  "/:id",
  /* authorize('pemilik toko'), */ pengeluaranController.getPengeluaranById
);

// Route untuk mencatat pengeluaran barang baru (Dilindungi oleh requireAuth di app.js)
router.post(
  "/",
  /* authorize('pemilik toko'), */ pengeluaranController.recordPengeluaranBarang
);

module.exports = router;
