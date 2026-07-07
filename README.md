# BillBrew — Credit-card statements, brewed clean

**BillBrew** is a full-stack web app that turns messy credit-card statement
PDFs — from *any* bank in the world — into clean, structured data. Upload,
brew, and get issuer, billing cycle, due date, currency, total payable,
minimum due, credit limit and more, all extracted by an LLM.

---

## Highlights

- **Works with any issuer** — HDFC, ICICI, SBI, Axis, Chase, Amex, Discover,
  Emirates NBD, HSBC, Barclays, Revolut… anything, in any currency.
- **Powered by Groq** (`llama-3.3-70b-versatile`, JSON mode) — generous free tier at speeds most hosted LLMs can't match.
- **Password-protected PDFs** — the app detects encryption and prompts you
  for the password in-flow.
- **Email OTP signup** — six-digit verification code by email (Nodemailer +
  Gmail SMTP), 10-minute expiry, rate-limited attempts.
- **Modern UI** — Inter typeface, warm palette, responsive dashboard.

---

## Tech stack

| Layer     | Tools                                              |
|-----------|----------------------------------------------------|
| Frontend  | React 19 (Vite), Redux Toolkit, SCSS               |
| Backend   | Node.js, Express 5, MongoDB (Mongoose)             |
| AI parser | Groq (`llama-3.3-70b-versatile`, JSON mode)        |
| PDF       | `pdfjs-dist` (handles encrypted PDFs)              |
| Email     | Nodemailer + Gmail SMTP                            |
| Storage   | Cloudinary (raw PDF backup)                        |

---

## Getting started

### 1. Clone & install

```bash
git clone <this repo>
cd surefullstack

cd server && npm install
cd ../frontend && npm install
```

### 2. Configure the server

Copy the example env file and fill in the blanks:

```bash
cd server
cp .env.example .env
```

You'll need:

- `MONGO_URI` — any MongoDB Atlas connection string.
- `JWT_SECRET` — a long random string.
- `GROQ_API_KEY` — free from <https://console.groq.com/keys>.
- `SMTP_USER` / `SMTP_PASS` — a Gmail address + [app password][gmail-app-pw]
  for sending OTP emails.
- `CLOUDINARY_*` — for storing the uploaded PDFs.

[gmail-app-pw]: https://myaccount.google.com/apppasswords

### 3. Configure the frontend

Create `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Run

```bash
# terminal 1 – API
cd server && npm run dev

# terminal 2 – web
cd frontend && npm run dev
```

Open http://localhost:5173 and you're brewing.

---

## API surface

### Auth

| Method | Path                          | Description                                     |
|--------|-------------------------------|-------------------------------------------------|
| POST   | `/api/auth/signup/request-otp`| `{name,email,password}` → emails a 6-digit code |
| POST   | `/api/auth/signup/verify-otp` | `{email,code}` → creates the user + JWT         |
| POST   | `/api/auth/signup/resend-otp` | `{email}` → resends the code                    |
| POST   | `/api/auth/login`             | `{email,password}` → JWT                        |

### Statements

| Method | Path                     | Notes                                                    |
|--------|--------------------------|----------------------------------------------------------|
| POST   | `/api/statements/upload` | multipart `file` (+ optional `password`). Returns **423** `PDF_PASSWORD_REQUIRED` / `PDF_PASSWORD_INCORRECT` when the PDF is encrypted. |
| GET    | `/api/statements`        | all statements for the current user                      |
| GET    | `/api/statements/:id`    | one statement                                            |
| DELETE | `/api/statements/:id`    | remove a statement                                       |

All statement routes require `Authorization: Bearer <jwt>`.

---

## Password-protected PDFs

The upload endpoint returns HTTP **423** with body
`{ code: "PDF_PASSWORD_REQUIRED" }` when it can't open the file. The
frontend catches this, prompts the user for the password, and retries the
same upload with a `password` form field. A wrong password returns
**423** with `PDF_PASSWORD_INCORRECT`.

---

## License

MIT.
