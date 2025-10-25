-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 28, 2025 at 06:37 PM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

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
  `usaha_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `barang`
--

INSERT INTO `barang` (`id`, `nama_barang`, `harga_beli`, `created_at`, `updated_at`, `usaha_id`) VALUES
(11, 'gula ijo', 12000.00, '2025-06-18 03:36:11', '2025-06-18 03:36:11', 2),
(14, 'Gula', 30000.00, '2025-06-24 03:28:55', '2025-06-24 03:29:45', 2),
(18, 'Terigu teriguan', 12000.00, '2025-07-16 13:48:56', '2025-07-16 13:49:14', 1),
(19, 'Gula', 12000.00, '2025-08-28 17:29:32', '2025-08-28 17:29:32', 1);

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
(19, 'Kebab Jumbo Keju', 'Keju meleleh', 18000.00, 10, '/uploads/gambar-1750182098685-1270847.png', '2025-06-17 17:41:38', '2025-08-28 17:35:29', 2),
(21, 'Nasi Garem', 'ssss', 12000.00, 3, '/uploads/gambar-1754831940502-338894572.png', '2025-08-10 13:19:00', '2025-08-14 18:07:21', 2);

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
(69, 2, 19, 10, 1, 18000.00, 18000.00, '2025-07-20 06:30:37'),
(70, 2, 19, 10, 3, 18000.00, 54000.00, '2025-08-10 10:59:21'),
(71, 2, 19, 10, 2, 18000.00, 36000.00, '2025-08-10 11:01:55'),
(72, 2, 19, 10, 3, 18000.00, 54000.00, '2025-08-10 11:04:17'),
(73, 2, 19, 10, 2, 18000.00, 36000.00, '2025-08-10 11:05:49'),
(74, 2, 19, 10, 3, 18000.00, 54000.00, '2025-08-10 13:17:06'),
(75, 2, 21, 10, 4, 12000.00, 48000.00, '2025-08-10 13:19:18'),
(76, 2, 21, 10, 1, 12000.00, 12000.00, '2025-08-10 13:21:59'),
(77, 2, 21, 10, 2, 12000.00, 24000.00, '2025-08-10 13:25:49'),
(78, 2, 21, 10, 1, 12000.00, 12000.00, '2025-08-10 13:28:12'),
(79, 2, 21, 10, 3, 12000.00, 36000.00, '2025-08-10 13:28:18'),
(80, 2, 21, 1, 1, 12000.00, 12000.00, '2025-08-10 13:34:58'),
(81, 2, 21, 1, 2, 12000.00, 24000.00, '2025-08-10 13:35:04'),
(82, 2, 21, 10, 2, 12000.00, 24000.00, '2025-08-10 13:36:54'),
(83, 2, 21, 10, 2, 12000.00, 24000.00, '2025-08-12 08:02:11'),
(84, 2, 21, 10, 2, 12000.00, 24000.00, '2025-08-12 08:03:51'),
(85, 2, 21, 10, 1, 12000.00, 12000.00, '2025-08-14 18:07:21'),
(86, 2, 19, 10, 1, 18000.00, 18000.00, '2025-08-14 18:07:30'),
(87, 2, 19, 1, 1, 18000.00, 18000.00, '2025-08-28 17:35:29');

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
(11, 14, 1, 12, 3000.00, 36000.00, '2025-07-16 13:30:21', 2, '2025-07-16'),
(20, 14, 1, 12, 3000.00, 36000.00, '2025-08-28 17:23:06', 1, '2025-08-29'),
(21, 11, 1, 12, 2000.00, 24000.00, '2025-08-28 17:23:21', 2, '2025-08-29');

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
(10, 'santos', 'santos@gmail.com', '$2a$10$8t1Pg72s9kw9M7ZnUJNLm.eqEDbM2AQtBkCoC5jcPUIJZ80WFxVg.', 2, '2025-07-16 13:45:40', '2025-07-16 13:47:08', 2);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `menu_makanan`
--
ALTER TABLE `menu_makanan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `pemasukan`
--
ALTER TABLE `pemasukan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT for table `pengeluaran_barang`
--
ALTER TABLE `pengeluaran_barang`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `usaha`
--
ALTER TABLE `usaha`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `barang`
--
ALTER TABLE `barang`
  ADD CONSTRAINT `barang_ibfk_1` FOREIGN KEY (`usaha_id`) REFERENCES `usaha` (`id`);

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
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`usaha_id`) REFERENCES `usaha` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
