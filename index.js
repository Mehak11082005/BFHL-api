import express from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();
app.use(express.json());

const EMAIL = "YOUR_CHITKARA_EMAIL"; // ← yahan apna email

// ---------- HEALTH ----------
app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});

// ---------- HELPERS ----------
const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++)
    if (n % i === 0) return false;
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);

// ---------- BFHL ----------
app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    let data;

    if (body.fibonacci !== undefined) {
      const n = body.fibonacci;
      let fib = [0, 1];
      for (let i = 2; i < n; i++)
        fib.push(fib[i - 1] + fib[i - 2]);
      data = fib.slice(0, n);
    }

    else if (body.prime) {
      data = body.prime.filter(isPrime);
    }

    else if (body.lcm) {
      data = body.lcm.reduce((a, b) => lcm(a, b));
    }

    else if (body.hcf) {
      data = body.hcf.reduce((a, b) => gcd(a, b));
    }

    else if (body.AI) {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: body.AI }] }]
        }
      );
      data =
        response.data.candidates[0].content.parts[0].text
          .split(" ")[0];
    }

    else {
      return res.status(400).json({
        is_success: false,
        official_email: EMAIL,
        error: "Invalid input"
      });
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data
    });

  } catch (err) {
    res.status(500).json({
      is_success: false,
      official_email: EMAIL,
      error: "Server error"
    });
  }
});

app.listen(3000, () => console.log("Server running"));
