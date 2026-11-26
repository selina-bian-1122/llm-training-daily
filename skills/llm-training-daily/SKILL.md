---
name: llm-training-daily
description: Teach one bite-sized LLM training concept per day (SFT, RL, RLHF, DPO, post-training, reward models, agents, embodied AI data) as a researched, sourced lesson, following a curriculum and keeping a dated log. Use when someone asks for today's lesson, a daily LLM-training lesson, to continue their training curriculum, or to explain an SFT/RL/post-training concept in this lesson format.
---

# LLM Training Daily

Write one short, accurate, sourced lesson on an LLM-training concept, pick the topic from a curriculum, and log it, so a non-researcher builds real understanding a little every day.

## Files this skill uses

Look for these at the root of the working repo (the folder holding `curriculum.md`). If there is no such repo, skip the file steps and give the lesson in chat.

| File | What it is |
| --- | --- |
| `curriculum.md` | Ordered checklist of topics, grouped by `## stage` headings. `- [x]` = done. |
| `learner.md` | Optional. Who is learning: role, industry, language, what they need the knowledge for. |
| `lessons/day-NNN.md` | One file per lesson, with frontmatter. The folder is the log. |
| `lessons/index.json` | Lesson list a website reads. Regenerate it after adding a lesson. |
| `references/lesson-template.md` | The exact lesson format (in this skill's folder). |

## Steps

1. **Pick the topic.** If the user named a concept, teach that. Otherwise take the first unticked item in `curriculum.md`. If every item is ticked, add one new, more advanced topic at the end of the last stage, never repeating a topic already covered in `lessons/`.
2. **Set day and date.** Day = the highest `day` among `lessons/*.md`, plus 1. Date = today in the learner's time zone (`learner.md`), `YYYY-MM-DD`. If a lesson with today's date already exists, stop: one lesson per day.
3. **Research.** Open 2–4 credible pages: the original paper (arXiv), the lab's or company's own blog, or a well-known explainer. Use only facts you read on those pages: no invented numbers, dates or claims. Paraphrase; quote at most one short phrase per source.
4. **Write** the lesson exactly as in `references/lesson-template.md`, in the learner's language (from `learner.md`; otherwise the user's language), keeping English technical terms. Tailor "Why it matters" and the conversation line to the learner's role. Link back to earlier lessons where a concept builds on one ("see Day 3").
5. **Save** it as `lessons/day-NNN.md` (zero-padded: `day-007.md`).
6. **Tick** that one topic in `curriculum.md` (`- [ ]` → `- [x]`). Change nothing else.
7. **Index:** run `node scripts/build-index.mjs` if it exists; otherwise append the lesson's frontmatter (plus `"file": "day-NNN.md"`) to `lessons/index.json` by hand.
8. **Publish**, if the repo is under git: commit with the message `Day N: <title>` and push. A site that reads the repo updates on its own.
9. **Report** in 3–4 lines: Day N, the title, the one-line takeaway, and the site link if `learner.md` gives one.

## Quality bar

- Accurate first. When sources disagree or a point is contested, say so in one sentence.
- Plain words. 300–450 Chinese characters, or 200–300 English words, before terms and sources. Sentences under 25 words.
- One everyday analogy that maps onto the mechanism, not just the vibe.
- Concrete: name the real methods, models and papers (InstructGPT, DPO, DeepSeek-R1) when they are the canonical example.
- Never name the learner's employer, clients or private details in a lesson. Lessons may be published publicly.
