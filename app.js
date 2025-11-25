const express = require("express");
const cors = require("cors");
const expressLayouts = require("express-ejs-layouts");
const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employee");
const menuRoutes = require("./routes/menu");
const pemasukanRoutes = require("./routes/pemasukan");
const barangRoutes = require("./routes/barang");
const pengeluaranRoutes = require("./routes/pengeluaran");
const stokRoutes = require("./routes/stok");
const menuController = require("./controllers/menuController");
const methodOverride = require("method-override");
const pemasukanController = require("./controllers/pemasukanController");
const session = require("express-session");
const dashboardController = require("./controllers/dashboardController");
const apiRoutes = require("./routes/api");
const Usaha = require("./models/Usaha"); // Import model Usaha

// Middleware untuk mengecek autentikasi berbasis sesi (DEFINISI HARUS DI ATAS PENGGUNAAN RUTENYA)
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    // Pengguna terautentikasi via sesi, lanjutkan ke route handler berikutnya
    return next();
  } else {
    // Pengguna belum login, arahkan ke halaman login
    res.redirect("/login");
  }
};

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

// Pasang io ke objek app
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Session middleware
app.use(
  session({
    secret: "rahasia-anda",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set ke true jika menggunakan HTTPS
  })
);

// Set view engine
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(expressLayouts);
app.set("layout", "layouts/main");
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// Serve static files
app.use(express.static("public"));

// Routes
// Route for Home Page (Halaman Awal)
app.get("/", async (req, res) => {
  try {
    const usaha_id = req.query.usaha_id; // Ambil usaha_id dari query parameter
    const usahaList = await Usaha.getAllUsaha(); // Ambil daftar semua usaha
    // Panggil fungsi controller untuk mengambil data menu dari database, dengan filter usaha_id
    const menuItems = await menuController.getAllMenuItems(usaha_id);

    res.render("home", {
      layout: false,
      title: "Home",
      menuItems: menuItems,
      usahaList: usahaList, // Kirim usahaList ke view
      selectedUsahaId: usaha_id, // Kirim usaha_id yang dipilih ke view
    });
  } catch (error) {
    console.error("Error fetching menu items for home page:", error);
    res.status(500).send("Terjadi kesalahan saat memuat data menu.");
  }
});

// Route for Login Page
app.get("/login", (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect("/dashboard");
  }
  res.render("pages/login", { layout: false, title: "Login" });
});

// Route for Landing Page (Sekarang diakses via /landing)
app.get("/landing", async (req, res) => {
  try {
    const userUsahaId = req.session.user ? req.session.user.usaha_id : null; // Ambil usaha_id dari sesi

    const usahaList = await Usaha.getAllUsaha(); // Ambil daftar semua usaha
    const menuItems = await menuController.getAllMenuItems(userUsahaId); // Teruskan userUsahaId ke getAllMenuItems

    // Ambil data pemasukan
    const pemasukan = await pemasukanController.getAllPemasukan(
      { query: { usaha_id: userUsahaId } },
      {}
    );

    // Kelompokkan menu berdasarkan usaha
    const menuByUsaha = {};
    usahaList.forEach((usaha) => {
      menuByUsaha[usaha.id] = { ...usaha, menus: [] };
    });

    menuItems.forEach((menu) => {
      if (menuByUsaha[menu.usaha_id]) {
        menuByUsaha[menu.usaha_id].menus.push(menu);
      }
    });

    res.render("landing", {
      layout: false,
      title: "Selamat Datang",
      usahaList: Object.values(menuByUsaha), // Kirim usahaList dengan menu yang sudah dikelompokkan
      menuItems: menuItems, // Kirim juga menuItems yang rata untuk form pemesanan yang sudah ada
      userUsahaName: req.session.user ? req.session.user.usaha : null, // Tambahkan nama usaha dari sesi
      pemasukan: pemasukan, // Kirim data pemasukan ke view
    });
  } catch (error) {
    console.error("Error fetching data for landing page:", error);
    res.status(500).send("Terjadi kesalahan saat memuat data halaman landing.");
  }
});

// Route for Dashboard
app.get("/dashboard", requireAuth, dashboardController.getDashboardData);

// Route untuk logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/login");
  });
});

// Route for Menu Makanan (Index Page)
app.get("/menu", requireAuth, menuController.renderMenuIndex);

// Route for Add Menu Makanan Page (MENGGUNAKAN requireAuth)
app.get("/menu/create", requireAuth, menuController.renderCreateMenuForm);

// Route for Edit Menu Makanan Page (MENGGUNAKAN requireAuth)
app.get("/menu/edit/:id", requireAuth, menuController.renderEditMenuForm);

// Menggunakan route barang untuk tampilan web
app.use("/barang", requireAuth, barangRoutes);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/menu", menuRoutes);
// app.use("/api/pemasukan", pemasukanRoutes); // Baris ini dihapus agar bisa ditangani secara eksplisit

// Menangani rute POST /api/pemasukan secara langsung di app.js tanpa middleware auth
app.post("/api/pemasukan", pemasukanController.createPemasukan);

// Menggunakan route pengeluaran dan melindunginya dengan requireAuth
app.use("/pengeluaran", requireAuth, pengeluaranRoutes);

// Stok route
app.use("/stok", requireAuth, stokRoutes);

// Route untuk halaman Pemasukan (menggunakan router) - juga pastikan tidak ada requireAuth
app.use("/pemasukan", pemasukanRoutes);

// Routes
app.use("/api", apiRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Terjadi kesalahan server" });
});

app.use("/karyawan", employeeRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});

io.on("connection", (socket) => {
  console.log("Pengguna terhubung ke Socket.IO");

  socket.on("disconnect", () => {
    console.log("Pengguna terputus dari Socket.IO");
  });
});

module.exports = { app, io };
