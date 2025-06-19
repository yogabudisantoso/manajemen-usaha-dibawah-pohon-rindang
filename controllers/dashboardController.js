const Pemasukan = require("../models/Pemasukan");
const Pengeluaran = require("../models/Pengeluaran");
const Menu = require("../models/Menu");

exports.getDashboardData = async (req, res) => {
  try {
    // Ambil data pemasukan dan pengeluaran
    const pemasukanData = await Pemasukan.findAll();
    const pengeluaranData = await Pengeluaran.findAll();
    const menuData = await Menu.findAll();

    console.log("Data Pemasukan dari DB:", pemasukanData);
    console.log("Data Pengeluaran dari DB:", pengeluaranData);
    console.log("Data Menu dari DB:", menuData);

    // Hitung total pemasukan harian
    const today = new Date();
    const todayString = today.toLocaleDateString("id-ID");
    const totalPemasukanHarian = pemasukanData.reduce((sum, item) => {
      const itemDate = new Date(item.waktu_transaksi).toLocaleDateString(
        "id-ID"
      );
      return itemDate === todayString
        ? sum + parseFloat(item.total_harga_item)
        : sum;
    }, 0);

    // Hitung total pemasukan bulanan
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const totalPemasukanBulanan = pemasukanData.reduce((sum, item) => {
      const itemDate = new Date(item.waktu_transaksi);
      return itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
        ? sum + parseFloat(item.total_harga_item)
        : sum;
    }, 0);

    // Hitung total pengeluaran bulanan
    const totalPengeluaranBulanan = pengeluaranData.reduce((sum, item) => {
      const itemDate = new Date(item.waktu_pembelian);
      return itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
        ? sum + parseFloat(item.total_biaya_item)
        : sum;
    }, 0);

    // Fungsi untuk mendapatkan 7 hari terakhir
    const getLast7Days = () => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString("id-ID"));
      }
      return days;
    };

    const last7Days = getLast7Days();

    // Data untuk Grafik Pemasukan Harian (7 hari terakhir)
    const pemasukanHarianChartData = {};
    last7Days.forEach((date) => {
      pemasukanHarianChartData[date] = 0;
    });

    pemasukanData.forEach((item) => {
      const date = new Date(item.waktu_transaksi).toLocaleDateString("id-ID");
      if (pemasukanHarianChartData.hasOwnProperty(date)) {
        pemasukanHarianChartData[date] += parseFloat(item.total_harga_item);
      }
    });

    // Data untuk Grafik Pengeluaran Harian (7 hari terakhir)
    const pengeluaranHarianChartData = {};
    last7Days.forEach((date) => {
      pengeluaranHarianChartData[date] = 0;
    });

    pengeluaranData.forEach((item) => {
      const date = new Date(item.waktu_pembelian).toLocaleDateString("id-ID");
      if (pengeluaranHarianChartData.hasOwnProperty(date)) {
        pengeluaranHarianChartData[date] += parseFloat(item.total_biaya_item);
      }
    });

    // Siapkan data untuk grafik
    const pemasukanHarianLabels = last7Days;
    const pemasukanHarianValues = last7Days.map(
      (date) => pemasukanHarianChartData[date]
    );
    const pengeluaranHarianLabels = last7Days;
    const pengeluaranHarianValues = last7Days.map(
      (date) => pengeluaranHarianChartData[date]
    );

    // Data untuk Grafik Distribusi Pengeluaran
    const distribusiData = pengeluaranData.reduce((acc, item) => {
      const usahaName = item.nama_usaha || "Lain-lain";
      acc[usahaName] =
        (acc[usahaName] || 0) + parseFloat(item.total_biaya_item);
      return acc;
    }, {});

    const distribusiLabels = Object.keys(distribusiData);
    const distribusiValues = Object.values(distribusiData);

    // Data untuk Grafik Perbulan
    const monthlyData = {
      labels: [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ],
      pemasukan: Array(12).fill(0),
      pengeluaran: Array(12).fill(0),
    };

    pemasukanData.forEach((item) => {
      const date = new Date(item.waktu_transaksi);
      const month = date.getMonth();
      monthlyData.pemasukan[month] += parseFloat(item.total_harga_item);
    });

    pengeluaranData.forEach((item) => {
      const date = new Date(item.waktu_pembelian);
      const month = date.getMonth();
      monthlyData.pengeluaran[month] += parseFloat(item.total_biaya_item);
    });

    // Data untuk Grafik Pertahun
    const yearlyData = {
      labels: [],
      pemasukan: [],
      pengeluaran: [],
    };

    // Dapatkan tahun minimum dan maksimum dari data
    const years = new Set();
    pemasukanData.forEach((item) =>
      years.add(new Date(item.waktu_transaksi).getFullYear())
    );
    pengeluaranData.forEach((item) =>
      years.add(new Date(item.waktu_pembelian).getFullYear())
    );

    const sortedYears = Array.from(years).sort();
    yearlyData.labels = sortedYears;

    // Hitung total pemasukan dan pengeluaran per tahun
    sortedYears.forEach((year) => {
      const pemasukanTahunan = pemasukanData.reduce((sum, item) => {
        const itemYear = new Date(item.waktu_transaksi).getFullYear();
        return itemYear === year
          ? sum + parseFloat(item.total_harga_item)
          : sum;
      }, 0);

      const pengeluaranTahunan = pengeluaranData.reduce((sum, item) => {
        const itemYear = new Date(item.waktu_pembelian).getFullYear();
        return itemYear === year
          ? sum + parseFloat(item.total_biaya_item)
          : sum;
      }, 0);

      yearlyData.pemasukan.push(pemasukanTahunan);
      yearlyData.pengeluaran.push(pengeluaranTahunan);
    });

    console.log("Data yang dikirim ke view:", {
      totalPemasukanHarian,
      totalPemasukanBulanan,
      totalPengeluaranBulanan,
      totalMenu: menuData.length,
      pemasukanHarianLabels,
      pemasukanHarianValues,
      pengeluaranHarianLabels,
      pengeluaranHarianValues,
      distribusiLabels,
      distribusiValues,
      monthlyLabels: monthlyData.labels,
      monthlyPemasukan: monthlyData.pemasukan,
      monthlyPengeluaran: monthlyData.pengeluaran,
      yearlyLabels: yearlyData.labels,
      yearlyPemasukan: yearlyData.pemasukan,
      yearlyPengeluaran: yearlyData.pengeluaran,
    });

    res.render("pages/dashboard", {
      title: "Dashboard",
      totalPemasukanHarian,
      totalPemasukanBulanan,
      totalPengeluaranBulanan,
      totalMenu: menuData.length,
      pemasukanHarianLabels,
      pemasukanHarianValues,
      pengeluaranHarianLabels,
      pengeluaranHarianValues,
      distribusiLabels,
      distribusiValues,
      monthlyLabels: monthlyData.labels,
      monthlyPemasukan: monthlyData.pemasukan,
      monthlyPengeluaran: monthlyData.pengeluaran,
      yearlyLabels: yearlyData.labels,
      yearlyPemasukan: yearlyData.pemasukan,
      yearlyPengeluaran: yearlyData.pengeluaran,
    });
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    res.status(500).send("Terjadi kesalahan saat memuat data dashboard");
  }
};
