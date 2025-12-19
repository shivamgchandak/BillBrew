const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (text, issuerHint) => {
  const prompt = `
You are a financial document parser specialized in credit card statements.

--------------------------------
OUTPUT RULES (STRICT)
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
ISSUER RULES (CRITICAL)
--------------------------------
issuer must be one of:
HDFC, RBL, HSBC, SBI, ICICI, AXIS, EMIRATES_NBD (or null)

ISSUER DETECTION:
- "Emirates NBD", "ENBD", "الإمارات دبي الوطني" → EMIRATES_NBD
- "RBL Bank" → RBL

--------------------------------
CARD NUMBER RULES (VERY IMPORTANT)
--------------------------------

GENERAL:
- Remove all masking characters (X, *)
- Ignore spaces

BANK-SPECIFIC RULES:

EMIRATES_NBD:
- Card number format: "4033 XXXX XXXX 7740"
- Extract last 4 digits → cardLast4
- cardLast2 MUST be null

SBI AND RBL:
- Card numbers are masked and ONLY last 2 digits are valid
- NEVER return cardLast4 for RBL
- Extract ONLY last 2 digits → cardLast2
- cardLast4 MUST be null

--------------------------------
CURRENCY RULES
--------------------------------
Detect PRIMARY billing currency.

Mapping:
- ₹ / INR / Rs. → INR
- AED / د.إ → AED
- $ / USD → USD
- € / EUR → EUR

--------------------------------
ICICI BANK FIXES (ULTRA STRICT)
--------------------------------

GENERAL:
- ICICI statements are VERY noisy
- NEVER infer or guess values

BILLING CYCLE (ICICI):
- If billingCycle already exists → DO NOT modify
- Otherwise extract ONLY from:
  - "Billing Period"
  - "Statement Period"

DUE DATE (ICICI):
- Extract ONLY from the exact label:
  "Payment Due Date"
- Ignore:
  - Statement Date
  - Billing cycle end date
- Convert to format: "DD Mon YYYY"

TOTAL AMOUNT (ICICI):
- Extract ONLY from the exact label:
  "Total Amount Due"

- ABSOLUTELY FORBIDDEN labels:
  - Statement Balance
  - Current Balance
  - Outstanding Balance
  - Total Outstanding
  - Retail Balance

CR CONVERSION RULE:
- If value contains "CR":
  1 CR = 10,000,000
- Example:
  "₹4.55 CR" → 45500000

- Remove commas before parsing numbers
- DO NOT default to 0
- If label mismatch → return null

MINIMUM AMOUNT (ICICI):
- Extract ONLY from the exact label:
  "Minimum Amount Due"

- If value is explicitly "₹0.00" → return 0
- If label is missing → return null
- NEVER infer from:
  - Late fee
  - Interest
  - GST

ICICI SANITY CHECK:
- If totalAmount is extremely large AND minimumAmount is 0 → ACCEPT
- This is normal ICICI behavior

--------------------------------
BILLING CYCLE RULES (CRITICAL)
--------------------------------
billingCycle MUST be a DATE RANGE.

Allowed format:
"DD Mon YYYY - DD Mon YYYY"

Use ONLY:
- "Statement Period"
- "Billing Period"

Example:
"07-Sep-25 to 06-Oct-25"
→ "07 Sep 2025 - 06 Oct 2025"

--------------------------------
DUE DATE RULES (STRICT)
--------------------------------
Use ONLY labels:
- "Payment Due Date"
- "Due Date"

❌ NEVER use:
- Billing cycle end date
- Statement date

--------------------------------
TOTAL AMOUNT RULES (HARD LOCK)
--------------------------------

VALIDATION RULE (ALL BANKS):
- totalAmount MUST be >= minimumAmount
- If violated → return null

totalAmount = TOTAL PAYMENT DUE ONLY.

✔ Accept ONLY:
- "Total Payment Due"
- "Total Payment Due (AED)"
- "Total Amount Due"

❌ ABSOLUTELY FORBIDDEN:
- Credit Limit
- Available Credit Limit (AED)
- Current Balance
- Outstanding Balance

EMIRATES NBD SPECIFIC:
- totalAmount MUST come from "STATEMENT SUMMARY"
- Label: "Total Payment Due (AED)"
- If multiple AED values exist and label mismatch → return null

--------------------------------
MINIMUM AMOUNT RULES
--------------------------------
Extract ONLY from:
- "Minimum Payment Due"
- "Min. Amt. Due"

--------------------------------
MULTI-PAGE RULE
--------------------------------
- Page 1 → limits, promos
- Page 2 → STATEMENT SUMMARY (PAYMENT VALUES)

--------------------------------
ISSUER HINT
--------------------------------
Issuer hint (may be wrong): ${issuerHint || "unknown"}

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
      {
        role: "system",
        content:
          "You extract bank statement data with strict financial accuracy. Never guess."
      },
      {
        role: "user",
        content: prompt
      }
    ],
  });

  const raw = response.choices[0].message.content;

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("OPENAI_PARSE_FAILED");
  }
};