const express = require("express");
const { execFile } = require("child_process");
const { rateLimit } = require("express-rate-limit");
require("dotenv").config();

const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("Missing required API_KEY environment variable");
}

const smsSendRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests" },
});

app.use((req, res, next) => {
  if (req.headers["x-api-key"] !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

app.get("/", (req, res) => {
  res.json({ status: "SMS Gateway running 🚀" });
});

app.post("/send-sms", smsSendRateLimiter, (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: "number & message required" });
  }

  execFile("termux-sms-send", ["-n", String(number), String(message)], (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({
        success: false,
        error: stderr || error.message,
      });
    }

    return res.json({
      success: true,
      sentTo: number,
      message,
    });
  });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`SMS Gateway running on port ${PORT}`);
});
