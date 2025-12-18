const express = require("express");
const upload = require("../utils/upload");
const { protect } = require("../middleware/authMiddleware");
const { uploadStatement } = require("../controllers/statementController");

const router = express.Router();

router.post("/upload", protect, upload.single("pdf"), uploadStatement);

module.exports = router;