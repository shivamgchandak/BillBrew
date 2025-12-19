module.exports = (text) => {
  const t = text.toUpperCase();

  if (t.includes("HDFC BANK")) return "HDFC";

  if (t.includes("SBI BANK")) return "SBI";

  if (t.includes("ICICI BANK")) return "ICICI";

  if (t.includes("Emirates NBD")) return "Emirates NBD";

  if (t.includes("RBL BANK") || t.includes("RBL MYCARD")) return "RBL";

  if (t.includes("HSBC")) return "HSBC";

  return "UNKNOWN";
};