const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const auth = require("../middleware/auth");

// Middleware session-based
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect("/login");
};

// ================= API (opsional, jika masih dipakai) =================
// router.post("/api", auth, employeeController.createEmployee);
// router.get("/api", auth, employeeController.getAllEmployees);
// router.get("/api/:userId", auth, employeeController.getEmployeeById);
// router.put("/api/:userId", auth, employeeController.updateEmployee);

// ================= EJS CRUD =================
// Daftar karyawan
router.get("/", requireAuth, async (req, res) => {
  const employees = await employeeController.getAllEmployeesData();
  res.render("karyawan/index", {
    karyawan: employees,
    title: "Daftar Karyawan",
  });
});
// Tambah karyawan
router.get("/create", requireAuth, employeeController.create);
router.post("/create", requireAuth, employeeController.createEmployeeForm);
// Edit karyawan
router.get("/edit/:userId", requireAuth, employeeController.renderEditEmployee);
router.post(
  "/edit/:userId",
  requireAuth,
  employeeController.updateEmployeeForm
);
// Hapus karyawan
router.post(
  "/delete/:userId",
  requireAuth,
  employeeController.deleteEmployeeForm
);

module.exports = router;
