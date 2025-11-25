const db = require("../config/database");

class Pengeluaran {
  static async create(pengeluaranData) {
    const {
      barang_id,
      user_id,
      jumlah_beli,
      harga_beli_satuan,
      total_biaya_item,
      unit,
      usaha_id,
      tanggal,
    } = pengeluaranData;
    // Coerce numeric values to safe types/strings before sending to DB
    const hargaParam =
      typeof harga_beli_satuan === "number"
        ? harga_beli_satuan
        : parseFloat(String(harga_beli_satuan).replace(/[^0-9.\-]/g, "")) || 0;
    const totalParam =
      typeof total_biaya_item === "number"
        ? total_biaya_item
        : parseFloat(String(total_biaya_item).replace(/[^0-9.\-]/g, "")) || 0;
    const params = [
      barang_id,
      user_id,
      jumlah_beli,
      unit || "pcs",
      Number(hargaParam).toFixed(2),
      Number(totalParam).toFixed(2),
      usaha_id,
      tanggal,
    ];
    const [result] = await db.execute(
      "INSERT INTO pengeluaran_barang (barang_id, user_id, jumlah_beli, unit, harga_beli_satuan, total_biaya_item, usaha_id, tanggal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      params
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
      unit,
      usaha_id,
      tanggal,
    } = pengeluaranData;
    const [result] = await db.execute(
      "UPDATE pengeluaran_barang SET barang_id = ?, user_id = ?, jumlah_beli = ?, unit = ?, harga_beli_satuan = ?, total_biaya_item = ?, usaha_id = ?, tanggal = ? WHERE id = ?",
      [
        barang_id,
        user_id,
        jumlah_beli,
        unit || "pcs",
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

  // Method untuk menghitung total biaya pengeluaran
  static async getTotalCost(usahaId = null, startDate = null, endDate = null) {
    let query = `SELECT SUM(total_biaya_item) as total_cost FROM pengeluaran_barang pb`;
    const params = [];
    const conditions = [];

    if (usahaId) {
      conditions.push(`pb.usaha_id = ?`);
      params.push(usahaId);
    }

    if (startDate) {
      conditions.push(`pb.tanggal >= ?`);
      params.push(startDate);
    }

    if (endDate) {
      conditions.push(`pb.tanggal <= ?`);
      params.push(endDate);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    const [rows] = await db.execute(query, params);
    return rows[0].total_cost || 0;
  }

  // Method untuk menghitung total biaya per usaha
  static async getTotalCostByUsaha() {
    const query = `
      SELECT 
        us.id,
        us.nama_usaha,
        COALESCE(SUM(pb.total_biaya_item), 0) as total_cost,
        COUNT(pb.id) as total_items
      FROM usaha us
      LEFT JOIN pengeluaran_barang pb ON us.id = pb.usaha_id
      GROUP BY us.id, us.nama_usaha
      ORDER BY total_cost DESC
    `;

    const [rows] = await db.execute(query);
    return rows;
  }

  // Method untuk menghitung total biaya per periode (bulanan)
  static async getTotalCostByMonth(year = null, usahaId = null) {
    let query = `
      SELECT 
        YEAR(pb.tanggal) as year,
        MONTH(pb.tanggal) as month,
        MONTHNAME(pb.tanggal) as month_name,
        SUM(pb.total_biaya_item) as total_cost,
        COUNT(pb.id) as total_items
      FROM pengeluaran_barang pb
    `;
    const params = [];
    const conditions = [];

    if (year) {
      conditions.push(`YEAR(pb.tanggal) = ?`);
      params.push(year);
    }

    if (usahaId) {
      conditions.push(`pb.usaha_id = ?`);
      params.push(usahaId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` GROUP BY YEAR(pb.tanggal), MONTH(pb.tanggal) ORDER BY year DESC, month DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
  }

  // Metode lain seperti findByBarangId, findByUserId, findByDateRange bisa ditambahkan
}

module.exports = Pengeluaran;
