-- Migration: create stok table

CREATE TABLE IF NOT EXISTS stok (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pengeluaran_barang_id INT NOT NULL,
  barang_id INT NOT NULL,
  jumlah_stok DECIMAL(12,2) NOT NULL DEFAULT 0,
  usaha_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stok_pengeluaran FOREIGN KEY (pengeluaran_barang_id) REFERENCES pengeluaran_barang(id) ON DELETE CASCADE,
  CONSTRAINT fk_stok_barang FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE CASCADE,
  CONSTRAINT fk_stok_usaha FOREIGN KEY (usaha_id) REFERENCES usaha(id) ON DELETE SET NULL
);
