const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

/**
 * Extract text from a PDF buffer.
 *
 * Throws:
 *   - "PDF_PASSWORD_REQUIRED"  when the PDF is encrypted and no password was supplied
 *   - "PDF_PASSWORD_INCORRECT" when a password was supplied but was wrong
 */
const extractText = async (buffer, password = null) => {
  const data = new Uint8Array(buffer);

  try {
    const loadingTask = pdfjsLib.getDocument({
      data,
      // pdf.js only passes the password to the doc if it's a non-empty string
      password: password || undefined,
    });
    const pdf = await loadingTask.promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n";
    }
    return text;
  } catch (err) {
    const msg = (err?.message || "").toLowerCase();
    const isPwdError =
      err?.name === "PasswordException" || msg.includes("password");

    if (isPwdError) {
      // pdf.js sets err.code = 1 when password needed, 2 when incorrect.
      if (err?.code === 2 || msg.includes("incorrect")) {
        throw new Error("PDF_PASSWORD_INCORRECT");
      }
      if (password) {
        // We supplied one and still got a password error → treat as wrong.
        throw new Error("PDF_PASSWORD_INCORRECT");
      }
      throw new Error("PDF_PASSWORD_REQUIRED");
    }
    throw err;
  }
};

module.exports = extractText;
