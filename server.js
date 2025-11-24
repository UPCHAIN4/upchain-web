// server.js
const express = require("express");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ───────── 공통 설정 ─────────
app.use(express.static(path.join(__dirname, "public")));

const UPBIT_BASE_URL = "https://api.upbit.com/v1";
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// ───────── 업비트 현재가 (/api/ticker) ─────────

app.get("/api/ticker", async (req, res) => {
  try {
    const { markets } = req.query;
    if (!markets) {
      return res.status(400).json({ error: "markets 파라미터가 필요합니다." });
    }

    const resp = await axios.get(`${UPBIT_BASE_URL}/ticker`, {
      params: { markets },
      headers: { Accept: "application/json" },
    });

    res.json(resp.data);
  } catch (err) {
    console.error("Upbit /ticker error:", err.message);
    res.status(500).json({ error: "Failed to fetch ticker from Upbit" });
  }
});

// ───────── 업비트 1분봉 캔들 (/api/candles) ─────────

app.get("/api/candles", async (req, res) => {
  try {
    const { market, count = 50 } = req.query;
    if (!market) {
      return res.status(400).json({ error: "market 파라미터가 필요합니다." });
    }

    const resp = await axios.get(
      `${UPBIT_BASE_URL}/candles/minutes/1`,
      {
        params: { market, count },
        headers: { Accept: "application/json" },
      }
    );

    res.json(resp.data);
  } catch (err) {
    console.error("Upbit /candles error:", err.message);
    res.status(500).json({ error: "Failed to fetch candles from Upbit" });
  }
});

// ───────── 투자자 보호 뉴스 (/api/investor-news) ─────────
app.get("/api/investor-news", async (req, res) => {
  try {
    if (!NEWS_API_KEY) {
      return res
        .status(500)
        .json({ error: "NEWS_API_KEY가 .env에 설정되어 있지 않습니다." });
    }

    const q = req.query.q || "가상자산 투자자 보호 OR 암호화폐 사기 OR 코인 해킹";

    const { data } = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q,
        language: "ko",
        sortBy: "publishedAt",
        pageSize: 8,
        apiKey: NEWS_API_KEY,
      },
    });

    res.json(data);
  } catch (err) {
    console.error("News API 오류:", err.response?.data || err.message);
    res.status(500).json({ error: "뉴스 조회 실패" });
  }
});


app.listen(PORT, () => {
  console.log(`UPCHAIN server running at http://localhost:${PORT}`);
});
