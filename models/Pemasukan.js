const db = require("../config/database");

class Pemasukan {
  static async create(data) {
    const {
      menu_id,
      user_id,
      jumlah,
      harga_satuan,
      total_harga_item,
      usaha_id,
    } = data;
    const query = `
      INSERT INTO pemasukan (menu_id, user_id, jumlah, harga_satuan, total_harga_item, usaha_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await db.execute(query, [
      menu_id,
      user_id,
      jumlah,
      harga_satuan,
      total_harga_item,
      usaha_id,
    ]);
    console.log("HASIL INSERT PEMASUKAN:", result);
    return result[0].insertId;
  }

  static async findAll(usahaId = null) {
    let query = `
      SELECT p.*, m.nama_menu, u.nama_usaha
      FROM pemasukan p
      LEFT JOIN menu_makanan m ON p.menu_id = m.id
      LEFT JOIN usaha u ON p.usaha_id = u.id
    `;

    const params = [];
    if (usahaId) {
      query += ` WHERE p.usaha_id = ?`;
      params.push(usahaId);
    }

    query += ` ORDER BY p.waktu_transaksi DESC`;

    const [rows] = await db.query(query, params);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT p.*, m.nama_menu, u.nama_usaha
      FROM pemasukan p
      LEFT JOIN menu_makanan m ON p.menu_id = m.id
      LEFT JOIN usaha u ON p.usaha_id = u.id
      WHERE p.id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  static async update(id, data) {
    const {
      menu_id,
      user_id,
      jumlah,
      harga_satuan,
      total_harga_item,
      usaha_id,
    } = data;
    const query = `
      UPDATE pemasukan
      SET menu_id = ?, user_id = ?, jumlah = ?, harga_satuan = ?, total_harga_item = ?, usaha_id = ?
      WHERE id = ?
    `;
    const result = await db.query(query, [
      menu_id,
      user_id,
      jumlah,
      harga_satuan,
      total_harga_item,
      usaha_id,
      id,
    ]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const query = "DELETE FROM pemasukan WHERE id = ?";
    const result = await db.query(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Pemasukan;
