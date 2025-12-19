const Statement = require("../models/Statement");
const extractText = require("../utils/extractText");
const detectIssuer = require("../utils/detectIssuer");
const uploadPDF = require("../utils/uploadToCloudinary");
const formatCardIdentifier = require("../utils/formatCardIdentifier");
const parseWithOpenAI = require("../utils/parseWithOpenAI");

exports.uploadStatement = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const text = await extractText(req.file.buffer);
    const issuerHint = detectIssuer(text);
    const parsedData = await parseWithOpenAI(text, issuerHint);
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
    })
      .sort({ createdAt: -1 });

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