const express = require("express");
const { exec } = require("child_process");
require("dotenv").config();

const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY;

app.use((req, res, next) => {
  if (req.headers["x-api-key"] !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

app.get("/", (req, res) => {
  res.json({ status: "SMS Gateway running 🚀" });
});

app.post("/send-sms", (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: "number & message required" });
  }

  const cmd = `termux-sms-send -n "${number}" "${message}"`;

  exec(cmd, (error, stdout, stderr) => {
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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`SMS Gateway running on port ${PORT}`);
});
