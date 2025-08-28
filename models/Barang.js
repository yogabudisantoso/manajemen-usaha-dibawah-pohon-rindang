const db = require("../config/database");

class Barang {
  static async create(barangData) {
    const { nama_barang, harga_beli, usaha_id } = barangData;
    const [result] = await db.execute(
      "INSERT INTO barang (nama_barang, harga_beli, usaha_id) VALUES (?, ?, ?)",
      [nama_barang, harga_beli, usaha_id]
    );
    return result.insertId;
  }

  static async findAll(usahaId = null) {
    let query = `
      SELECT b.*, u.nama_usaha
      FROM barang b
      LEFT JOIN usaha u ON b.usaha_id = u.id
    `;
    const params = [];

    if (usahaId) {
      query += ` WHERE b.usaha_id = ?`;
      params.push(usahaId);
    }

    query += ` ORDER BY b.created_at DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT b.*, u.nama_usaha 
      FROM barang b 
      LEFT JOIN usaha u ON b.usaha_id = u.id 
      WHERE b.id = ?
    `,
      [id]
    );
    return rows[0];
  }

  static async findByNamaBarang(nama_barang) {
    const [rows] = await db.execute(
      "SELECT * FROM barang WHERE nama_barang = ?",
      [nama_barang]
    );
    return rows[0];
  }

  static async update(id, barangData) {
    const { nama_barang, harga_beli, usaha_id } = barangData;
    const [result] = await db.execute(
      "UPDATE barang SET nama_barang = ?, harga_beli = ?, usaha_id = ? WHERE id = ?",
      [nama_barang, harga_beli, usaha_id, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute("DELETE FROM barang WHERE id = ?", [id]);
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
}

module.exports = Barang;
