const mongoose = require("mongoose");

const statementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    issuer: String,
    issuerFull: String,
    cardNetwork: String,
    currency: { type: String, default: "INR" },

    cardLast4: String,
    cardLast2: String,
    cardholderName: String,

    billingCycle: String,
    statementDate: String,
    dueDate: String,

    totalAmount: Number,
    minimumAmount: Number,
    creditLimit: Number,
    availableCredit: Number,

    pdfUrl: String,

    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Statement", statementSchema);
