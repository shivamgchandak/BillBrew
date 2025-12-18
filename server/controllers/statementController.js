const Statement = require("../models/Statement");
const extractText = require("../utils/extractText");
const detectIssuer = require("../utils/detectIssuer");
const uploadPDF = require("../utils/uploadToCloudinary");
const formatCardIdentifier = require("../utils/formatCardIdentifier");
const detectCurrency  = require("../utils/detectCurrency");

const parseHDFC = require("../parsers/hdfc");
const parseRBL = require("../parsers/rbl");
const parseICICI = require("../parsers/icici");
const parseWithOpenAI = require("../utils/parseWithOpenAI");

exports.uploadStatement = async (req, res) => {
  try {
    // 1. Extract text (no password support)
    const text = await extractText(req.file.path);

    // 2. Detect issuer
    const issuer = detectIssuer(text);
    const currency = detectCurrency(text);

    // 3. Try manual parser first
    let parsedData = null;

if (issuer === "HDFC") parsedData = parseHDFC(text);
else if (issuer === "RBL") parsedData = parseRBL(text);
else if (issuer === "ICICI") parsedData = parseICICI(text);

    // 4. Check if parser failed
const isParserUseless = !parsedData || (
  issuer === "HDFC"
    ? (!parsedData.cardLast4 &&
       !parsedData.billingCycle &&
       !parsedData.totalAmount)

  : issuer === "RBL"
    ? (!parsedData.cardLast2 &&
       !parsedData.billingCycle &&
       !parsedData.totalAmount)

: issuer === "ICICI"
  ? (!parsedData.cardLast4 &&
     !parsedData.billingCycle &&
     !parsedData.totalAmount)

  : true
);

    // 5. Fallback to OpenAI
    if (isParserUseless) {
      const aiData = await parseWithOpenAI(text, issuer);

      parsedData = {
  issuer,

  currency: parsedData.currency ?? aiData.currency ?? null,

  cardLast4: parsedData.cardLast4 ?? aiData.cardLast4 ?? null,
  cardLast2: parsedData.cardLast2 ?? aiData.cardLast2 ?? null,

  billingCycle: parsedData.billingCycle ?? aiData.billingCycle ?? null,
  dueDate: parsedData.dueDate ?? aiData.dueDate ?? null,

  totalAmount: parsedData.totalAmount ?? aiData.totalAmount ?? null,
  minimumAmount: parsedData.minimumAmount ?? aiData.minimumAmount ?? null,
};
    } else {
      // Manual parser path
      parsedData.currency = parsedData.currency || null;
    }

    // 6. Upload PDF
    const pdfUrl = await uploadPDF(req.file.path);

    // 7. Save statement
    const statement = await Statement.create({
      user: req.user._id,
      pdfUrl,
      ...parsedData,
    });

    // 8. Respond
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