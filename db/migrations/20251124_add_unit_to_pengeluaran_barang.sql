-- Migration: add unit column to pengeluaran_barang
-- Created: 2025-11-24

ALTER TABLE pengeluaran_barang
  ADD COLUMN `unit` VARCHAR(20) DEFAULT 'pcs' AFTER `jumlah_beli`;
