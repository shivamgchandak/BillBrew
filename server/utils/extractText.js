const fs = require("fs");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

const extractText = async (filePath, password = null) => {
  const data = new Uint8Array(fs.readFileSync(filePath));

  try {
    const loadingTask = pdfjsLib.getDocument({
      data,
      password,
    });

    const pdf = await loadingTask.promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ");
    }

    return text;
  } catch (err) {
    if (
      err?.name === "PasswordException" ||
      err?.message?.toLowerCase().includes("password")
    ) {
      throw new Error("PDF_PASSWORD_REQUIRED");
    }
    throw err;
  }
};

module.exports = extractText;