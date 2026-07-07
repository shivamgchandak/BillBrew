const Statement = require("../models/Statement");
const extractText = require("../utils/extractText");
const detectIssuer = require("../utils/detectIssuer");
const uploadPDF = require("../utils/uploadToCloudinary");
const formatCardIdentifier = require("../utils/formatCardIdentifier");
const parseWithGroq = require("../utils/parseWithGroq");

exports.uploadStatement = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Password can be sent as a form field alongside the file
    // when the PDF is encrypted.
    const password = req.body?.password || null;

    let text;
    try {
      text = await extractText(req.file.buffer, password);
    } catch (err) {
      if (err.message === "PDF_PASSWORD_REQUIRED") {
        return res.status(423).json({
          code: "PDF_PASSWORD_REQUIRED",
          message: "This PDF is password-protected. Please provide the password.",
        });
      }
      if (err.message === "PDF_PASSWORD_INCORRECT") {
        return res.status(423).json({
          code: "PDF_PASSWORD_INCORRECT",
          message: "Incorrect PDF password. Please try again.",
        });
      }
      throw err;
    }

    const issuerHint = detectIssuer(text);
    const parsedData = await parseWithGroq(text, issuerHint);
    const pdfUrl = await uploadPDF(req.file.buffer);

    const statement = await Statement.create({
      user: req.user._id,
      pdfUrl,
      ...parsedData,
    });

    res.status(201).json({
      ...statement.toObject(),
      cardIdentifier: formatCardIdentifier(statement),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to process statement",
      error: err.message,
    });
  }
};

exports.getStatementById = async (req, res) => {
  try {
    const { id } = req.params;

    const statement = await Statement.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!statement) {
      return res.status(404).json({
        message: "Statement not found",
      });
    }

    res.status(200).json({
      ...statement.toObject(),
      cardIdentifier: formatCardIdentifier(statement),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch statement",
      error: err.message,
    });
  }
};

exports.getAllStatements = async (req, res) => {
  try {
    const statements = await Statement.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    const formatted = statements.map((statement) => ({
      ...statement.toObject(),
      cardIdentifier: formatCardIdentifier(statement),
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch statements",
      error: err.message,
    });
  }
};

exports.deleteStatement = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Statement.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
