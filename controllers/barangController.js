const Barang = require("../models/Barang");
const db = require("../config/database");

// Fungsi helper untuk format angka menjadi mata uang (misal: 1000000 -> 1.000.000)
const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID").format(number);
};

exports.createBarang = async (req, res) => {
  try {
    const { nama_barang, harga_beli, harga_jual } = req.body;

    // Validasi input
    if (!nama_barang) {
      return res.status(400).json({ message: "Nama barang harus diisi" });
    }

    // Cek apakah nama barang sudah ada
    const existingBarang = await Barang.findByNamaBarang(nama_barang);
    if (existingBarang) {
      return res.status(400).json({ message: "Nama barang sudah terdaftar" });
    }

    const barangId = await Barang.create({
      nama_barang,
      harga_beli,
      harga_jual,
    });
    res.status(201).json({
      message: "Barang berhasil ditambahkan",
      barangId: barangId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.getAllBarang = async (req, res) => {
  try {
    const { usaha_id } = req.query; // Ambil usaha_id dari query parameter
    const barangData = await Barang.findAll(usaha_id);
    res.json({
      message: "Data barang berhasil diambil",
      data: barangData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.getBarangById = async (req, res) => {
  try {
    const { id } = req.params;
    const barangItem = await Barang.findById(id);

    if (!barangItem) {
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    }

    res.json({
      message: "Data barang berhasil diambil",
      data: barangItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.updateBarang = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_barang, harga_beli, harga_jual } = req.body;

    // Cek apakah barang ada
    const existingBarang = await Barang.findById(id);
    if (!existingBarang) {
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    }

    // Cek apakah nama barang baru sudah digunakan oleh barang lain
    if (nama_barang && nama_barang !== existingBarang.nama_barang) {
      const barangWithSameName = await Barang.findByNamaBarang(nama_barang);
      if (barangWithSameName) {
        return res.status(400).json({ message: "Nama barang sudah terdaftar" });
      }
    }

    const barangData = { nama_barang, harga_beli, harga_jual };

    const updated = await Barang.update(id, barangData);

    if (updated) {
      const updatedBarang = await Barang.findById(id);
      res.json({
        message: "Barang berhasil diupdate",
        data: updatedBarang,
      });
    } else {
      const updatedBarang = await Barang.findById(id);
      res.status(200).json({
        message: "Tidak ada perubahan pada data barang",
        data: updatedBarang,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.deleteBarang = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah barang ada
    const existingBarang = await Barang.findById(id);
    if (!existingBarang) {
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    }

    const deleted = await Barang.delete(id);

    if (deleted) {
      res.json({ message: "Barang berhasil dihapus" });
    } else {
      res.status(400).json({ message: "Gagal menghapus barang" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Menampilkan semua data barang
exports.index = async (req, res) => {
  try {
    const { usaha_id } = req.query; // Dapatkan usaha_id dari query parameter
    const barang = await Barang.findAll(usaha_id); // Ambil data barang, difilter jika ada usaha_id
    const usahaList = await Barang.getAllUsaha(); // Ambil daftar semua usaha

    const formattedBarang = barang.map((item) => ({
      ...item,
      harga_beli: formatRupiah(item.harga_beli),
      harga_jual: formatRupiah(item.harga_jual),
    }));

    res.render("barang/index", {
      title: "Data Barang",
      barang: formattedBarang,
      usahaList,
      selectedUsahaId: usaha_id || null, // Teruskan usaha_id yang dipilih ke view
    });
  } catch (error) {
    console.error("Error in exports.index (BarangController):", error);
    res.status(500).send("Terjadi kesalahan saat mengambil data barang");
  }
};

// Menampilkan form tambah barang
exports.create = async (req, res) => {
  try {
    const [usaha] = await db.query("SELECT * FROM usaha");
    res.render("barang/create", {
      title: "Tambah Barang",
      usaha,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Terjadi kesalahan saat mengambil data usaha");
  }
};

// Menyimpan data barang baru
exports.store = async (req, res) => {
  try {
    const { nama_barang, harga_beli, harga_jual, usaha_id } = req.body;
    console.log("DATA YANG DIKIRIM:", req.body);

    if (!usaha_id) {
      // Ambil ulang data usaha untuk form
      const [usaha] = await db.query("SELECT * FROM usaha");
      return res.status(400).render("barang/create", {
        title: "Tambah Barang",
        usaha,
        error: "Usaha harus dipilih!",
      });
    }

    await db.query(
      "INSERT INTO barang (nama_barang, harga_beli, harga_jual, usaha_id) VALUES (?, ?, ?, ?)",
      [nama_barang, harga_beli, harga_jual, usaha_id]
    );

    res.redirect("/barang");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Terjadi kesalahan saat menyimpan data barang");
  }
};

// Menampilkan form edit barang
exports.edit = async (req, res) => {
  try {
    const [barang] = await db.query(
      `
      SELECT b.*, u.nama_usaha 
      FROM barang b 
      LEFT JOIN usaha u ON b.usaha_id = u.id 
      WHERE b.id = ?
    `,
      [req.params.id]
    );

    const [usaha] = await db.query("SELECT * FROM usaha");

    if (barang.length === 0) {
      return res.status(404).send("Barang tidak ditemukan");
    }

    res.render("barang/edit", {
      barang: barang[0],
      title: "Edit Barang",
      usaha,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Terjadi kesalahan saat mengambil data barang");
  }
};

// Mengupdate data barang
exports.update = async (req, res) => {
  try {
    const { nama_barang, harga_beli, harga_jual, usaha_id } = req.body;

    await db.query(
      "UPDATE barang SET nama_barang = ?, harga_beli = ?, harga_jual = ?, usaha_id = ? WHERE id = ?",
      [nama_barang, harga_beli, harga_jual, usaha_id, req.params.id]
    );

    res.redirect("/barang");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Terjadi kesalahan saat mengupdate data barang");
  }
};

// Menghapus data barang
exports.delete = async (req, res) => {
  try {
    await db.query("DELETE FROM barang WHERE id = ?", [req.params.id]);
    res.redirect("/barang");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Terjadi kesalahan saat menghapus data barang");
  }
};
