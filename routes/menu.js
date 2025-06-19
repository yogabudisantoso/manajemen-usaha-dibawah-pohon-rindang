const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const auth = require("../middleware/auth");
// const authorize = require('../middleware/authorize'); // Middleware untuk otorisasi role, jika diperlukan
const multer = require("multer"); // Impor multer
const path = require("path"); // Impor path

// Konfigurasi Multer untuk menyimpan file yang diunggah
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Tentukan folder tujuan untuk menyimpan gambar yang diunggah
    // Pastikan folder 'public/uploads' sudah ada
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    // Buat nama file unik, contoh: namafile-timestamp.ekstensi
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage }); // Inisialisasi multer

// Route untuk membuat menu baru (Mungkin hanya bisa diakses oleh pemilik toko)
router.post(
  "/",
  upload.single("gambar"),
  /* auth, authorize('pemilik toko'), */ menuController.createMenu
);

// Route untuk mendapatkan semua data menu
router.get("/", auth, menuController.renderMenuIndex);

// Route untuk mendapatkan data menu berdasarkan ID
router.get("/:id", auth, menuController.getMenuById);

// Route untuk mengupdate data menu (Mungkin hanya bisa diakses oleh pemilik toko)
router.put(
  "/:id",
  upload.single("gambar"),
  /* auth, authorize('pemilik toko'), */ menuController.updateMenu
);

// Route untuk menghapus data menu (Mungkin hanya bisa diakses oleh pemilik toko)
router.delete(
  "/:id",
  /* auth, authorize('pemilik toko'), */ menuController.deleteMenu
);

module.exports = router;
