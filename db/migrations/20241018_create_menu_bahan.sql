-- Migration: create menu_bahan table

CREATE TABLE IF NOT EXISTS menu_bahan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  menu_id INT NOT NULL,
  barang_id INT NOT NULL,
  qty_per_menu DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_menu_bahan_menu FOREIGN KEY (menu_id) REFERENCES menu_makanan(id) ON DELETE CASCADE,
  CONSTRAINT fk_menu_bahan_barang FOREIGN KEY (barang_id) REFERENCES barang(id) ON DELETE CASCADE
);
