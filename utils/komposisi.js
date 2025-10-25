/**
 * Normalise payload komposisi bahan dari form HTML atau request JSON.
 * Hanya mengembalikan entry yang memiliki barang_id valid dan qty > 0.
 * Jika terdapat duplikasi barang, qty akan dijumlahkan.
 *
 * @param {any} rawItems
 * @returns {Array<{barang_id: number, qty: number}>}
 */
function parseKomposisiPayload(rawItems) {
  if (!rawItems) return [];

  const itemsArray = Array.isArray(rawItems) ? rawItems : [rawItems];
  const aggregated = new Map();

  for (const entry of itemsArray) {
    if (!entry || typeof entry !== "object") continue;

    const barangIdRaw =
      entry.barang_id ?? entry.barangId ?? entry.barang ?? entry.id;
    const qtyRaw =
      entry.qty ??
      entry.quantity ??
      entry.qty_per_menu ??
      entry.qtyPerMenu ??
      entry.jumlah;

    const barangId = Number.parseInt(barangIdRaw, 10);
    const qty = Number.parseFloat(qtyRaw);
    const unitRaw =
      entry.satuan ??
      entry.unit ??
      entry.satuan_per_menu ??
      entry.unit_per_menu ??
      entry.satuanPerMenu ??
      entry.unitPerMenu ??
      "";
    const unitOriginal =
      typeof unitRaw === "string" ? unitRaw.trim() : String(unitRaw || "").trim();
    const unitKey = unitOriginal.toLowerCase();

    if (!Number.isInteger(barangId) || barangId <= 0) continue;
    if (!Number.isFinite(qty) || qty <= 0) continue;

    if (!aggregated.has(barangId)) {
      aggregated.set(barangId, {
        qty,
        satuan: unitOriginal || null,
        unitKey: unitKey || null,
      });
      continue;
    }

    const current = aggregated.get(barangId);
    current.qty += qty;

    if (unitOriginal) {
      if (!current.unitKey) {
        current.satuan = unitOriginal;
        current.unitKey = unitKey;
      } else if (current.unitKey !== unitKey) {
        throw new Error(
          `Satuan untuk barang ${barangId} tidak konsisten (${current.satuan} vs ${unitOriginal})`
        );
      }
    }
  }

  return Array.from(aggregated.entries()).map(
    ([barang_id, { qty, satuan }]) => ({
      barang_id,
      qty,
      satuan: satuan || null,
    })
  );
}

module.exports = {
  parseKomposisiPayload,
};
