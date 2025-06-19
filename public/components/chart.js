// Pemasukan
const pemasukanData = JSON.parse(
  document.getElementById("pemasukan-data").textContent
);
new Chart(document.getElementById("pemasukanChart"), {
  type: "bar",
  data: {
    labels: pemasukanData.labels,
    datasets: [
      {
        label: "Pemasukan",
        data: pemasukanData.values,
        backgroundColor: "#4e73df",
      },
    ],
  },
});

// Pengeluaran
const pengeluaranData = JSON.parse(
  document.getElementById("pengeluaran-data").textContent
);
new Chart(document.getElementById("pengeluaranChart"), {
  type: "bar",
  data: {
    labels: pengeluaranData.labels,
    datasets: [
      {
        label: "Pengeluaran",
        data: pengeluaranData.values,
        backgroundColor: "#e74a3b",
      },
    ],
  },
});

// Combined Chart
new Chart(document.getElementById("combinedChart"), {
  type: "bar",
  data: {
    labels: pemasukanData.labels,
    datasets: [
      {
        label: "Pemasukan",
        data: pemasukanData.values,
        backgroundColor: "#4e73df",
      },
      {
        label: "Pengeluaran",
        data: pengeluaranData.values,
        backgroundColor: "#e74a3b",
      },
    ],
  },
});

// Pie Chart
const distribusiData = JSON.parse(
  document.getElementById("distribusi-data").textContent
);
new Chart(document.getElementById("myPieChart"), {
  type: "pie",
  data: {
    labels: distribusiData.labels,
    datasets: [
      {
        data: distribusiData.values,
        backgroundColor: [
          "#4e73df",
          "#1cc88a",
          "#36b9cc",
          "#f6c23e",
          "#e74a3b",
          "#858796",
        ],
        hoverOffset: 10,
      },
    ],
  },
});
