module.exports = (text) => {
  const extractAmountNearLabel = (text, label) => {
    const regex = new RegExp(
      `${label}[\\s\\S]{0,80}?([\\d,]+\\.\\d{2})`,
      "i"
    );

    const match = text.match(regex);
    if (!match) return null;

    const num = Number(match[1].replace(/,/g, ""));
    return Number.isNaN(num) ? null : num;
  };

  /* ---------------- CURRENCY ---------------- */
  const currency = (() => {
    if (/₹|INR|Rs\.?/i.test(text)) return "INR";
    if (/\bUSD\b|\$/i.test(text)) return "USD";
    if (/\bEUR\b|€/i.test(text)) return "EUR";
    if (/\bAED\b|د.إ/i.test(text)) return "AED";
    return null;
  })();

  return {
    issuer: "HDFC",

    currency, // ✅ added

    // ✅ DO NOT TOUCH THIS LOGIC
    cardLast4: (() => {
      // Matches:
      // 652915XXXXXX6628
      // 123456XXXXXX9876
      const match = text.match(/\b\d{6}X{4,6}(\d{4})\b/);
      return match ? match[1] : null;
    })(),

    // ✅ Explicitly set (important for formatter fallback)
    cardLast2: null,

    billingCycle:
      text.match(
        /Billing Period[\s\S]*?(\d{2}\s\w+,\s\d{4}\s*-\s*\d{2}\s\w+,\s\d{4})/i
      )?.[1] || null,

    dueDate:
      text.match(/DUE DATE[\s\S]*?(\d{2}\s\w+,\s\d{4})/i)?.[1] || null,

    totalAmount: extractAmountNearLabel(text, "TOTAL AMOUNT DUE"),
    minimumAmount: extractAmountNearLabel(text, "MINIMUM DUE"),
  };
};