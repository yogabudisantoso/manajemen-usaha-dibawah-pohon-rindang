const Pemasukan = require("../models/Pemasukan");
const Menu = require("../models/Menu");
const MenuBahan = require("../models/MenuBahan");
const Stok = require("../models/Stok");
const db = require("../config/database");

exports.createPemasukan = async (req, res) => {
  try {
    const rawItems = req.body.items;
    const user_id = req.session.user ? req.session.user.id : 1;

    const items = Array.isArray(rawItems)
      ? rawItems
      : rawItems
      ? [rawItems]
      : [];

    const sanitizedItems = items
      .map((item) => ({
        menu_id: Number.parseInt(item.menu_id, 10),
        jumlah: Number.parseInt(item.jumlah, 10),
      }))
      .filter(
        (item) =>
          Number.isInteger(item.menu_id) &&
          item.menu_id > 0 &&
          Number.isInteger(item.jumlah) &&
          item.jumlah > 0
      );

    if (sanitizedItems.length === 0) {
      return res.status(400).json({
        message: "Daftar item pesanan tidak valid atau kosong",
        status: "error",
      });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const createdPemasukan = [];

      for (const item of sanitizedItems) {
        const [menuRows] = await connection.execute(
          `SELECT id, nama_menu, harga, usaha_id, stok
           FROM menu_makanan
           WHERE id = ?
           FOR UPDATE`,
          [item.menu_id]
        );

        if (!menuRows || menuRows.length === 0) {
          const err = new Error(
            `Menu dengan ID ${item.menu_id} tidak ditemukan`
          );
          err.status = 404;
          throw err;
        }

        const menu = menuRows[0];
        const bahanList =
          (await MenuBahan.findByMenuId(item.menu_id, connection)) || [];

        const currentMenuStok =
          menu.stok !== null && menu.stok !== undefined
            ? Number(menu.stok)
            : null;
        if (
          currentMenuStok !== null &&
          (Number.isNaN(currentMenuStok) || currentMenuStok < item.jumlah)
        ) {
          const err = new Error(
            `Stok menu ${menu.nama_menu} tidak mencukupi. Tersisa ${currentMenuStok}, dibutuhkan ${item.jumlah}`
          );
          err.status = 400;
          throw err;
        }

        if (Array.isArray(bahanList) && bahanList.length > 0) {
          for (const bahan of bahanList) {
            const qtyPerMenu = Number.parseFloat(bahan.qty_per_menu);
            const needed = qtyPerMenu * item.jumlah;
            if (!Number.isFinite(needed) || needed <= 0) continue;

            const consumed = await Stok.decrementByBarangId(
              bahan.barang_id,
              needed,
              menu.usaha_id,
              connection
            );

            if (consumed < needed) {
              console.warn(
                `Stok bahan ${bahan.nama_barang} tidak mencukupi. Dibutuhkan ${needed}, terpakai ${consumed}`
              );
            }
          }
        }

        if (currentMenuStok !== null) {
          const [updateMenuStock] = await connection.execute(
            `UPDATE menu_makanan
             SET stok = stok - ?
             WHERE id = ?`,
            [item.jumlah, menu.id]
          );
          if (!updateMenuStock || updateMenuStock.affectedRows === 0) {
            const err = new Error(
              `Gagal memperbarui stok menu ${menu.nama_menu}`
            );
            err.status = 400;
            throw err;
          }
        }

        const harga_satuan = Number(menu.harga);
        const total_harga_item = harga_satuan * item.jumlah;
        const pemasukanId = await Pemasukan.create(
          {
            menu_id: menu.id,
            user_id,
            jumlah: item.jumlah,
            harga_satuan,
            total_harga_item,
            usaha_id: menu.usaha_id || null,
          },
          connection
        );

        createdPemasukan.push({
          id: pemasukanId,
          menu_id: menu.id,
          jumlah: item.jumlah,
          harga_satuan,
          total_harga_item,
          usaha_id: menu.usaha_id || null,
          nama_menu: menu.nama_menu,
        });
      }

      if (createdPemasukan.length === 0) {
        const err = new Error("Tidak ada pesanan valid yang diproses");
        err.status = 400;
        throw err;
      }

      await connection.commit();

      const io = req.app.get("io");
      if (io) {
        const totalHarga = createdPemasukan.reduce(
          (sum, item) => sum + (item.total_harga_item || 0),
          0
        );
        const detailPesanan = createdPemasukan
          .map(
            (item) =>
              `${item.jumlah} x ${item.nama_menu} @ Rp ${item.harga_satuan.toLocaleString(
                "id-ID"
              )} = Rp ${item.total_harga_item.toLocaleString("id-ID")}`
          )
          .join("<br>");
        const notifData = {
          type: "pemasukan",
          transaction: {
            detail: detailPesanan,
            total: Number(totalHarga),
          },
        };
        console.log("DATA YANG DIKIRIM KE FRONTEND:", notifData);
        io.emit("new_transaction", notifData);
      } else {
        console.warn("Socket.IO not available to emit new transaction event.");
      }

      return res.status(201).json({
        message: "Pesanan berhasil diproses",
        status: "success",
        data: createdPemasukan,
      });
    } catch (err) {
      await connection.rollback();
      const statusCode = err.status || 500;
      console.error("Error dalam createPemasukan:", err);
      return res.status(statusCode).json({
        message: err.message || "Terjadi kesalahan saat memproses pesanan",
        status: "error",
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error dalam createPemasukan:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server saat memproses pesanan",
      status: "error",
      error: error.message,
    });
  }
};

exports.getAllPemasukan = async (req, res) => {
  try {
    const usaha_id = req.query.usaha_id; // Ambil usaha_id dari query parameter
    const rawPemasukan = await Pemasukan.findAll(usaha_id); // Teruskan usaha_id ke findAll

    // Mengelompokkan data berdasarkan user_id dan waktu_transaksi
    const groupedPemasukan = [];
    const groupMap = new Map();
    const timeWindow = 5000; // 5 detik dalam milidetik

    rawPemasukan.forEach((item) => {
      // Gunakan user_id dan waktu transaksi sebagai kunci potensial untuk grouping
      const userId = item.user_id; // Asumsikan field user_id ada
      // Pastikan waktu transaksi adalah Date object untuk perbandingan
      const transactionTime = new Date(item.waktu_transaksi).getTime();

      let foundGroup = null;

      // Cari grup yang sudah ada dalam window waktu yang ditentukan
      for (const group of groupedPemasukan) {
        const groupTime = new Date(group.waktu_transaksi).getTime();
        if (
          group.user_id === userId &&
          Math.abs(transactionTime - groupTime) <= timeWindow
        ) {
          foundGroup = group;
          break;
        }
      }

      // Pastikan total_harga_item adalah angka sebelum dijumlahkan
      const currentItemTotal = parseFloat(item.total_harga_item);

      if (foundGroup) {
        // Tambahkan item ke grup yang sudah ada
        foundGroup.items.push({
          nama_menu: item.nama_menu,
          jumlah: item.jumlah,
          harga_satuan: parseFloat(item.harga_satuan), // Konversi juga harga_satuan untuk konsistensi
          total_harga_item: currentItemTotal,
        });
        // Lakukan penjumlahan pada angka
        foundGroup.total_harga += currentItemTotal;
        foundGroup.nama_usaha = item.nama_usaha || foundGroup.nama_usaha; // Pastikan nama_usaha diperbarui atau dipertahankan
        // Perbarui waktu transaksi grup agar mencakup item terbaru (opsional)
        // foundGroup.waktu_transaksi = item.waktu_transaksi;
      } else {
        // Buat grup baru
        groupedPemasukan.push({
          // id: item.id, // Jika perlu id transaksi tunggal, ini bisa jadi masalah tanpa transaction_id di DB
          user_id: userId,
          waktu_transaksi: item.waktu_transaksi,
          items: [
            {
              nama_menu: item.nama_menu,
              jumlah: item.jumlah,
              harga_satuan: parseFloat(item.harga_satuan),
              total_harga_item: currentItemTotal,
            },
          ],
          // Inisialisasi total_harga dengan angka
          total_harga: currentItemTotal,
          // Simpan id pemasukan individual untuk kemungkinan aksi hapus per item
          pemasukanIds: [item.id],
          nama_usaha: item.nama_usaha || "-", // Tambahkan nama_usaha di sini
        });
      }
      // Tambahkan id pemasukan ke grup yang ditemukan juga
      if (foundGroup) {
        foundGroup.pemasukanIds.push(item.id);
      }
    });

    // Urutkan grup berdasarkan waktu transaksi (opsional)
    groupedPemasukan.sort(
      (a, b) => new Date(b.waktu_transaksi) - new Date(a.waktu_transaksi)
    );

    // Jangan kirim res.json() di sini, cukup kembalikan data yang sudah dikelompokkan
    return groupedPemasukan;
  } catch (error) {
    console.error("Error dalam getAllPemasukan:", error);
    // Lempar error agar dapat ditangkap oleh route handler di app.js
    throw new Error("Terjadi kesalahan saat memuat data pemasukan");
  }
};

exports.getPemasukanById = async (req, res) => {
  try {
    const { id } = req.params;
    const pemasukan = await Pemasukan.findById(id);

    if (!pemasukan) {
      return res.status(404).json({
        message: "Data pemasukan tidak ditemukan",
        status: "error",
      });
    }
    // Ubah format tanggal jika diperlukan untuk tampilan
    const formattedPemasukan = {
      ...pemasukan,
      waktu_transaksi: new Date(pemasukan.waktu_transaksi).toLocaleString(
        "id-ID"
      ),
    };

    res.json({
      message: "Data pemasukan berhasil diambil",
      status: "success",
      data: formattedPemasukan,
    });
  } catch (error) {
    console.error("Error dalam getPemasukanById:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server saat mengambil data pemasukan",
      status: "error",
      error: error.message,
    });
  }
};

exports.updatePemasukan = async (req, res) => {
  try {
    const { id } = req.params;
    const { menu_id, user_id, jumlah } = req.body;

    // Ambil data menu untuk mendapatkan harga satuan
    const menu = await Menu.findById(menu_id);
    if (!menu) {
      return res.status(404).json({
        message: "Menu tidak ditemukan",
        status: "error",
      });
    }

    const harga_satuan = menu.harga;
    const total_harga_item = harga_satuan * jumlah;

    const pemasukanData = {
      menu_id,
      user_id: user_id || req.session.user.id, // Gunakan user_id dari body atau sesi
      jumlah,
      harga_satuan,
      total_harga_item,
      // waktu_transaksi akan diupdate otomatis oleh database
    };

    const updated = await Pemasukan.update(id, pemasukanData);

    if (!updated) {
      return res.status(404).json({
        message: "Data pemasukan tidak ditemukan",
        status: "error",
      });
    }

    res.json({
      message: "Data pemasukan berhasil diperbarui",
      status: "success",
      data: {
        id,
        ...pemasukanData,
      },
    });
  } catch (error) {
    console.error("Error dalam updatePemasukan:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server saat memperbarui data pemasukan",
      status: "error",
      error: error.message,
    });
  }
};

exports.deletePemasukan = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Pemasukan.delete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Data pemasukan tidak ditemukan",
        status: "error",
      });
    }

    res.json({
      message: "Data pemasukan berhasil dihapus",
      status: "success",
    });
  } catch (error) {
    console.error("Error dalam deletePemasukan:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server saat menghapus data pemasukan",
      status: "error",
      error: error.message,
    });
  }
};
