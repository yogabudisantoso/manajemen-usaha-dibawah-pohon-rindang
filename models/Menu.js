const db = require("../config/database");

class Menu {
  static async create(menuData, connection = null) {
    try {
      const { nama_menu, deskripsi, harga, stok, gambar, usaha_id } = menuData;
      const executor = connection || db;

      // Validasi input
      if (!nama_menu || !harga || !stok || !usaha_id) {
        throw new Error("Nama menu, harga, stok, dan ID usaha harus diisi");
      }

      // Validasi tipe data
      if (typeof harga !== "number" || harga <= 0) {
        throw new Error("Harga harus berupa angka positif");
      }

      if (typeof stok !== "number" || stok < 0) {
        throw new Error("Stok harus berupa angka non-negatif");
      }

      const [result] = await executor.execute(
        "INSERT INTO menu_makanan (nama_menu, deskripsi, harga, stok, gambar, usaha_id) VALUES (?, ?, ?, ?, ?, ?)",
        [nama_menu, deskripsi, harga, stok, gambar, usaha_id]
      );
      return result.insertId;
    } catch (error) {
      throw new Error(`Gagal membuat menu: ${error.message}`);
    }
  }

  static async findAll(usahaId = null) {
    try {
      let query =
        "SELECT m.*, u.nama_usaha FROM menu_makanan m LEFT JOIN usaha u ON m.usaha_id = u.id ORDER BY m.nama_menu ASC";
      let params = [];

      if (usahaId) {
        query =
          "SELECT m.*, u.nama_usaha FROM menu_makanan m LEFT JOIN usaha u ON m.usaha_id = u.id WHERE m.usaha_id = ? ORDER BY m.nama_menu ASC";
        params.push(usahaId);
      }

      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      console.error("Error in Menu.findAll:", error);
      throw new Error(`Gagal mengambil data menu: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      if (!id) {
        throw new Error("ID menu harus diisi");
      }

      const [rows] = await db.query(
        "SELECT m.*, u.nama_usaha FROM menu_makanan m LEFT JOIN usaha u ON m.usaha_id = u.id WHERE m.id = ?",
        [id]
      );
      if (rows.length === 0) {
        throw new Error("Menu tidak ditemukan");
      }
      return rows[0];
    } catch (error) {
      throw new Error(`Gagal mengambil menu: ${error.message}`);
    }
  }

  static async update(id, menuData, connection = null) {
    try {
      const { nama_menu, deskripsi, harga, stok, gambar, usaha_id } = menuData;
      const executor = connection || db;

      // Validasi input
      if (!id || !nama_menu || !harga || !stok || !usaha_id) {
        throw new Error("ID, nama menu, harga, stok, dan ID usaha harus diisi");
      }

      // Validasi tipe data
      if (typeof harga !== "number" || harga <= 0) {
        throw new Error("Harga harus berupa angka positif");
      }

      if (typeof stok !== "number" || stok < 0) {
        throw new Error("Stok harus berupa angka non-negatif");
      }

      const [result] = await executor.execute(
        "UPDATE menu_makanan SET nama_menu = ?, deskripsi = ?, harga = ?, stok = ?, gambar = ?, usaha_id = ? WHERE id = ?",
        [nama_menu, deskripsi, harga, stok, gambar, usaha_id, id]
      );

      if (result.affectedRows === 0) {
        throw new Error("Menu tidak ditemukan");
      }
      return true;
    } catch (error) {
      throw new Error(`Gagal mengupdate menu: ${error.message}`);
    }
  }

  static async delete(id, connection = null) {
    try {
      if (!id) {
        throw new Error("ID menu harus diisi");
      }

      const executor = connection || db;
      const [result] = await executor.execute("DELETE FROM menu_makanan WHERE id = ?", [
        id,
      ]);
      if (result.affectedRows === 0) {
        throw new Error("Menu tidak ditemukan");
      }
      return true;
    } catch (error) {
      throw new Error(`Gagal menghapus menu: ${error.message}`);
    }
  }

  static async reduceStock(id, quantity) {
    try {
      console.log(`=== REDUCE STOCK START ===`);
      console.log(`Menu ID: ${id}, Quantity to reduce: ${quantity}`);
      
      if (!id || !quantity || quantity <= 0) {
        throw new Error("ID menu dan jumlah harus diisi dengan nilai positif");
      }

      // Cek stok saat ini
      const menu = await this.findById(id);
      if (!menu) {
        throw new Error("Menu tidak ditemukan");
      }

      console.log(`Found menu: ${menu.nama_menu}, Current stock: ${menu.stok}`);

      if (menu.stok < quantity) {
        throw new Error(`Stok tidak mencukupi. Stok tersedia: ${menu.stok}, diminta: ${quantity}`);
      }

      // Kurangi stok
      console.log(`Executing stock reduction query...`);
      const [result] = await db.query(
        "UPDATE menu_makanan SET stok = stok - ? WHERE id = ? AND stok >= ?",
        [quantity, id, quantity]
      );

      console.log(`Query result:`, result);
      console.log(`Affected rows: ${result.affectedRows}`);

      if (result.affectedRows === 0) {
        throw new Error("Gagal mengurangi stok. Mungkin stok tidak mencukupi");
      }

      console.log(`=== REDUCE STOCK SUCCESS ===`);
      return true;
    } catch (error) {
      console.error(`=== REDUCE STOCK ERROR ===`, error);
      throw new Error(`Gagal mengurangi stok: ${error.message}`);
    }
  }

  static async getAllUsaha() {
    try {
      const [rows] = await db.execute(
        "SELECT id, nama_usaha FROM usaha ORDER BY nama_usaha ASC"
      );
      return rows;
    } catch (error) {
      throw new Error(`Gagal mengambil data usaha: ${error.message}`);
    }
  }
}

module.exports = Menu;
