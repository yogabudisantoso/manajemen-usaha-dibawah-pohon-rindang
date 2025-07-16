const Pengeluaran = require("../models/Pengeluaran");
const Barang = require("../models/Barang");
const db = require("../config/database"); // Perlu db untuk query usaha

// Fungsi helper untuk format angka menjadi mata uang (misal: 1000000 -> 1.000.000)
const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID").format(number);
};

// Relasi model tidak perlu didefinisikan di sini karena model menggunakan raw SQL JOINs
// const Barang = require('../models/Barang');
// Pengeluaran.belongsTo(Barang, { foreignKey: 'barang_id' });

exports.recordPengeluaranBarang = async (req, res) => {
  try {
    // Mengambil barang_id, jumlah, dan usaha_id dari body permintaan
    const { barang_id, jumlah, usaha_id, tanggal } = req.body; // Hapus keterangan
    // Mengambil user_id dari sesi yang terautentikasi
    const user_id = req.session.user ? req.session.user.id : null;

    // Tambahkan validasi untuk user_id jika diperlukan
    if (!user_id) {
      return res.status(401).json({ message: "Pengguna tidak terautentikasi" });
    }

    // Validasi input
    if (!barang_id || !jumlah || jumlah <= 0 || !usaha_id) {
      // Tambahkan validasi usaha_id
      // Render ulang halaman create dengan pesan error dan data yang sudah ada (jika ini dari form)
      const barang = (await Barang.findAll()) || [];
      const [usaha] = (await db.query("SELECT * FROM usaha")) || [];
      return res.render("pengeluaran/create", {
        title: "Tambah Pengeluaran",
        barang: barang,
        usaha: usaha, // Teruskan data usaha
        error: "ID barang, jumlah beli yang valid, dan usaha harus diisi",
        // Isi kembali nilai-nilai form yang sudah diisi pengguna
        old: req.body,
      });
    }

    // Ambil data barang untuk mendapatkan harga beli satuan saat ini
    const barangData = await Barang.findById(barang_id);
    if (!barangData) {
      // Render ulang halaman create dengan pesan error
      const barang = (await Barang.findAll()) || [];
      const [usaha] = (await db.query("SELECT * FROM usaha")) || [];
      return res.render("pengeluaran/create", {
        title: "Tambah Pengeluaran",
        barang: barang,
        usaha: usaha, // Teruskan data usaha
        error: "Barang tidak ditemukan",
        old: req.body,
      });
    }

    // Gunakan harga beli dari tabel barang saat ini
    const harga_beli_satuan = barangData.harga_beli;
    // Hitung total biaya item menggunakan jumlah dari body permintaan
    const total_biaya_item = harga_beli_satuan * jumlah;

    // Catat pengeluaran
    const pengeluaranData = {
      barang_id,
      user_id,
      jumlah_beli: jumlah,
      harga_beli_satuan,
      total_biaya_item,
      tanggal: tanggal ? new Date(tanggal) : new Date(),
      usaha_id, // Tambahkan usaha_id
    };

    await Pengeluaran.create(pengeluaranData);

    // Alihkan pengguna kembali ke halaman daftar pengeluaran setelah berhasil disimpan
    res.redirect("/pengeluaran");
  } catch (error) {
    console.error("Error in recordPengeluaranBarang:", error);
    const barang = (await Barang.findAll()) || [];
    const [usaha] = (await db.query("SELECT * FROM usaha")) || [];
    res.render("pengeluaran/create", {
      title: "Tambah Pengeluaran",
      barang: barang,
      usaha: usaha, // Teruskan data usaha
      error:
        "Terjadi kesalahan server saat menyimpan data pengeluaran: " +
        error.message,
      old: req.body,
    });
  }
};

exports.getAllPengeluaran = async (req, res) => {
  try {
    const { usaha_id } = req.query; // Ambil usaha_id dari query parameter
    const pengeluaranData = await Pengeluaran.findAll(usaha_id);
    res.json({
      message: "Data pengeluaran berhasil diambil",
      data: pengeluaranData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.getPengeluaranById = async (req, res) => {
  try {
    const { id } = req.params;
    const pengeluaranItem = await Pengeluaran.findById(id);

    if (!pengeluaranItem) {
      return res
        .status(404)
        .json({ message: "Data pengeluaran tidak ditemukan" });
    }

    res.json({
      message: "Data pengeluaran berhasil diambil",
      data: pengeluaranItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.renderPengeluaranIndex = async (req, res) => {
  try {
    const { usaha_id } = req.query; // Dapatkan usaha_id dari query parameter
    const pengeluaranData = await Pengeluaran.findAll(usaha_id); // Ambil data pengeluaran, difilter jika ada usaha_id
    const usahaList = await Pengeluaran.getAllUsaha(); // Ambil daftar semua usaha

    const formattedPengeluaran = pengeluaranData.map((item) => {
      const tanggalPengeluaran = item.tanggal ? new Date(item.tanggal) : null;

      return {
        id: item.id,
        tanggal: tanggalPengeluaran,
        barang_id: item.barang_id,
        jumlah: item.jumlah_beli,
        harga_beli_satuan: formatRupiah(item.harga_beli_satuan),
        total_biaya_item: formatRupiah(item.total_biaya_item),
        nama_barang: item.nama_barang,
        username: item.username,
        nama_usaha: item.nama_usaha || "-", // Pastikan nama_usaha ditampilkan (sesuai alias di model)
      };
    });

    res.render("pengeluaran/index", {
      title: "Data Pengeluaran",
      pengeluaran: formattedPengeluaran,
      usahaList,
      selectedUsahaId: usaha_id || null, // Teruskan usaha_id yang dipilih ke view
    });
  } catch (error) {
    console.error("Error in renderPengeluaranIndex:", error);
    res
      .status(500)
      .send(
        "Terjadi kesalahan server saat memuat data pengeluaran: " +
          error.message
      );
  }
};

exports.renderCreatePengeluaranPage = async (req, res) => {
  try {
    const barang = (await Barang.findAll()) || [];
    const [usaha] = (await db.query("SELECT * FROM usaha")) || [];
    res.render("pengeluaran/create", {
      title: "Tambah Pengeluaran",
      barang: barang,
      usaha: usaha, // Meneruskan data usaha ke view
      old: {},
    });
  } catch (error) {
    console.error("Error in renderCreatePengeluaranPage:", error);
    res
      .status(500)
      .send("Terjadi kesalahan server saat memuat halaman tambah pengeluaran");
  }
};

exports.renderEditPengeluaranPage = async (req, res) => {
  try {
    const { id } = req.params;
    const pengeluaranItem = await Pengeluaran.findById(id);

    if (!pengeluaranItem) {
      return res.redirect("/pengeluaran");
    }

    const barang = (await Barang.findAll()) || [];
    const [usaha] = (await db.query("SELECT * FROM usaha")) || [];

    res.render("pengeluaran/edit", {
      title: "Edit Pengeluaran",
      pengeluaran: {
        ...pengeluaranItem,
        jumlah: pengeluaranItem.jumlah_beli,
        harga_satuan:
          pengeluaranItem.harga_satuan || pengeluaranItem.harga_beli_satuan,
        harga_beli_satuan: pengeluaranItem.harga_beli_satuan,
        tanggal: pengeluaranItem.tanggal
          ? new Date(pengeluaranItem.tanggal)
          : new Date(),
      },
      barang: barang,
      usaha: usaha, // Meneruskan data usaha
    });
  } catch (error) {
    console.error("Error in renderEditPengeluaranPage:", error);
    res.redirect("/pengeluaran");
  }
};

exports.updatePengeluaranForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { barang_id, jumlah, tanggal, usaha_id } = req.body; // Hapus keterangan
    const user_id = req.session.user ? req.session.user.id : null;

    if (!user_id) {
      return res.status(401).send("Pengguna tidak terautentikasi");
    }

    if (!barang_id || !jumlah || jumlah <= 0 || !usaha_id) {
      // Validasi usaha_id
      const barang = (await Barang.findAll()) || [];
      const [usaha] = (await db.query("SELECT * FROM usaha")) || [];
      const pengeluaranItem = await Pengeluaran.findById(id);
      return res.render("pengeluaran/edit", {
        title: "Edit Pengeluaran",
        pengeluaran: { ...pengeluaranItem, ...req.body },
        barang: barang,
        usaha: usaha,
        error: "ID barang, jumlah beli yang valid, dan usaha harus diisi",
      });
    }

    const barangData = await Barang.findById(barang_id);
    if (!barangData) {
      const barang = (await Barang.findAll()) || [];
      const [usaha] = (await db.query("SELECT * FROM usaha")) || [];
      const pengeluaranItem = await Pengeluaran.findById(id);
      return res.render("pengeluaran/edit", {
        title: "Edit Pengeluaran",
        pengeluaran: { ...pengeluaranItem, ...req.body },
        barang: barang,
        usaha: usaha,
        error: "Barang tidak ditemukan",
      });
    }

    const harga_beli_satuan = barangData.harga_beli;
    const total_biaya_item = harga_beli_satuan * jumlah;

    const updated = await Pengeluaran.update(id, {
      barang_id,
      user_id,
      jumlah_beli: jumlah,
      harga_beli_satuan,
      total_biaya_item,
      tanggal: tanggal ? new Date(tanggal) : new Date(),
      usaha_id, // Teruskan usaha_id
    });

    if (!updated) {
      return res.status(404).send("Data pengeluaran tidak ditemukan");
    }

    res.redirect("/pengeluaran");
  } catch (error) {
    console.error("Error in updatePengeluaranForm:", error);
    res
      .status(500)
      .send("Terjadi kesalahan server saat memperbarui data pengeluaran.");
  }
};

exports.deletePengeluaran = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Pengeluaran.delete(id);
    if (deleted) {
      res.redirect("/pengeluaran");
    } else {
      res.status(404).send("Data pengeluaran tidak ditemukan");
    }
  } catch (error) {
    console.error("Error saat menghapus pengeluaran:", error);
    res.status(500).send("Terjadi kesalahan saat menghapus data pengeluaran");
  }
};
