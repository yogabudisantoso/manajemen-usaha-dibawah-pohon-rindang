const express = require("express");
const router = express.Router();
const pemasukanController = require("../controllers/pemasukanController");
const auth = require("../middleware/auth");
const Usaha = require("../models/Usaha"); // Import model Usaha
// const authorize = require('../middleware/authorize'); // Middleware untuk otorisasi role

// Route untuk mencatat pemasukan baru (TANPA AUTH)
router.post("/", pemasukanController.createPemasukan);

// Route untuk menampilkan halaman data pemasukan
router.get("/", async (req, res) => {
  try {
    const usaha_id = req.query.usaha_id; // Ambil usaha_id dari query parameter
    const pemasukanData = await pemasukanController.getAllPemasukan(req, res);
    const usahaList = await Usaha.getAllUsaha(); // Ambil daftar semua usaha

    console.log("usahaList di routes/pemasukan.js:", usahaList); // Log isi usahaList

    res.render("pemasukan/index", {
      title: "Data Pemasukan",
      pemasukan: pemasukanData,
      usahaList: usahaList, // Kirim usahaList ke view
      selectedUsahaId: usaha_id, // Kirim usaha_id yang dipilih ke view
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat memuat data pemasukan");
  }
});

// Route untuk mendapatkan data pemasukan berdasarkan ID
router.get("/:id", auth, pemasukanController.getPemasukanById);

// Route untuk mengupdate data pemasukan
router.put("/:id", auth, pemasukanController.updatePemasukan);

// Route untuk menghapus data pemasukan
router.delete("/:id", auth, pemasukanController.deletePemasukan);

module.exports = router;
