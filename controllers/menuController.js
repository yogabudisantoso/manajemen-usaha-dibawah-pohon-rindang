const Menu = require("../models/Menu");
const db = require("../config/database"); // Import db di sini

// Fungsi helper untuk format angka menjadi mata uang (misal: 1000000 -> 1.000.000)
const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID").format(number);
};

exports.createMenu = async (req, res) => {
  try {
    console.log("Menerima permintaan tambah menu:");
    console.log("req.body:", req.body); // Log data tekstual
    console.log("req.file:", req.file); // Log informasi file yang diunggah

    const { nama_menu, deskripsi, usaha_id } = req.body;
    const harga = parseFloat(req.body.harga);
    const stok = parseInt(req.body.stok, 10);
    const gambar = req.file ? "/uploads/" + req.file.filename : ""; // Path relatif atau string kosong

    // Validasi input dasar (termasuk memeriksa hasil konversi)
    if (!nama_menu || isNaN(harga) || harga <= 0 || isNaN(stok) || stok < 0) {
      console.log("Validasi gagal setelah konversi.");
      let message = "Nama menu, harga, dan stok harus diisi dengan benar.";
      if (isNaN(harga) || harga <= 0)
        message = "Harga harus berupa angka positif.";
      if (isNaN(stok) || stok < 0)
        message = "Stok harus berupa angka non-negatif.";
      if (!nama_menu) message = "Nama menu harus diisi.";

      // Jika ini permintaan AJAX/API, kirim respons JSON
      if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
        return res.status(400).json({
          message: message,
          status: "error",
        });
      }
      // Jika ini form submit biasa, kirim pesan error
      return res.status(400).send(message);
    }

    console.log("Mencoba menyimpan data ke database:", {
      nama_menu,
      deskripsi,
      harga,
      stok,
      gambar,
      usaha_id,
    });

    const menuId = await Menu.create({
      nama_menu,
      deskripsi,
      harga,
      stok,
      gambar,
      usaha_id,
    });

    // Jika ini permintaan AJAX/API, kirim respons JSON
    if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
      const createdMenu = await Menu.findById(menuId);
      return res.status(201).json({
        message: "Menu makanan berhasil ditambahkan",
        status: "success",
        data: createdMenu,
      });
    }

    // Jika ini form submit biasa, lakukan redirect
    console.log(
      "Data menu berhasil disimpan dengan ID:",
      menuId,
      " - Melakukan redirect ke /menu"
    );
    res.redirect("/menu");
  } catch (error) {
    console.error("Error dalam createMenu controller:", error);
    const errorMessage = error.message.startsWith("Gagal membuat menu:")
      ? error.message
      : "Terjadi kesalahan server saat menyimpan data menu";

    // Jika ini permintaan AJAX/API, kirim respons JSON error
    if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
      return res.status(500).json({
        message: errorMessage,
        status: "error",
      });
    }
    // Jika ini form submit biasa, kirim pesan error
    res.status(500).send("Terjadi kesalahan server: " + errorMessage);
  }
};

exports.getAllMenuItems = async (usahaId = null) => {
  try {
    const menu = await Menu.findAll(usahaId); // Menggunakan findAll yang sudah JOIN dengan usaha

    // Jangan format harga, biarkan tetap angka
    // const formattedMenu = menu.map((item) => ({
    //   ...item,
    //   harga: formatRupiah(item.harga),
    // }));

    // Hanya mengembalikan data asli dari DB
    return menu;
  } catch (error) {
    console.error("Error dalam getAllMenuItems:", error);
    throw new Error(
      "Terjadi kesalahan saat mengambil data menu untuk tampilan"
    );
  }
};

exports.getMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findById(id);

    if (!menu) {
      return res.status(404).json({ message: "Menu makanan tidak ditemukan" });
    }

    res.json({
      message: "Menu makanan berhasil diambil",
      data: menu,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_menu, deskripsi, harga, stok, usaha_id } = req.body; // Tidak mengambil gambar dari req.body saat update
    let gambar = req.file
      ? "/uploads/" + req.file.filename
      : req.body.existing_gambar; // Mengambil gambar baru atau yang sudah ada

    // Validasi input dasar (termasuk memeriksa hasil konversi) untuk update
    const parsedHarga = parseFloat(harga);
    const parsedStok = parseInt(stok, 10);
    if (
      !nama_menu ||
      isNaN(parsedHarga) ||
      parsedHarga <= 0 ||
      isNaN(parsedStok) ||
      parsedStok < 0
    ) {
      let message = "Nama menu, harga, dan stok harus diisi dengan benar.";
      if (isNaN(parsedHarga) || parsedHarga <= 0)
        message = "Harga harus berupa angka positif.";
      if (isNaN(parsedStok) || parsedStok < 0)
        message = "Stok harus berupa angka non-negatif.";
      if (!nama_menu) message = "Nama menu harus diisi.";
      return res.status(400).json({
        message: message,
        status: "error",
      });
    }

    // Cek apakah menu ada
    const existingMenu = await Menu.findById(id);
    if (!existingMenu) {
      return res.status(404).json({
        message: "Menu makanan tidak ditemukan",
        status: "error",
      });
    }

    // Jika tidak ada file baru diunggah dan tidak ada gambar yang ada sebelumnya, set gambar menjadi string kosong
    if (!req.file && !req.body.existing_gambar) {
      gambar = "";
    }

    const menuData = {
      nama_menu,
      deskripsi,
      harga: parsedHarga,
      stok: parsedStok,
      gambar,
      usaha_id,
    };
    const updated = await Menu.update(id, menuData);

    if (updated) {
      // Redirect ke halaman daftar menu setelah sukses update
      res.redirect("/menu");
    } else {
      // Jika tidak ada baris terpengaruh tapi tidak ada error, mungkin data yang dikirim sama dengan yang sudah ada
      const updatedMenu = await Menu.findById(id);
      res.status(200).json({
        message: "Tidak ada perubahan pada data menu",
        status: "success",
        data: updatedMenu,
      });
    }
  } catch (error) {
    console.error("Error dalam updateMenu controller:", error);
    const errorMessage = error.message.startsWith("Gagal mengupdate menu:")
      ? error.message
      : "Terjadi kesalahan server saat mengupdate data menu";
    res.status(500).json({
      message: errorMessage,
      status: "error",
    });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah menu ada
    const existingMenu = await Menu.findById(id);
    if (!existingMenu) {
      // Jika ini permintaan AJAX/API, kirim JSON error
      if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
        return res
          .status(404)
          .json({ message: "Menu makanan tidak ditemukan", status: "error" });
      }
      // Jika tidak, mungkin render halaman error atau redirect dengan pesan
      // Untuk saat ini, kita kirim pesan teks sederhana
      return res.status(404).send("Menu makanan tidak ditemukan");
    }

    // TODO: Jika Anda menyimpan file gambar di sistem file, tambahkan logika untuk menghapus file terkait di sini sebelum menghapus dari database

    const deleted = await Menu.delete(id);

    if (deleted) {
      // Jika ini permintaan AJAX/API, kirim JSON sukses
      if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
        res.status(200).json({
          message: "Menu makanan berhasil dihapus",
          status: "success",
        });
      } else {
        // Jika tidak (kemungkinan dari form HTML), lakukan redirect
        console.log(
          "Data menu berhasil dihapus dengan ID:",
          id,
          " - Melakukan redirect ke /menu"
        );
        res.redirect("/menu"); // Redirect ke halaman daftar menu setelah sukses
      }
    } else {
      // Jika gagal menghapus di model
      // Jika ini permintaan AJAX/API, kirim JSON error
      if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
        res
          .status(400)
          .json({ message: "Gagal menghapus menu makanan", status: "error" });
      } else {
        // Jika tidak, kirim pesan teks sederhana
        res.status(400).send("Gagal menghapus menu makanan");
      }
    }
  } catch (error) {
    console.error("Error dalam deleteMenu controller:", error);
    const errorMessage = error.message.startsWith("Gagal menghapus menu:")
      ? error.message
      : "Terjadi kesalahan server saat menghapus data menu";

    // Jika ini permintaan AJAX/API, kirim JSON error
    if (req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest") {
      res.status(500).json({
        message: errorMessage,
        status: "error",
      });
    } else {
      // Jika tidak, kirim pesan teks sederhana
      res.status(500).send("Terjadi kesalahan server: " + errorMessage);
    }
  }
};

exports.getMenuForEdit = async (id) => {
  try {
    const menu = await Menu.findById(id);
    if (!menu) {
      throw new Error("Menu makanan tidak ditemukan");
    }
    return menu;
  } catch (error) {
    console.error("Error in getMenuForEdit:", error);
    throw error;
  }
};

exports.renderCreateMenuForm = async (req, res) => {
  try {
    const usahaList = await Menu.getAllUsaha();
    res.render("pages/menu/create", {
      title: "Tambah Menu Makanan",
      usahaList,
    });
  } catch (error) {
    console.error("Error in renderCreateMenuForm (catch block):", error);
    res
      .status(500)
      .send("Terjadi kesalahan server saat memuat formulir pembuatan menu.");
  }
};

exports.renderEditMenuForm = async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findById(id);
    const usahaList = await Menu.getAllUsaha();

    if (!menu) {
      return res.status(404).send("Menu makanan tidak ditemukan");
    }

    res.render("pages/menu/edit", {
      menu,
      usahaList,
      title: "Edit Menu Makanan",
    });
  } catch (error) {
    console.error("Error in renderEditMenuForm:", error);
    res
      .status(500)
      .send("Terjadi kesalahan server saat memuat formulir edit menu.");
  }
};

exports.renderMenuIndex = async (req, res) => {
  try {
    const { usaha_id } = req.query;
    const menuItems = await Menu.findAll(usaha_id); // Ambil data menu dari model
    const usahaList = await Menu.getAllUsaha(); // Ambil daftar semua usaha

    // Format harga menu sebelum dikirim ke tampilan
    const formattedMenuItems = menuItems.map((item) => ({
      ...item,
      harga: formatRupiah(item.harga),
    }));

    res.render("pages/menu/index", {
      title: "Manajemen Menu Makanan",
      menu: formattedMenuItems, // Gunakan data yang sudah diformat
      usahaList: usahaList,
      selectedUsahaId: usaha_id || null,
    });
  } catch (error) {
    console.error("Error in renderMenuIndex:", error);
    res.status(500).send("Terjadi kesalahan saat memuat data menu.");
  }
};
