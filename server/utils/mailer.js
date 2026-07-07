const nodemailer = require("nodemailer");

/**
 * Nodemailer transport backed by Gmail SMTP.
 *
 * Required env vars:
 *   SMTP_USER  – your Gmail address
 *   SMTP_PASS  – a Gmail *app password* (not your normal password)
 *   FROM_EMAIL – (optional) display From address, defaults to SMTP_USER
 */
let cachedTransport = null;

const getTransport = () => {
  if (cachedTransport) return cachedTransport;

  cachedTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return cachedTransport;
};

const otpTemplate = (code, name) => `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f6fb;font-family:'Inter','Segoe UI',Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
      <tr><td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0"
               style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 12px 32px rgba(15,23,42,.08);">
          <tr><td style="padding:32px 40px 8px;">
            <div style="font-size:20px;font-weight:700;color:#0f172a;">
              <span style="color:#f97316;">Bill</span>Brew
            </div>
          </td></tr>
          <tr><td style="padding:16px 40px 8px;">
            <h1 style="font-size:22px;margin:0 0 8px;">Verify your email</h1>
            <p style="margin:0;color:#475569;font-size:14px;line-height:1.5;">
              Hi ${name || "there"}, use the one-time code below to finish
              creating your BillBrew account. It expires in 10 minutes.
            </p>
          </td></tr>
          <tr><td align="center" style="padding:24px 40px 8px;">
            <div style="display:inline-block;padding:16px 28px;border-radius:12px;
                        background:#fff7ed;color:#c2410c;font-size:32px;
                        letter-spacing:10px;font-weight:700;">
              ${code}
            </div>
          </td></tr>
          <tr><td style="padding:16px 40px 32px;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>
`;

exports.sendOtpEmail = async (to, code, name) => {
  const transport = getTransport();
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;

  await transport.sendMail({
    from: `"BillBrew" <${from}>`,
    to,
    subject: `Your BillBrew verification code: ${code}`,
    text: `Your BillBrew verification code is ${code}. It expires in 10 minutes.`,
    html: otpTemplate(code, name),
  });
};
