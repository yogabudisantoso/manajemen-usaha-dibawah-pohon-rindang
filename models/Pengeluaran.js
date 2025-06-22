const db = require("../config/database");

class Pengeluaran {
  static async create(pengeluaranData) {
    const {
      barang_id,
      user_id,
      jumlah_beli,
      harga_beli_satuan,
      total_biaya_item,
      usaha_id,
      tanggal,
    } = pengeluaranData;
    const [result] = await db.execute(
      "INSERT INTO pengeluaran_barang (barang_id, user_id, jumlah_beli, harga_beli_satuan, total_biaya_item, usaha_id, tanggal) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        barang_id,
        user_id,
        jumlah_beli,
        harga_beli_satuan,
        total_biaya_item,
        usaha_id,
        tanggal,
      ]
    );
    return result.insertId;
  }

  static async findAll(usahaId = null) {
    let query = `SELECT pb.*, b.nama_barang, u.username, us.nama_usaha AS nama_usaha
                 FROM pengeluaran_barang pb
                 JOIN barang b ON pb.barang_id = b.id
                 JOIN users u ON pb.user_id = u.id
                 LEFT JOIN usaha us ON pb.usaha_id = us.id`;
    const params = [];

    if (usahaId) {
      query += ` WHERE pb.usaha_id = ?`;
      params.push(usahaId);
    }

    query += ` ORDER BY pb.tanggal DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT pb.*, b.nama_barang, u.username, us.nama_usaha AS usaha
       FROM pengeluaran_barang pb
       JOIN barang b ON pb.barang_id = b.id
       JOIN users u ON pb.user_id = u.id
       LEFT JOIN usaha us ON pb.usaha_id = us.id
       WHERE pb.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async update(id, pengeluaranData) {
    const {
      barang_id,
      user_id,
      jumlah_beli,
      harga_beli_satuan,
      total_biaya_item,
      usaha_id,
      tanggal,
    } = pengeluaranData;
    const [result] = await db.execute(
      "UPDATE pengeluaran_barang SET barang_id = ?, user_id = ?, jumlah_beli = ?, harga_beli_satuan = ?, total_biaya_item = ?, usaha_id = ?, tanggal = ? WHERE id = ?",
      [
        barang_id,
        user_id,
        jumlah_beli,
        harga_beli_satuan,
        total_biaya_item,
        usaha_id,
        tanggal,
        id,
      ]
    );
    return result.affectedRows > 0;
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

  static async delete(id) {
    const [result] = await db.execute(
      "DELETE FROM pengeluaran_barang WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  // Metode lain seperti findByBarangId, findByUserId, findByDateRange bisa ditambahkan
}

module.exports = Pengeluaran;
