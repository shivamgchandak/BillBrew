const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (text, issuerHint) => {
    const prompt = `
You are a financial document parser specialized in Indian credit card statements.

Your task is to extract structured data from the statement text below.

--------------------------------
OUTPUT RULES
--------------------------------
Return STRICT JSON ONLY.
Do NOT include markdown, comments, or explanations.

JSON format:
{
  "issuer": string | null,
  "currency": string | null,
  "cardLast4": string | null,
  "cardLast2": string | null,
  "billingCycle": string | null,
  "dueDate": string | null,
  "totalAmount": number | null,
  "minimumAmount": number | null
}

--------------------------------
GENERAL EXTRACTION RULES
--------------------------------
- issuer must be one of: HDFC, RBL, HSBC, SBI, ICICI, AXIS (or null)
- cardLast4 = last 4 digits of card number if present
- cardLast2 = last 2 digits ONLY if last 4 digits are not found
- Amount fields must be numbers only:
  - Remove commas
  - Remove currency symbols
  - Example: "₹12,345.67" → 12345.67

--------------------------------
CURRENCY RULES (NEW)
--------------------------------
Detect the statement currency.

Use the following mapping:
- ₹ or INR or Rs. → "INR"
- AED or د.إ → "AED"
- $ or USD → "USD"
- € or EUR → "EUR"

Rules:
- Prefer explicit currency labels in totals or headers
- If multiple currencies appear, use the PRIMARY billing currency
- If currency cannot be confidently determined → return null

--------------------------------
BILLING CYCLE RULES (CRITICAL)
--------------------------------
billingCycle MUST be a DATE RANGE.
If a valid range cannot be determined, return billingCycle = null.

❌ DO NOT use:
- Statement Date
- Due Date
- Any single date

✔ billingCycle format MUST be:
"DD Mon YYYY - DD Mon YYYY"
Example:
"20 Oct 2025 - 19 Nov 2025"

--------------------------------
HOW TO FIND BILLING CYCLE
--------------------------------

STEP 1 — EXPLICIT LABEL (HIGHEST PRIORITY)
If the statement explicitly contains a billing range, extract it.

Issuer-specific labels:
- HDFC:
  "Billing Period", "Statement Period"
  Example: "20 Oct, 2025 - 19 Nov, 2025"

- RBL:
  "Statement Period"
  Example: "18-10-2025 to 17-11-2025"
  Convert "to" → "-"

- ICICI:
  "Statement Period"
  Example: "October 16, 2025 to December 15, 2025"

- AXIS:
  "Statement Period", "Billing Period"
  Often appears near "Total Amount Due"

- SBI:
  "Statement Period", "Billing Period"

- HSBC:
  "Statement Period"

--------------------------------
STEP 2 — INFER BILLING CYCLE (ONLY IF NOT EXPLICIT)
--------------------------------
If NO explicit billing period label exists, infer the billing cycle using BANK-SPECIFIC LOGIC.

Inference rules:
- Identify ALL transaction dates in the statement
- Use the EARLIEST transaction date as cycle start
- Use the LATEST transaction date as cycle end
- The inferred range MUST be plausible for that issuer

Issuer inference guidance:
- HDFC / ICICI / AXIS / RBL:
  Billing cycle is typically ~30 days
- SBI:
  Often exactly one calendar month
- HSBC:
  Usually 28–31 days

❗ If transaction dates are missing, incomplete, or ambiguous → billingCycle = null

--------------------------------
DUE DATE RULES
--------------------------------
- dueDate must be a SINGLE date
- Do NOT return a date range
- Prefer labels:
  "Payment Due Date"
  "Due Date"
  "Pay By"

--------------------------------
ISSUER HINT
--------------------------------
Issuer hint (may be incorrect): ${issuerHint || "unknown"}

--------------------------------
STATEMENT TEXT
--------------------------------
"""
${text.slice(0, 12000)}
"""
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0,
    messages: [
      { role: "system", content: "You extract structured data from bank statements." },
      { role: "user", content: prompt },
    ],
  });

  const raw = response.choices[0].message.content;

  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error("OPENAI_PARSE_FAILED");
  }
};