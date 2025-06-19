const express = require("express");
const router = express.Router();
const db = require("../config/database");

// Endpoint untuk mendapatkan transaksi terbaru
router.get("/transactions/latest", async (req, res) => {
  try {
    // Ambil pemasukan terbaru
    const pemasukanQuery = `
      SELECT * FROM pemasukan 
      ORDER BY waktu_transaksi DESC 
      LIMIT 1
    `;

    // Ambil pengeluaran terbaru
    const pengeluaranQuery = `
      SELECT * FROM pengeluaran_barang 
      ORDER BY waktu_pembelian DESC 
      LIMIT 1
    `;

    const [pemasukan] = await db.query(pemasukanQuery);
    const [pengeluaran] = await db.query(pengeluaranQuery);

    // Cek apakah transaksi terjadi hari ini
    const today = new Date().toISOString().slice(0, 10); // format YYYY-MM-DD
    const waktuTransaksi = pemasukan[0] && pemasukan[0].waktu_transaksi;
    const tanggalTransaksi = waktuTransaksi
      ? new Date(waktuTransaksi).toISOString().slice(0, 10)
      : null;
    const pemasukanData =
      pemasukan[0] && tanggalTransaksi === today ? pemasukan[0] : null;

    const waktuPembelian = pengeluaran[0] && pengeluaran[0].waktu_pembelian;
    const tanggalPembelian = waktuPembelian
      ? new Date(waktuPembelian).toISOString().slice(0, 10)
      : null;
    const pengeluaranData =
      pengeluaran[0] && tanggalPembelian === today ? pengeluaran[0] : null;

    res.json({
      pemasukan: pemasukanData,
      pengeluaran: pengeluaranData,
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat mengambil data transaksi" });
  }
});

module.exports = router;
