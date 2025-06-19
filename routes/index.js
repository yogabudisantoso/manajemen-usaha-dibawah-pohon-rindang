const express = require("express");
const { auth: isAuthenticated } = require("../middleware/auth");
const dashboardController = require("../controllers/dashboardController");
const employeeRouter = require("./employee");

const router = express.Router();

// Route untuk dashboard
router.get("/dashboard", isAuthenticated, dashboardController.getDashboardData);
router.use("/", employeeRouter);

module.exports = router;
