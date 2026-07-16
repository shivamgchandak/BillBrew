/**
 * Generic credit card statement parser powered by Groq.
 *
 * Groq is OpenAI-compatible, so we reuse the OpenAI SDK and point the
 * baseURL at `https://api.groq.com/openai/v1`. Default model is
 * `llama-3.3-70b-versatile`, which supports strict JSON mode.
 *
 * Get a free key at https://console.groq.com/keys
 *
 * Works with any issuer worldwide. No hard-coded bank list — the model
 * is instructed to identify the issuer from the raw text and follow
 * universal rules for card masks, currency, dates, and amounts.
 */
const OpenAI = require("openai");

// Lazily construct so a missing key at import time doesn't crash the process
// — we surface a friendly error only when the endpoint is actually hit.
let _client = null;
const getClient = () => {
  if (_client) return _client;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const err = new Error("GROQ_API_KEY not configured on server");
    err.code = "GROQ_KEY_MISSING";
    throw err;
  }
  _client = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
  return _client;
};

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const buildPrompt = (text, issuerHint) => `
You are a financial-document parser that reads a credit-card statement (from
ANY bank in the world) and returns strict JSON.

============================================================
OUTPUT (STRICT)
============================================================
Return JSON ONLY. No prose, no markdown, no code fences.

Schema:
{
  "issuer":         string | null,
  "issuerFull":     string | null,
  "cardNetwork":    string | null,
  "currency":       string | null,
  "cardLast4":      string | null,
  "cardLast2":      string | null,
  "cardholderName": string | null,
  "billingCycle":   string | null,
  "statementDate":  string | null,
  "dueDate":        string | null,
  "totalAmount":    number | null,
  "minimumAmount":  number | null,
  "creditLimit":    number | null,
  "availableCredit": number | null
}

============================================================
UNIVERSAL RULES
============================================================
1. Issuer detection: identify from any brand text ("HDFC Bank", "Chase",
   "Citi", "Barclays", "Emirates NBD", "American Express", "Discover", ...).
   Return a short canonical name (uppercase common abbreviations where
   appropriate, otherwise Title Case).
   Also fill "issuerFull" (full legal name if visible, else same as issuer).

2. Card network: "VISA" | "MASTERCARD" | "AMEX" | "RUPAY" | "DISCOVER" |
   "DINERS" | null.

3. Card number:
   - Strip masking chars (X, *, •).
   - If the visible digits include the last 4, return them in cardLast4.
   - If only the last 2 are visible (some Indian issuers mask heavily),
     set cardLast4 = null and cardLast2 = <two digits>.

4. Currency — ISO-4217 code:
   - ₹ / Rs. / INR              → INR
   - AED / د.إ / Dhs.           → AED
   - $ / US$ / USD              → USD
   - € / EUR                    → EUR
   - £ / GBP                    → GBP
   - S$ / SGD                   → SGD
   - SAR / ر.س                  → SAR
   - Otherwise infer the ISO code from label text.

5. Amounts:
   - Return as a plain JSON number (no symbols, no commas, no quotes).
   - "1,23,456.78" → 123456.78
   - "₹4.55 CR" (Indian crore) → 45500000
   - "1.2 M" or "1.2 Mn" → 1200000
   - If a value is "0" or "0.00" that IS a valid number — return 0, not null.

6. Amount labels (use these, in priority order):
   totalAmount   ← "Total Amount Due" | "Total Payment Due" | "New Balance" |
                   "Total Balance" | "Amount Due"
   minimumAmount ← "Minimum Payment Due" | "Minimum Amount Due" |
                   "Min. Amt. Due" | "Minimum Due"
   NEVER pull totalAmount from Credit Limit, Available Credit, Cash Limit,
   Statement Balance from prior cycle, or Reward-points value.

7. Dates — normalize to "DD Mon YYYY" (e.g. "07 Sep 2025").
   Billing cycle format: "DD Mon YYYY - DD Mon YYYY".
   Accept sources: "Statement Period", "Billing Period", "Billing Cycle",
   "Statement From/To".

   INTERPRETING THE MONTH — read carefully, this is the #1 source of errors:
   (a) If the month is written with LETTERS (e.g. "18 Oct 2025", "OCT",
       "October", "18-Nov-2025", "Nov 18, 2025") → trust it exactly as
       written. Do NOT shift or reinterpret it.
   (b) If the date is PURELY NUMERIC with separators - / . (e.g.
       "18-10-2025", "18/10/2025", "18.10.2025") → it is DAY-MONTH-YEAR
       (day first, Indian/DD-MM-YYYY convention). The MIDDLE number is the
       month. So "18-10-2025" = 18 October 2025 (month 10 = Oct), NOT
       November and NOT any other month. "07-12-2025" = 07 December 2025.
       "05-01-2026" = 05 January 2026.
   (c) Never assume US month-first (MM-DD-YYYY) for numeric dates.
   (d) Disambiguation guard: if the FIRST number is greater than 12 it must
       be the day (e.g. "18-10" → 18 is the day, 10 is the month). If the
       SECOND number is greater than 12, then the format is month-first and
       the second number is the day — but this is rare; prefer day-first.
   (e) Numeric month → name map (use exactly): 01=Jan 02=Feb 03=Mar 04=Apr
       05=May 06=Jun 07=Jul 08=Aug 09=Sep 10=Oct 11=Nov 12=Dec.
   (f) Apply the SAME rule to billingCycle, statementDate and dueDate.
   Worked example: input "18-10-2025 to 17-11-2025"
       → billingCycle = "18 Oct 2025 - 17 Nov 2025" (NOT "Nov - Dec").

8. Due date must come from a label containing "Due Date" / "Payment Due".
   Never derive it from statement date or billing-cycle end.

9. If a field is truly not present or ambiguous → return null (do NOT guess).

============================================================
CONTEXT
============================================================
Issuer hint from heuristics (may be wrong or "UNKNOWN"): ${issuerHint || "UNKNOWN"}

============================================================
STATEMENT TEXT
============================================================
"""
${text.slice(0, 16000)}
"""
`;

module.exports = async (text, issuerHint) => {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You extract structured data from bank/credit-card statements with strict financial accuracy. Return JSON only. Never invent values — use null when unsure.",
      },
      { role: "user", content: buildPrompt(text, issuerHint) },
    ],
  });

  const raw = response.choices?.[0]?.message?.content?.trim() || "";

  // Strip any accidental code fences.
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("GROQ_PARSE_FAILED");
  }
};
