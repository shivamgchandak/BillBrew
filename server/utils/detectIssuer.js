/**
 * Lightweight, generic issuer-hint extractor.
 *
 * Rather than hard-coding banks, we look for common issuer-name patterns
 * in the first few kB of statement text. The result is only a HINT that
 * gets passed to Grok; the model may override it.
 */

const KNOWN_BRANDS = [
  // India
  "HDFC", "ICICI", "SBI", "AXIS", "KOTAK", "YES BANK", "RBL", "IDFC",
  "INDUSIND", "AU SMALL FINANCE", "STANDARD CHARTERED", "CITI", "HSBC",
  "AMERICAN EXPRESS", "AMEX",
  // Middle East
  "EMIRATES NBD", "ENBD", "MASHREQ", "ADCB", "FAB", "DIB", "ADIB",
  "NBD", "RAKBANK", "CBD",
  // US / global
  "CHASE", "CAPITAL ONE", "BANK OF AMERICA", "WELLS FARGO", "DISCOVER",
  "BARCLAYS", "SYNCHRONY", "US BANK", "USBANK", "PNC", "NAVY FEDERAL",
  // UK / EU
  "MONZO", "REVOLUT", "STARLING", "LLOYDS", "NATWEST", "SANTANDER",
  "DEUTSCHE BANK", "BNP PARIBAS",
];

module.exports = (text) => {
  if (!text) return "UNKNOWN";
  const head = text.slice(0, 4000).toUpperCase();

  for (const brand of KNOWN_BRANDS) {
    if (head.includes(brand)) return brand;
  }

  // Heuristic fallback: line ending in "BANK" or "CARD" near the top.
  const match = head.match(/([A-Z][A-Z& ]{2,30}(?:BANK|CARD|CREDIT))/);
  if (match) return match[1].trim();

  return "UNKNOWN";
};
