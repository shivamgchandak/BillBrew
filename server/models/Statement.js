const mongoose = require("mongoose");

const statementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    issuer: String,
    currency: {
      type: String,
      default: "INR",
    },

    cardLast4: String,
    cardLast2: String,

    billingCycle: String,
    dueDate: String,

    totalAmount: Number,
    minimumAmount: Number,

    pdfUrl: String,

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Statement", statementSchema);