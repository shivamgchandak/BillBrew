const express = require("express");
const upload = require("../utils/upload");
const { protect } = require("../middleware/authMiddleware");
const {
  uploadStatement,
  getStatementById,
  getAllStatements,
  deleteStatement,
} = require("../controllers/statementController");

const router = express.Router();

router.post("/upload", protect, upload.single("file"), uploadStatement);
router.get("/", protect, getAllStatements);
router.get("/:id", protect, getStatementById);
router.delete("/:id", protect, deleteStatement);

module.exports = router;
