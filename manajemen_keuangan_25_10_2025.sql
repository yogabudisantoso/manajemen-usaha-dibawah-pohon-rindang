-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 25, 2025 at 06:38 AM
-- Server version: 8.0.30
-- PHP Version: 8.2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `manajemen_keuangan`
--

-- --------------------------------------------------------

--
-- Table structure for table `barang`
--

CREATE TABLE `barang` (
  `id` int NOT NULL,
  `nama_barang` varchar(100) NOT NULL,
  `harga_beli` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usaha_id` int DEFAULT NULL,
  `stok` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `barang`
--

INSERT INTO `barang` (`id`, `nama_barang`, `harga_beli`, `created_at`, `updated_at`, `usaha_id`, `stok`) VALUES
(26, 'Terigu', 12000.00, '2025-10-21 06:54:31', '2025-10-21 06:54:31', 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `menu_bahan`
--

CREATE TABLE `menu_bahan` (
  `id` int NOT NULL,
  `menu_id` int NOT NULL,
  `barang_id` int NOT NULL,
  `qty_per_menu` decimal(10,2) NOT NULL DEFAULT '1.00',
  `satuan` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `menu_bahan`
--

INSERT INTO `menu_bahan` (`id`, `menu_id`, `barang_id`, `qty_per_menu`, `satuan`, `created_at`) VALUES
(20, 32, 26, 1.00, 'gram', '2025-10-21 06:55:17');

-- --------------------------------------------------------

--
-- Table structure for table `menu_makanan`
--

CREATE TABLE `menu_makanan` (
  `id` int NOT NULL,
  `nama_menu` varchar(100) NOT NULL,
  `deskripsi` text,
  `harga` decimal(10,2) NOT NULL,
  `stok` int DEFAULT '0',
  `gambar` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usaha_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `menu_makanan`
--

INSERT INTO `menu_makanan` (`id`, `nama_menu`, `deskripsi`, `harga`, `stok`, `gambar`, `created_at`, `updated_at`, `usaha_id`) VALUES
(32, 'Pancong Coklat', 'wkwkwk', 12000.00, 12, '/uploads/gambar-1761029717059-970272671.jpg', '2025-10-21 06:55:17', '2025-10-21 06:55:46', 1);

-- --------------------------------------------------------

--
-- Table structure for table `pemasukan`
--

CREATE TABLE `pemasukan` (
  `id` int NOT NULL,
  `usaha_id` int NOT NULL,
  `menu_id` int NOT NULL,
  `user_id` int NOT NULL,
  `jumlah` int NOT NULL,
  `harga_satuan` decimal(10,2) NOT NULL,
  `total_harga_item` decimal(10,2) NOT NULL,
  `waktu_transaksi` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pemasukan`
--

INSERT INTO `pemasukan` (`id`, `usaha_id`, `menu_id`, `user_id`, `jumlah`, `harga_satuan`, `total_harga_item`, `waktu_transaksi`) VALUES
(99, 1, 32, 11, 3, 12000.00, 36000.00, '2025-10-21 06:55:46');

-- --------------------------------------------------------

--
-- Table structure for table `pengeluaran_barang`
--

CREATE TABLE `pengeluaran_barang` (
  `id` int NOT NULL,
  `barang_id` int NOT NULL,
  `user_id` int NOT NULL,
  `jumlah_beli` int NOT NULL,
  `harga_beli_satuan` decimal(10,2) NOT NULL,
  `total_biaya_item` decimal(10,2) NOT NULL,
  `waktu_pembelian` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `usaha_id` int DEFAULT NULL,
  `tanggal` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pengeluaran_barang`
--

INSERT INTO `pengeluaran_barang` (`id`, `barang_id`, `user_id`, `jumlah_beli`, `harga_beli_satuan`, `total_biaya_item`, `waktu_pembelian`, `usaha_id`, `tanggal`) VALUES
(30, 26, 1, 17, 3000.00, 51000.00, '2025-10-21 06:54:52', 1, '2025-10-21');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'pemilik toko', '2025-05-29 14:43:46', '2025-05-29 14:43:46'),
(2, 'karyawan', '2025-05-29 14:43:46', '2025-05-29 14:43:46');

-- --------------------------------------------------------

--
-- Table structure for table `stok`
--

CREATE TABLE `stok` (
  `id` int NOT NULL,
  `pengeluaran_barang_id` int NOT NULL,
  `barang_id` int DEFAULT NULL,
  `jumlah_stok` int NOT NULL DEFAULT '0',
  `usaha_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `stok`
--

INSERT INTO `stok` (`id`, `pengeluaran_barang_id`, `barang_id`, `jumlah_stok`, `usaha_id`, `created_at`) VALUES
(8, 30, 26, 14, 1, '2025-10-21 06:54:52');

-- --------------------------------------------------------

--
-- Table structure for table `usaha`
--

CREATE TABLE `usaha` (
  `id` int NOT NULL,
  `nama_usaha` varchar(255) NOT NULL,
  `deskripsi` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `usaha`
--

INSERT INTO `usaha` (`id`, `nama_usaha`, `deskripsi`, `created_at`, `updated_at`) VALUES
(1, 'Pancong DPR', 'Usaha makanan pancong', '2025-06-15 08:51:42', '2025-06-15 08:51:42'),
(2, 'Kebab DPR', 'Usaha makanan kebab', '2025-06-15 08:51:42', '2025-06-15 08:51:42'),
(3, 'Es Kelapa DPR', 'Usaha minuman es kelapa', '2025-06-15 08:51:42', '2025-06-15 08:51:42');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `usaha_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role_id`, `created_at`, `updated_at`, `usaha_id`) VALUES
(1, 'umkmdpr', 'umkmdpr@gmail.com', '$2a$10$031p2/uDIUTfEBYqbYXiuO9AOQPyIh3LENLdnIgzynUun53/DQUqO', 1, '2025-05-29 15:01:31', '2025-07-15 12:00:31', NULL),
(7, 'pitokaryawan', 'pito@tokoku.com', '$2a$10$lOUp3nudvIMogyZuvhiLpOeGocGHgnFowkkZIMFXczaEnbkI4myGi', 2, '2025-06-15 09:57:29', '2025-06-15 09:57:29', 2),
(9, 'yogakaryawan', 'yoga@tokoku.com', '$2a$10$Hpz7irQADU99k2cEfLGp7OgXwyZuNKbdGUtN/hReP/cvnCd8QmWxG', 2, '2025-06-17 17:13:54', '2025-06-24 03:14:24', 2),
(10, 'santos', 'santos@gmail.com', '$2a$10$8t1Pg72s9kw9M7ZnUJNLm.eqEDbM2AQtBkCoC5jcPUIJZ80WFxVg.', 2, '2025-07-16 13:45:40', '2025-07-16 13:47:08', 2),
(11, 'budi@gmail.com', 'budi@gmail.com', '$2a$10$Zme9FuMmgks2QCZx.rLeReSyT2NAunFQY.tFIUTz3i6tblgFXlie.', 2, '2025-10-20 16:06:39', '2025-10-20 16:06:39', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `barang`
--
ALTER TABLE `barang`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_nama_usaha` (`nama_barang`,`usaha_id`),
  ADD KEY `usaha_id` (`usaha_id`);

--
-- Indexes for table `menu_bahan`
--
ALTER TABLE `menu_bahan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_menu_bahan_menu` (`menu_id`),
  ADD KEY `fk_menu_bahan_barang` (`barang_id`);

--
-- Indexes for table `menu_makanan`
--
ALTER TABLE `menu_makanan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usaha_id` (`usaha_id`);

--
-- Indexes for table `pemasukan`
--
ALTER TABLE `pemasukan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `menu_id` (`menu_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fk_pemasukan_usaha` (`usaha_id`);

--
-- Indexes for table `pengeluaran_barang`
--
ALTER TABLE `pengeluaran_barang`
  ADD PRIMARY KEY (`id`),
  ADD KEY `barang_id` (`barang_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `usaha_id` (`usaha_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stok`
--
ALTER TABLE `stok`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_stok_pengeluaran` (`pengeluaran_barang_id`),
  ADD KEY `fk_stok_barang` (`barang_id`);

--
-- Indexes for table `usaha`
--
ALTER TABLE `usaha`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `usaha_id` (`usaha_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `barang`
--
ALTER TABLE `barang`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `menu_bahan`
--
ALTER TABLE `menu_bahan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `menu_makanan`
--
ALTER TABLE `menu_makanan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `pemasukan`
--
ALTER TABLE `pemasukan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- AUTO_INCREMENT for table `pengeluaran_barang`
--
ALTER TABLE `pengeluaran_barang`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `stok`
--
ALTER TABLE `stok`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `usaha`
--
ALTER TABLE `usaha`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `barang`
--
ALTER TABLE `barang`
  ADD CONSTRAINT `barang_ibfk_1` FOREIGN KEY (`usaha_id`) REFERENCES `usaha` (`id`);

--
-- Constraints for table `menu_bahan`
--
ALTER TABLE `menu_bahan`
  ADD CONSTRAINT `fk_menu_bahan_barang` FOREIGN KEY (`barang_id`) REFERENCES `barang` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_menu_bahan_menu` FOREIGN KEY (`menu_id`) REFERENCES `menu_makanan` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `menu_makanan`
--
ALTER TABLE `menu_makanan`
  ADD CONSTRAINT `fk_menu_usaha` FOREIGN KEY (`usaha_id`) REFERENCES `usaha` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pemasukan`
--
ALTER TABLE `pemasukan`
  ADD CONSTRAINT `fk_menu_id` FOREIGN KEY (`menu_id`) REFERENCES `menu_makanan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pemasukan_usaha` FOREIGN KEY (`usaha_id`) REFERENCES `usaha` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `pemasukan_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pengeluaran_barang`
--
ALTER TABLE `pengeluaran_barang`
  ADD CONSTRAINT `pengeluaran_barang_ibfk_1` FOREIGN KEY (`barang_id`) REFERENCES `barang` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pengeluaran_barang_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pengeluaran_barang_ibfk_3` FOREIGN KEY (`usaha_id`) REFERENCES `usaha` (`id`);

--
-- Constraints for table `stok`
--
ALTER TABLE `stok`
  ADD CONSTRAINT `fk_stok_barang` FOREIGN KEY (`barang_id`) REFERENCES `barang` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_stok_pengeluaran` FOREIGN KEY (`pengeluaran_barang_id`) REFERENCES `pengeluaran_barang` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`usaha_id`) REFERENCES `usaha` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
