const express = require("express");
const router = express.Router();
const stokController = require("../controllers/stokController");
const auth = require("../middleware/auth");

router.get("/", auth, stokController.renderIndex);

module.exports = router;
