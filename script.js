const STORAGE_KEY = "lotto_draw_history_v1";
const THEME_KEY = "lotto_theme_v1";
const MAX_HISTORY = 20;
const DRAWS_PER_CLICK = 5;

const $ = (sel) => document.querySelector(sel);

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatTime(d) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
}

function numberColor(n) {
  // 로또볼 느낌: 구간별 색상
  if (n <= 10) return "linear-gradient(135deg, rgba(255, 214, 64, 0.95), rgba(255, 153, 0, 0.65))";
  if (n <= 20) return "linear-gradient(135deg, rgba(110, 200, 255, 0.95), rgba(45, 120, 255, 0.6))";
  if (n <= 30) return "linear-gradient(135deg, rgba(255, 110, 140, 0.95), rgba(255, 60, 85, 0.6))";
  if (n <= 40) return "linear-gradient(135deg, rgba(185, 255, 140, 0.9), rgba(70, 210, 120, 0.55))";
  return "linear-gradient(135deg, rgba(210, 210, 210, 0.92), rgba(120, 120, 120, 0.55))";
}

function drawGame() {
  const set = new Set();
  while (set.size < 7) {
    const n = Math.floor(Math.random() * 45) + 1;
    set.add(n);
  }
  const all = Array.from(set);
  const main = all.slice(0, 6).sort((a, b) => a - b);
  const bonus = all[6];
  return { main, bonus };
}

function drawBatch(count) {
  const draws = [];
  for (let i = 0; i < count; i++) draws.push(drawGame());
  return draws;
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (
      parsed
        // v2: { draws: [{main:number[], bonus:number}], time:string }
        // legacy v1: { numbers:number[], time:string }
        .filter((x) => x && typeof x.time === "string")
        .map((x) => {
          if (Array.isArray(x.draws)) {
            const draws = x.draws
              .filter(
                (d) =>
                  d &&
                  Array.isArray(d.main) &&
                  d.main.length === 6 &&
                  d.main.every((n) => Number.isFinite(n)) &&
                  Number.isFinite(d.bonus),
              )
              .slice(0, DRAWS_PER_CLICK);
            return { time: x.time, draws };
          }
          if (Array.isArray(x.numbers) && x.numbers.length === 6 && x.numbers.every((n) => Number.isFinite(n))) {
            return { time: x.time, draws: [{ main: x.numbers.slice().sort((a, b) => a - b), bonus: null }] };
          }
          return null;
        })
        .filter(Boolean)
        .slice(0, MAX_HISTORY)
    );
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

let toastTimer = null;
function toast(msg) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove("show"), 1600);
}

function renderBalls(draws) {
  const root = $("#balls");
  if (!root) return;
  root.innerHTML = "";

  for (let i = 0; i < draws.length; i++) {
    const draw = draws[i];
    const row = document.createElement("div");
    row.className = "draw-row";

    const label = document.createElement("div");
    label.className = "draw-label";
    label.textContent = `${i + 1}게임`;
    row.appendChild(label);

    for (const n of draw.main) {
      const div = document.createElement("div");
      div.className = "ball";
      div.textContent = String(n);
      div.style.background = numberColor(n);
      row.appendChild(div);
    }

    const plus = document.createElement("span");
    plus.className = "plus";
    plus.textContent = "+";
    row.appendChild(plus);

    const bonus = document.createElement("div");
    bonus.className = "ball bonus";
    bonus.textContent = draw.bonus == null ? "-" : String(draw.bonus);
    bonus.style.background = draw.bonus == null ? "rgba(255,255,255,0.08)" : numberColor(draw.bonus);
    row.appendChild(bonus);

    root.appendChild(row);
  }
}

function renderHistory(history) {
  const root = $("#history");
  if (!root) return;
  root.innerHTML = "";

  if (history.length === 0) {
    const li = document.createElement("li");
    li.className = "history-item";
    li.innerHTML = `<div class="history-time">기록이 아직 없어요. 먼저 추첨해보세요.</div>`;
    root.appendChild(li);
    return;
  }

  for (const item of history) {
    const li = document.createElement("li");
    li.className = "history-item";
    const wraps = document.createElement("div");
    wraps.className = "history-numbers";

    const draws = Array.isArray(item.draws) ? item.draws : [];
    for (let i = 0; i < draws.length; i++) {
      const d = draws[i];
      const row = document.createElement("div");
      row.className = "history-draw";

      for (const n of d.main) {
        const s = document.createElement("span");
        s.className = "mini";
        s.textContent = String(n);
        s.style.background = numberColor(n);
        row.appendChild(s);
      }

      const plus = document.createElement("span");
      plus.className = "mini-plus";
      plus.textContent = "+";
      row.appendChild(plus);

      const b = document.createElement("span");
      b.className = "mini bonus";
      b.textContent = d.bonus == null ? "-" : String(d.bonus);
      b.style.background = d.bonus == null ? "rgba(255,255,255,0.08)" : numberColor(d.bonus);
      row.appendChild(b);

      wraps.appendChild(row);
    }

    const time = document.createElement("div");
    time.className = "history-time";
    time.textContent = item.time;

    li.appendChild(wraps);
    li.appendChild(time);
    root.appendChild(li);
  }
}

function batchToText(draws) {
  if (!Array.isArray(draws) || draws.length === 0) return "";
  return draws
    .map((d) => {
      const main = Array.isArray(d.main) ? d.main : [];
      const bonus = d.bonus;
      if (main.length !== 6 || main.some((n) => !Number.isFinite(n))) return "";
      if (!Number.isFinite(bonus)) return `${main.join(", ")} + -`;
      return `${main.join(", ")} + ${bonus}`;
    })
    .filter(Boolean)
    .join("\n");
}

async function copyCurrentNumbers() {
  const text = batchToText(currentBatch);
  if (!text) {
    toast("복사할 번호가 없어요. 먼저 추첨해 주세요.");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    toast(`복사 완료: ${text}`);
  } catch {
    // clipboard 권한이 막힌 환경 fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "true");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    toast(ok ? `복사 완료: ${text}` : "복사에 실패했어요.");
  }
}

function applyTheme(theme) {
  const html = document.documentElement;
  const btn = $("#btnTheme");
  if (theme === "light") {
    html.setAttribute("data-theme", "light");
    btn?.setAttribute("aria-pressed", "true");
    btn && (btn.textContent = "라이트");
  } else {
    html.removeAttribute("data-theme");
    btn?.setAttribute("aria-pressed", "false");
    btn && (btn.textContent = "다크");
  }
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  // 시스템 설정 기반
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)")?.matches;
  return prefersLight ? "light" : "dark";
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  const next = current === "light" ? "dark" : "light";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
  toast(next === "light" ? "라이트 테마로 전환" : "다크 테마로 전환");
}

function init() {
  const btnDraw = $("#btnDraw");
  const btnCopy = $("#btnCopy");
  const btnClear = $("#btnClearHistory");
  const drawTime = $("#drawTime");
  const btnTheme = $("#btnTheme");

  let history = loadHistory();
  renderHistory(history);

  const theme = loadTheme();
  applyTheme(theme);

  currentBatch = [];

  function doDraw() {
    const draws = drawBatch(DRAWS_PER_CLICK);
    const now = new Date();
    const time = formatTime(now);
    currentBatch = draws;
    renderBalls(draws);
    if (drawTime) drawTime.textContent = time;
    if (btnCopy) btnCopy.disabled = false;

    history = [{ draws, time }, ...history].slice(0, MAX_HISTORY);
    saveHistory(history);
    renderHistory(history);
  }

  btnDraw?.addEventListener("click", doDraw);
  btnCopy?.addEventListener("click", copyCurrentNumbers);
  btnClear?.addEventListener("click", () => {
    history = [];
    saveHistory(history);
    renderHistory(history);
    toast("기록을 지웠어요.");
  });
  btnTheme?.addEventListener("click", toggleTheme);

  document.addEventListener("keydown", (e) => {
    if (e.isComposing) return;
    const tag = (e.target?.tagName || "").toLowerCase();
    const isTyping = tag === "input" || tag === "textarea" || tag === "select";
    if (isTyping) return;

    if (e.key === "Enter") {
      e.preventDefault();
      doDraw();
    } else if (e.key === "c" || e.key === "C") {
      e.preventDefault();
      copyCurrentNumbers();
    }
  });
}

document.addEventListener("DOMContentLoaded", init);

// 메모리 상태(복사용)
let currentBatch = [];
