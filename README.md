# 뉴스 검색 챗봇

키워드를 입력하면 관련 뉴스를 **10개** 검색해 주는 챗봇입니다.

---

## 다른 방법: 설치 없이 (HTML만)

**Python·Node.js 모두 설치하지 않고** 사용하려면:

1. **`standalone.html`** 파일을 더블클릭해 브라우저에서 엽니다.
2. 검색할 **키워드**를 입력하고 **검색** 버튼을 누릅니다.
3. 구글 뉴스 검색 페이지가 새 탭에서 열립니다. (결과는 구글에서 확인)

→ 서버/런타임 설치가 전혀 필요 없습니다.

---

## 실행 방법 (Node.js — 채팅 UI + 뉴스 10개)

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **서버 실행**
   ```bash
   npm start
   ```

3. 브라우저에서 **http://localhost:3000** 을 열고, 입력창에 **검색할 키워드**를 입력하면 관련 뉴스 10개가 채팅 형태로 표시됩니다.

---

## 대안: Python으로 실행

Python이 설치되어 있다면 Streamlit 버전도 사용할 수 있습니다.

```bash
pip install -r requirements.txt
streamlit run app.py
```

## 구성

### Node.js 버전 (권장)
- `server.js` — Express 서버 + 뉴스 검색 API
- `public/index.html` — 챗봇 UI (HTML/JS)
- `package.json` — Node 의존성 (express, duck-duck-scrape)

### Python 버전
- `app.py` — Streamlit 챗봇 UI
- `news_search.py` — 뉴스 검색 로직
- `requirements.txt` — Python 패키지 목록

## 참고

- 뉴스 검색에는 **DuckDuckGo**를 사용합니다. (API 키 불필요)
- 구글 뉴스만 사용하려면 SerpAPI 등 별도 API 연동이 필요합니다.
