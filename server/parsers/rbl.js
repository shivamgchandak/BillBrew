module.exports = (text) => {
  /* ---------------- HELPERS ---------------- */

  const extractAmount = (label) => {
    const match = text.match(
      new RegExp(`${label}[\\s\\S]{0,80}?([₹Rs\\.\\s]*[\\d,]+\\.\\d{2})`, "i")
    );
    if (!match) return null;

    const num = Number(match[1].replace(/[₹Rs,\\s]/g, ""));
    return Number.isNaN(num) ? null : num;
  };

  /* ---------------- CARD LAST 2 ---------------- */
  const cardLast2 = (() => {
    const match =
      text.match(/Card Number[\\s\\S]{0,30}X{8,}(\\d{2})/i) ||
      text.match(/X{10,}(\\d{2})/i);

    return match ? match[1] : null;
  })();

  /* ---------------- BILLING CYCLE (STRICT RANGE) ---------------- */
  const billingCycle = (() => {
    const match =
      // 18-10-2025 to 17-11-2025
      text.match(
        /(Statement Period|Billing Period)[\\s\\S]{0,40}([0-9]{1,2}[\\/-][0-9]{1,2}[\\/-][0-9]{4})\\s*(to|-|–)\\s*([0-9]{1,2}[\\/-][0-9]{1,2}[\\/-][0-9]{4})/i
      ) ||
      // 18 Oct 2025 to 17 Nov 2025
      text.match(
        /(Statement Period|Billing Period)[\\s\\S]{0,40}([0-9]{1,2}\\s\\w+\\s[0-9]{4})\\s*(to|-|–)\\s*([0-9]{1,2}\\s\\w+\\s[0-9]{4})/i
      );

    if (!match) return null;

    return `${match[2]} - ${match[4]}`;
  })();

  /* ---------------- DUE DATE ---------------- */
  const dueDate = (() => {
    const match =
      text.match(/Payment Due Date[\\s\\S]{0,20}([0-9]{1,2}\\s\\w+\\s[0-9]{4})/i) ||
      text.match(/Due Date[\\s\\S]{0,20}([0-9]{1,2}\\s\\w+\\s[0-9]{4})/i);

    return match ? match[1] : null;
  })();

  /* ---------------- CURRENCY ---------------- */
  const currency = (() => {
    if (/₹|INR|Rs\.?/i.test(text)) return "INR";
    if (/\bUSD\b|\$/i.test(text)) return "USD";
    if (/\bEUR\b|€/i.test(text)) return "EUR";
    if (/\bAED\b|د.إ/i.test(text)) return "AED";
    return null;
  })();

  return {
    issuer: "RBL",
    currency,
    cardLast4: null,
    cardLast2,
    billingCycle,
    dueDate,
    totalAmount: extractAmount("Total Amount Due"),
    minimumAmount: extractAmount("Min\\.\\s*Amt\\.\\s*Due"),
  };
};