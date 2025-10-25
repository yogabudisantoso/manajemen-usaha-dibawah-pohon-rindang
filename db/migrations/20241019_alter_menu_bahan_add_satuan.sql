-- Migration: add satuan column to menu_bahan

ALTER TABLE menu_bahan
  ADD COLUMN satuan VARCHAR(50) NULL AFTER qty_per_menu;
