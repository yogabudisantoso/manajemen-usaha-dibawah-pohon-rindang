const db = require("../config/database");
const Usaha = require("../models/Usaha");

exports.renderIndex = async (req, res) => {
  try {
    const tanggalParam = req.query.tanggal;
    const usahaId = req.query.usaha_id
      ? Number.parseInt(req.query.usaha_id, 10)
      : null;
    const tanggal = tanggalParam || new Date().toISOString().slice(0, 10);

    const totalParams = [];
    let totalQuery = `
      SELECT
        pb.barang_id,
        COALESCE(SUM(pb.jumlah_beli), 0) AS total_beli,
        COALESCE(MAX(pb.unit), '') AS unit,
        COALESCE(MAX(b.nama_barang), CONCAT('Barang #', pb.barang_id)) AS nama_barang
      FROM pengeluaran_barang pb
      LEFT JOIN barang b ON pb.barang_id = b.id
    `;
    if (usahaId) {
      totalQuery += " WHERE pb.usaha_id = ?";
      totalParams.push(usahaId);
    }
    totalQuery += " GROUP BY pb.barang_id";
    totalQuery += " ORDER BY nama_barang ASC";

    const [totalRows] = await db.query(totalQuery, totalParams);

    const komposisiMap = new Map();
    const barangNameMap = new Map();
    let komposisiQuery = `
      SELECT mb.barang_id,
             mb.qty_per_menu,
             mb.satuan,
             m.nama_menu,
             COALESCE(b.nama_barang, CONCAT('Barang #', mb.barang_id)) AS nama_barang
      FROM menu_bahan mb
      JOIN menu_makanan m ON mb.menu_id = m.id
      LEFT JOIN barang b ON mb.barang_id = b.id
    `;
    const komposisiParams = [];
    if (usahaId) {
      komposisiQuery += " WHERE m.usaha_id = ?";
      komposisiParams.push(usahaId);
    }
    komposisiQuery += " ORDER BY mb.barang_id ASC, m.nama_menu ASC";
    const [komposisiRows] = await db.query(komposisiQuery, komposisiParams);
    komposisiRows.forEach((row) => {
      if (!komposisiMap.has(row.barang_id)) {
        komposisiMap.set(row.barang_id, []);
      }
      const qtyValue = Number(row.qty_per_menu);
      komposisiMap.get(row.barang_id).push({
        nama_menu: row.nama_menu,
        qty: qtyValue,
        qty_display: Number.isFinite(qtyValue)
          ? Number.isInteger(qtyValue)
            ? qtyValue
            : Number(qtyValue.toFixed(2))
          : qtyValue,
        satuan: row.satuan || null,
      });
      if (!barangNameMap.has(row.barang_id) && row.nama_barang) {
        barangNameMap.set(row.barang_id, row.nama_barang);
      }
    });

    const totalMap = new Map();
    totalRows.forEach((row) => {
      // Normalize unit: remove NBSP and trim, then treat empty as null
      let unitVal = null;
      if (row.unit !== undefined && row.unit !== null) {
        try {
          unitVal = row.unit
            .toString()
            .replace(/\u00A0/g, " ")
            .trim();
          if (unitVal.length === 0) unitVal = null;
        } catch (e) {
          unitVal = null;
        }
      }
      totalMap.set(row.barang_id, {
        nama_barang: row.nama_barang,
        total_stok: Number(row.total_beli) || 0,
        unit: unitVal,
      });
    });

    const allBarangIds = new Set([...totalMap.keys(), ...komposisiMap.keys()]);

    const stok = Array.from(allBarangIds).map((barangId) => {
      const stokInfo = totalMap.get(barangId) || {
        nama_barang: null,
        total_stok: 0,
      };
      const komposisi = komposisiMap.get(barangId) || [];
      const total = stokInfo.total_stok || 0;
      const used = komposisi.reduce(
        (sum, item) => sum + (Number(item.qty) || 0),
        0
      );
      // Prefer the unit from pengeluaran_barang (stokInfo.unit) if available;
      // otherwise fall back to komposisi-derived satuan values.
      let satuanDisplay = "-";
      if (stokInfo.unit) {
        satuanDisplay = stokInfo.unit;
      } else {
        const satuanSet = new Set(
          komposisi
            .map((item) => item.satuan)
            .filter((satuan) => satuan && satuan.trim().length > 0)
        );
        satuanDisplay =
          satuanSet.size === 0
            ? "-"
            : Array.from(satuanSet.values()).join(", ");
      }
      return {
        barang_id: barangId,
        nama_barang:
          stokInfo.nama_barang ||
          barangNameMap.get(barangId) ||
          `Barang #${barangId}`,
        total_stok: total,
        // 'Terpakai' and 'Sisa' columns removed from UI; keep komposisi and satuan
        satuan: satuanDisplay,
        komposisi,
      };
    });

    const usahaList = await Usaha.getAllUsaha();

    res.render("stok/index", {
      title: "Stok Bahan",
      stok,
      tanggal,
      usahaList,
      selectedUsahaId: usahaId,
    });
  } catch (error) {
    console.error("Error rendering stok index:", error);
    res
      .status(500)
      .send("Terjadi kesalahan saat memuat data stok: " + error.message);
  }
};
