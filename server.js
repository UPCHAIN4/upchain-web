// server.js
const express = require("express");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// public 폴더 정적 파일 서빙
app.use(express.static(path.join(__dirname, "public")));

// 업비트 시세 프록시
// 예: /api/upbit/ticker?markets=KRW-BTC,KRW-ETH
app.get("/api/upbit/ticker", async (req, res) => {
  const { markets } = req.query;
  if (!markets) {
    return res
      .status(400)
      .json({ error: "markets 쿼리 파라미터가 필요합니다. (예: KRW-BTC,KRW-ETH)" });
  }

  try {
    const { data } = await axios.get("https://api.upbit.com/v1/ticker", {
      params: { markets },
    });
    res.json(data);
  } catch (err) {
    console.error("Upbit API 오류:", err.response?.data || err.message);
    res.status(500).json({ error: "Upbit 시세 조회 실패" });
  }
});

// 투자자 보호 뉴스 프록시 (NewsAPI 사용)
app.get("/api/news", async (req, res) => {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "NEWS_API_KEY가 설정되어 있지 않습니다." });
  }

  const q = req.query.q || "가상자산 투자자 보호";

  try {
    const { data } = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q,
        language: "ko",
        sortBy: "publishedAt",
        apiKey,
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
