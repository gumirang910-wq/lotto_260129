/**
 * 키워드로 뉴스 10개 검색 API 서버 (Node.js)
 * Python 없이 실행: npm install && npm start
 */
const path = require("path");
const express = require("express");
const { searchNews } = require("duck-duck-scrape");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/api/search", async (req, res) => {
  const keyword = (req.query.keyword || "").trim();
  if (!keyword) {
    return res.json({ error: "키워드를 입력하세요.", news: [] });
  }

  try {
    const result = await searchNews(keyword);
    const results = (result.results || result).slice(0, 10);
    const news = results.map((r) => ({
      title: r.title || "",
      link: r.url || r.link || "",
      snippet: (r.body || r.description || r.snippet || "").slice(0, 200),
    }));
    res.json({ keyword, news });
  } catch (err) {
    console.error(err);
    res.json({
      error: "검색 중 오류가 발생했습니다.",
      news: [],
    });
  }
});

app.listen(PORT, () => {
  console.log(`뉴스 검색 챗봇: http://localhost:${PORT}`);
});
