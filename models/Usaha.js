const db = require("../config/database");

class Usaha {
  static async getAllUsaha() {
    try {
      const [rows] = await db.execute(
        "SELECT id, nama_usaha, deskripsi FROM usaha ORDER BY nama_usaha ASC"
      );
      return rows;
    } catch (error) {
      throw new Error(`Gagal mengambil data usaha: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute("SELECT * FROM usaha WHERE id = ?", [id]);
      return rows[0];
    } catch (error) {
      throw new Error(
        `Gagal menemukan usaha dengan ID ${id}: ${error.message}`
      );
    }
  }
}

module.exports = Usaha;
