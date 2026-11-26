// Builds the static site into ./public from curriculum.md and lessons/*.md.
// Run: npm run build
import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public');
const SITE_TITLE = 'LLM Training 每日一课';
const SITE_TAGLINE = 'One LLM training concept a day: SFT, RL, post-training, agents and embodied AI data.';
const REPO_URL = 'https://github.com/selina-bian-1122/llm-training-daily';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const norm = (s) => String(s).replace(/\s+/g, '').toLowerCase();

// --- frontmatter -----------------------------------------------------------
function parseLesson(file) {
  const raw = readFileSync(join(root, 'lessons', file), 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing frontmatter`);
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (/^".*"$/.test(v) || /^'.*'$/.test(v)) v = v.slice(1, -1);
    meta[kv[1]] = v;
  }
  for (const k of ['day', 'date', 'title']) if (!meta[k]) throw new Error(`${file}: frontmatter needs "${k}"`);
  meta.day = Number(meta.day);
  return { ...meta, file, slug: `day-${String(meta.day).padStart(3, '0')}`, body: m[2] };
}

// --- curriculum ------------------------------------------------------------
function parseCurriculum() {
  const stages = [];
  for (const line of readFileSync(join(root, 'curriculum.md'), 'utf8').split('\n')) {
    const h = line.match(/^##\s+(.+)$/);
    if (h) { stages.push({ name: h[1].trim(), items: [] }); continue; }
    const t = line.match(/^\s*-\s*\[([ xX])\]\s*(?:\d+\.\s*)?(.+)$/);
    if (t && stages.length) stages.at(-1).items.push({ done: t[1] !== ' ', title: t[2].trim() });
  }
  return stages;
}

// --- page shell ------------------------------------------------------------
const css = `
:root{--bg:#fbfaf8;--card:#fff;--ink:#1d1d1f;--muted:#6b6b70;--line:#e7e4df;--accent:#c2416b;--accent-soft:#fbe9ef;--code:#f3f1ee}
@media (prefers-color-scheme:dark){:root{--bg:#141416;--card:#1c1c1f;--ink:#ececee;--muted:#9a9aa2;--line:#2c2c31;--accent:#f07aa0;--accent-soft:#3a1f29;--code:#242428}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.75 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:760px;margin:0 auto;padding:40px 20px 80px}
header.site{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:28px;font-size:14px}
header.site .brand{font-weight:700;color:var(--ink)}
header.site nav a{margin-left:16px;color:var(--muted)}
h1{font-size:32px;line-height:1.25;margin:0 0 8px;letter-spacing:-.01em}
h2{font-size:20px;margin:36px 0 12px}
.lede{color:var(--muted);margin:0 0 24px}
.progress{display:flex;align-items:center;gap:12px;font-size:14px;color:var(--muted);margin:0 0 32px}
.bar{flex:1;height:8px;background:var(--line);border-radius:99px;overflow:hidden}.bar span{display:block;height:100%;background:var(--accent);border-radius:99px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px 22px;margin:0 0 12px}
.card.latest{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.card .meta{font-size:13px;color:var(--muted)}
.card h3{font-size:18px;margin:4px 0 6px;line-height:1.4}.card h3 a{color:var(--ink)}
.card p{margin:0;color:var(--muted);font-size:15px}
.pill{display:inline-block;font-size:12px;padding:1px 8px;border-radius:99px;background:var(--accent-soft);color:var(--accent);margin-right:6px}
.stage{margin:0 0 20px}.stage h3{font-size:14px;color:var(--muted);font-weight:600;margin:0 0 6px;text-transform:none}
.stage ol{margin:0;padding:0;list-style:none}
.stage li{display:flex;gap:10px;padding:6px 0;border-bottom:1px dashed var(--line);font-size:15px}
.stage li .n{flex:none;width:28px;color:var(--muted);font-variant-numeric:tabular-nums}
.stage li.done .t{color:var(--ink)}.stage li.todo .t{color:var(--muted)}
.stage li .s{margin-left:auto;font-size:13px;color:var(--muted)}.stage li.done .s{color:var(--accent)}
article h2{font-size:19px;border-top:1px solid var(--line);padding-top:24px}
article h2:first-of-type{border-top:0;padding-top:0}
article blockquote{margin:0;padding:12px 16px;background:var(--accent-soft);border-radius:10px;color:var(--ink)}
article blockquote p{margin:0}
article table{width:100%;border-collapse:collapse;font-size:15px}
article th,article td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line)}
article th{color:var(--muted);font-weight:600}
article code{background:var(--code);padding:1px 5px;border-radius:5px;font-size:.92em}
article ul{padding-left:22px}
.pager{display:flex;justify-content:space-between;gap:12px;margin-top:40px;font-size:15px}
.pager a{display:block;max-width:48%}
footer{margin-top:56px;font-size:13px;color:var(--muted);border-top:1px solid var(--line);padding-top:16px}
`;

function page({ title, desc, body, depth = 0 }) {
  const up = depth ? '../' : '';
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<link rel="stylesheet" href="${up}style.css"></head><body><div class="wrap">
<header class="site"><a class="brand" href="${up}index.html">${esc(SITE_TITLE)}</a><nav><a href="${up}index.html#roadmap">路线</a><a href="${up}index.html#log">日志</a><a href="${REPO_URL}">GitHub</a></nav></header>
${body}
<footer>每天一课，由开源 Agent Skill <a href="${REPO_URL}">llm-training-daily</a> 研究、撰写并发布。内容采用 CC BY 4.0，代码采用 MIT。</footer>
</div></body></html>`;
}

// --- build -----------------------------------------------------------------
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'lessons'), { recursive: true });
writeFileSync(join(out, 'style.css'), css.trim());

const lessons = readdirSync(join(root, 'lessons')).filter((f) => f.endsWith('.md')).map(parseLesson).sort((a, b) => a.day - b.day);
const stages = parseCurriculum();
const total = stages.reduce((n, s) => n + s.items.length, 0);
const done = stages.reduce((n, s) => n + s.items.filter((i) => i.done).length, 0);
const byTitle = new Map(lessons.map((l) => [norm(l.title), l]));

lessons.forEach((l, i) => {
  const prev = lessons[i - 1], next = lessons[i + 1];
  const body = `<p class="meta"><span class="pill">Day ${l.day}</span>${esc(l.date)}${l.stage ? ` · ${esc(l.stage)}` : ''}</p>
<h1>${esc(l.title)}</h1>
<article>${marked.parse(l.body)}</article>
<nav class="pager"><span>${prev ? `<a href="${prev.slug}.html">← Day ${prev.day} · ${esc(prev.title)}</a>` : ''}</span><span>${next ? `<a href="${next.slug}.html">Day ${next.day} · ${esc(next.title)} →</a>` : ''}</span></nav>`;
  writeFileSync(join(out, 'lessons', `${l.slug}.html`), page({ title: `Day ${l.day} · ${l.title} | ${SITE_TITLE}`, desc: l.summary || l.title, body, depth: 1 }));
});

const newest = [...lessons].reverse();
const card = (l, latest) => `<div class="card${latest ? ' latest' : ''}"><div class="meta"><span class="pill">Day ${l.day}</span>${esc(l.date)}${l.stage ? ` · ${esc(l.stage)}` : ''}</div>
<h3><a href="lessons/${l.slug}.html">${esc(l.title)}</a></h3>${l.summary ? `<p>${esc(l.summary)}</p>` : ''}</div>`;

let n = 0;
const roadmap = stages.map((s) => `<div class="stage"><h3>${esc(s.name)}</h3><ol>${s.items.map((it) => {
  n += 1;
  const l = byTitle.get(norm(it.title));
  const t = l ? `<a class="t" href="lessons/${l.slug}.html">${esc(it.title)}</a>` : `<span class="t">${esc(it.title)}</span>`;
  return `<li class="${it.done ? 'done' : 'todo'}"><span class="n">${n}</span>${t}<span class="s">${it.done ? (l ? `Day ${l.day}` : '已学') : ''}</span></li>`;
}).join('')}</ol></div>`).join('');

const indexBody = `<h1>${esc(SITE_TITLE)}</h1>
<p class="lede">${esc(SITE_TAGLINE)} 每天一个知识点，讲清楚、给类比、附来源，并说明它和 AI 数据业务的关系。</p>
<div class="progress"><span>${done} / ${total}</span><div class="bar"><span style="width:${total ? Math.round((done / total) * 100) : 0}%"></span></div><span>已完成</span></div>
<h2 id="log">学习日志</h2>
${newest.map((l, i) => card(l, i === 0)).join('\n') || '<p class="lede">还没有课程。</p>'}
<h2 id="roadmap">学习路线</h2>
${roadmap}`;
writeFileSync(join(out, 'index.html'), page({ title: SITE_TITLE, desc: SITE_TAGLINE, body: indexBody }));

writeFileSync(join(out, 'lessons.json'), JSON.stringify(newest.map(({ body, file, ...m }) => ({ ...m, url: `/lessons/${m.slug}.html` })), null, 2));
console.log(`Built ${lessons.length} lesson(s), ${done}/${total} curriculum topics done → public/`);
