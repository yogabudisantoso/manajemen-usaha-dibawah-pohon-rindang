const db = require("../config/database");

class Stok {
  static async create(
    { pengeluaran_barang_id, barang_id, jumlah_stok, usaha_id },
    connection = null
  ) {
    const executor = connection || db;
    const [result] = await executor.execute(
      `INSERT INTO stok (pengeluaran_barang_id, barang_id, jumlah_stok, usaha_id)
       VALUES (?, ?, ?, ?)`,
      [pengeluaran_barang_id, barang_id, jumlah_stok, usaha_id]
    );
    return result.insertId;
  }

  static async findAvailableByBarangId(
    barangId,
    usahaId = null,
    connection = null
  ) {
    const executor = connection || db;
    const params = [barangId];
    let query = `
      SELECT s.*, pb.barang_id, pb.jumlah_beli
      FROM stok s
      JOIN pengeluaran_barang pb ON s.pengeluaran_barang_id = pb.id
      WHERE pb.barang_id = ? AND s.jumlah_stok > 0
    `;
    if (usahaId !== null && usahaId !== undefined) {
      query += " AND s.usaha_id = ?";
      params.push(usahaId);
    }
    query += " ORDER BY s.created_at ASC, s.id ASC";

    const [rows] = await executor.execute(query, params);
    return rows;
  }

  static async decrementByBarangId(
    barangId,
    amount,
    usahaId = null,
    connection = null
  ) {
    if (!amount || amount <= 0) return 0;
    const executor = connection || db;
    const rows = await Stok.findAvailableByBarangId(
      barangId,
      usahaId,
      connection
    );
    let remaining = amount;
    for (const row of rows) {
      if (remaining <= 0) break;
      const use = Math.min(remaining, row.jumlah_stok);
      const [result] = await executor.execute(
        "UPDATE stok SET jumlah_stok = jumlah_stok - ? WHERE id = ? AND jumlah_stok >= ?",
        [use, row.id, use]
      );
      if (result.affectedRows > 0) {
        remaining -= use;
      }
    }
    return amount - remaining;
  }
}

module.exports = Stok;
