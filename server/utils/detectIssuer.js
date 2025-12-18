module.exports = (text) => {
  const t = text.toUpperCase();

  // HDFC
  if (t.includes("HDFC BANK")) return "HDFC";

  if (t.includes("ICICI BANK")) return "ICICI";

  // RBL
  if (t.includes("RBL BANK") || t.includes("RBL MYCARD")) return "RBL";

  // HSBC (UAE + India)
  if (t.includes("HSBC")) return "HSBC";

  // VISA (generic statements, Emaar, merchant-issued)
  if (
    t.includes("VISA") ||
    t.includes("EMAAR") ||
    t.includes("VISA SIGNATURE") ||
    t.includes("VISA INFINITE")
  ) {
    return "VISA";
  }

  return "UNKNOWN";
};