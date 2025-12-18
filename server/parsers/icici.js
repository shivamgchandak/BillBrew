module.exports = (text) => {
  /* ---------------- HELPERS ---------------- */

  const parseAmount = (label) => {
    const match =
      // ₹4.55 CR
      text.match(
        new RegExp(`${label}[\\s\\S]{0,40}?₹?\\s*([\\d.]+)\\s*CR`, "i")
      ) ||
      // ₹12,345.67
      text.match(
        new RegExp(`${label}[\\s\\S]{0,40}?₹?\\s*([\\d,]+\\.\\d{2})`, "i")
      );

    if (!match) return null;

    let value = Number(match[1].replace(/,/g, ""));
    if (Number.isNaN(value)) return null;

    // Handle Crore
    if (/CR/i.test(match[0])) {
      value = value * 10000000;
    }

    return value;
  };

  /* ---------------- CARD LAST 4 ---------------- */
  const cardLast4 = (() => {
    const match = text.match(/\b\d{4}X{6,8}(\d{4})\b/);
    return match ? match[1] : null;
  })();

  /* ---------------- BILLING CYCLE ---------------- */
  const billingCycle = (() => {
    const match =
      text.match(
        /Statement period[\s:]*([A-Za-z]+\s\d{1,2},\s\d{4})\s*(to|-)\s*([A-Za-z]+\s\d{1,2},\s\d{4})/i
      ) ||
      text.match(
        /Statement period[\s:]*([0-9]{1,2}-[A-Za-z]{3}-[0-9]{4})\s*(to|-)\s*([0-9]{1,2}-[A-Za-z]{3}-[0-9]{4})/i
      );

    return match ? `${match[1]} - ${match[3]}` : null;
  })();

  /* ---------------- DUE DATE (FIXED & SAFE) ---------------- */
  const dueDate = (() => {
    const match = text.match(
      /PAYMENT DUE DATE[\s\S]{0,20}([A-Za-z]+\s\d{1,2},\s\d{4})/i
    );
    return match ? match[1] : null;
  })();

  /* ---------------- CURRENCY ---------------- */
  const currency = (() => {
    if (/₹|INR/i.test(text)) return "INR";
    if (/\bUSD\b|\$/i.test(text)) return "USD";
    if (/\bEUR\b|€/i.test(text)) return "EUR";
    return null;
  })();

  return {
    issuer: "ICICI",
    currency,
    cardLast4,
    cardLast2: null,
    billingCycle,
    dueDate,
    totalAmount: parseAmount("Total Amount due"),
    minimumAmount: parseAmount("Minimum Amount due"),
  };
};