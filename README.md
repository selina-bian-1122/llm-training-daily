# LLM Training Daily · 每日一课

**One LLM training concept a day:** SFT, RL, RLHF, DPO, reward models, reasoning, agents and embodied AI data. Each lesson is researched from primary sources, written by an AI agent, and published to a website automatically.

每天一个大模型训练知识点：讲清楚、给类比、附来源，并说明它和 AI 数据业务的关系。

**Live site:** https://llm-training-daily.vercel.app

---

## What's in this repo

| Path | What it is |
| --- | --- |
| `skills/llm-training-daily/` | The **Agent Skill**: drop it into your agent and it writes a lesson a day |
| `curriculum.md` | Ordered topic list (30 to start); the next lesson takes the first unticked item |
| `learner.md` | Who is learning: role, language, time zone. Lessons are tailored to it |
| `lessons/` | One markdown file per day: the learning log |
| `scripts/build.mjs` | Turns the lessons and the curriculum into a static site in `public/` |

## Use the skill in your own agent

The skill is a plain folder with a `SKILL.md`, in the open Agent Skills format.

- **Claude Code:** copy `skills/llm-training-daily` into `~/.claude/skills/` (all projects) or `.claude/skills/` (one project), then ask: *"today's LLM training lesson"*.
- **Claude apps:** zip the `llm-training-daily` folder and upload it as a custom skill.
- **Other agents** that read `SKILL.md` skills: add the folder the way that agent installs skills.
- **Any other LLM:** paste `SKILL.md` and `references/lesson-template.md` in as instructions.

With no repo around, the skill simply teaches the lesson in chat.

## Run your own daily lesson site

1. **Fork** this repo.
2. Rewrite **`learner.md`** for yourself (language, role, time zone). Edit **`curriculum.md`**, and delete `lessons/*` if you want to start at Day 1.
3. **Deploy:** import the repo in [Vercel](https://vercel.com/new). `vercel.json` already sets the build (`npm run build`, output `public/`).
4. **Schedule** your agent to run once a day in the repo: *"Use the llm-training-daily skill to write today's lesson, then commit and push."* Each push redeploys the site.

Build locally:

```bash
npm install
npm run build   # → public/index.html
```

## Lesson format

Every lesson has the same seven parts: **TL;DR · The idea · Analogy · Why it matters · Say it like a pro · Terms · Sources**. See [`references/lesson-template.md`](skills/llm-training-daily/references/lesson-template.md).

## License

Code: MIT ([LICENSE](LICENSE)). Lesson content in `lessons/`: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
