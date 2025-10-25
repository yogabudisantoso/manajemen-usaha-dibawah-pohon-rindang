const db = require("../config/database");

class MenuBahan {
  static async findByMenuId(menuId, connection = null) {
    const executor = connection || db;
    const [rows] = await executor.execute(
      `SELECT mb.*, b.nama_barang
       FROM menu_bahan mb
       JOIN barang b ON mb.barang_id = b.id
       WHERE mb.menu_id = ?
       ORDER BY b.nama_barang ASC`,
      [menuId]
    );
    return rows;
  }

  static async replaceForMenu(menuId, items, connection = null) {
    const executor = connection || db;
    await executor.execute("DELETE FROM menu_bahan WHERE menu_id = ?", [
      menuId,
    ]);
    if (!items || items.length === 0) return;
    const values = items.map(() => "(?, ?, ?, ?)").join(",");
    const params = [];
    items.forEach((item) => {
      const qtyValue = Number(item.qty);
      const unitValue =
        typeof item.satuan === "string" ? item.satuan.trim() : item.satuan;
      params.push(menuId, item.barang_id, qtyValue, unitValue || null);
    });
    await executor.execute(
      `INSERT INTO menu_bahan (menu_id, barang_id, qty_per_menu, satuan) VALUES ${values}`,
      params
    );
  }
}

module.exports = MenuBahan;
