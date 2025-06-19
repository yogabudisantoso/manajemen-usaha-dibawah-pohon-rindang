const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "your-secret-key"; // Ganti dengan secret key yang aman

exports.register = async (req, res) => {
  try {
    const { username, email, password, role_id } = req.body;

    // Validasi input
    if (!username || !email || !password || !role_id) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Buat user baru
    const userId = await User.create({ username, email, password, role_id });

    res.status(201).json({
      message: "Registrasi berhasil",
      userId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res
        .status(400)
        .redirect(
          "/login?error=" + encodeURIComponent("Email dan password harus diisi")
        );
    }

    // Cari user berdasarkan email
    const user = await User.findByEmail(email);
    if (!user) {
      return res
        .status(401)
        .redirect(
          "/login?error=" + encodeURIComponent("Email atau password salah")
        );
    }

    // Verifikasi password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res
        .status(401)
        .redirect(
          "/login?error=" + encodeURIComponent("Email atau password salah")
        );
    }

    // Ambil detail user lengkap dengan nama usaha
    const userWithUsaha = await User.findById(user.id);

    // Login berhasil, simpan info user di sesi dan redirect
    req.session.user = {
      id: userWithUsaha.id,
      username: userWithUsaha.username,
      email: userWithUsaha.email,
      role_id: userWithUsaha.role_id,
      usaha: userWithUsaha.nama_usaha, // Tambahkan nama usaha ke sesi
      usaha_id: userWithUsaha.usaha_id, // Tambahkan usaha_id ke sesi
    };

    // Redirect berdasarkan role_id
    if (userWithUsaha.role_id === 2) {
      // Jika role adalah karyawan (role_id 2), arahkan ke halaman landing
      res.redirect("/landing");
    } else {
      // Untuk role lain, arahkan ke dashboard (atau halaman default lainnya)
      res.redirect("/dashboard");
    }
  } catch (error) {
    console.error(error);
    // Tangani error server dengan redirect ke halaman login dan pesan error
    res
      .status(500)
      .redirect(
        "/login?error=" +
          encodeURIComponent("Terjadi kesalahan server saat login")
      );
  }
};
