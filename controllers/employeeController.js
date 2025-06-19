const User = require("../models/User");
const bcrypt = require("bcryptjs");
const db = require("../config/database");

exports.createEmployee = async (req, res) => {
  try {
    const { username, email, password, usaha_id } = req.body;

    if (!username || !email || !password || !usaha_id) {
      return res.status(400).json({
        message: "Semua field (username, email, password, usaha) harus diisi",
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const userId = await User.create({
      username,
      email,
      password,
      role_id: 2,
      usaha_id,
    });

    res.status(201).json({
      message: "Data karyawan berhasil ditambahkan",
      data: { user_id: userId },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await User.findAllEmployees();
    res.json({ message: "Data karyawan berhasil diambil", data: employees });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const { userId } = req.params;
    const employee = await User.findById(userId);

    if (!employee || employee.role_id !== 2) {
      return res.status(404).json({ message: "Data karyawan tidak ditemukan" });
    }

    res.json({ message: "Data karyawan berhasil diambil", data: employee });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, password, usaha_id } = req.body;

    const existingUser = await User.findById(userId);
    if (!existingUser || existingUser.role_id !== 2) {
      return res.status(404).json({ message: "Data karyawan tidak ditemukan" });
    }

    const userData = {};
    if (username) userData.username = username;
    if (email) userData.email = email;
    if (password) userData.password = password;
    if (usaha_id !== undefined) userData.usaha_id = usaha_id;

    if (Object.keys(userData).length === 0) {
      return res.status(400).json({ message: "Tidak ada data untuk diupdate" });
    }

    if (email) {
      const existingEmailUser = await User.findByEmail(email);
      if (existingEmailUser && existingEmailUser.id !== parseInt(userId)) {
        return res
          .status(400)
          .json({ message: "Email sudah digunakan oleh user lain" });
      }
    }

    const userUpdated = await User.update(userId, userData);
    if (!userUpdated) {
      return res.status(400).json({ message: "Gagal mengupdate data user" });
    }

    const updatedEmployee = await User.findById(userId);
    res.json({
      message: "Data karyawan berhasil diupdate",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

exports.getAllEmployeesData = async () => {
  return await User.findAllEmployees();
};

exports.create = async (req, res) => {
  try {
    const [usaha] = await db.query("SELECT * FROM usaha");
    res.render("karyawan/create", { title: "Tambah Karyawan", usaha });
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat mengambil data usaha");
  }
};

exports.createEmployeeForm = async (req, res) => {
  try {
    const { username, email, password, usaha_id } = req.body;
    if (!username || !email || !password || !usaha_id) {
      const [usaha] = await db.query("SELECT * FROM usaha");
      return res.render("karyawan/create", {
        error: "Semua field (username, email, password, usaha) harus diisi",
        title: "Tambah Karyawan",
        usaha,
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      const [usaha] = await db.query("SELECT * FROM usaha");
      return res.render("karyawan/create", {
        error: "Email sudah terdaftar",
        title: "Tambah Karyawan",
        usaha,
      });
    }

    await User.create({ username, email, password, role_id: 2, usaha_id });
    res.redirect("/karyawan");
  } catch (error) {
    console.error(error);
    const [usaha] = await db.query("SELECT * FROM usaha");
    res.render("karyawan/create", {
      error: "Terjadi kesalahan server",
      title: "Tambah Karyawan",
      usaha,
    });
  }
};

exports.renderEditEmployee = async (req, res) => {
  try {
    const { userId } = req.params;
    let karyawan = await User.findById(userId);
    if (!karyawan || karyawan.role_id !== 2) {
      return res.redirect("/karyawan");
    }

    const [usaha] = await db.query("SELECT * FROM usaha");
    res.render("karyawan/edit", { karyawan, title: "Edit Karyawan", usaha });
  } catch (error) {
    console.error(error);
    res.redirect("/karyawan");
  }
};

exports.updateEmployeeForm = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, password, usaha_id } = req.body;

    const userData = {};
    if (username) userData.username = username;
    if (email) userData.email = email;
    if (password) userData.password = password;
    if (usaha_id !== undefined) userData.usaha_id = usaha_id;

    if (Object.keys(userData).length === 0) {
      // Jika tidak ada perubahan data, langsung redirect
      return res.redirect("/karyawan");
    }

    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== parseInt(userId)) {
        const [usaha] = await db.query("SELECT * FROM usaha");
        return res.render("karyawan/edit", {
          karyawan: await User.findById(userId),
          error: "Email sudah digunakan oleh user lain",
          title: "Edit Karyawan",
          usaha,
        });
      }
    }

    await User.update(userId, userData);
    res.redirect("/karyawan");
  } catch (error) {
    console.error(error);
    res.redirect("/karyawan");
  }
};

exports.deleteEmployeeForm = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.delete(userId);
    res.redirect("/karyawan");
  } catch (error) {
    console.error(error);
    res.redirect("/karyawan");
  }
};
