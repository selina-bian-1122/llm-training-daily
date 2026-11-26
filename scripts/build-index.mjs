// Regenerates lessons/index.json from the frontmatter of lessons/*.md.
// No dependencies. Run from the repo root: node scripts/build-index.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'lessons');
const lessons = readdirSync(dir)
  .filter((f) => /^day-\d+\.md$/.test(f))
  .map((file) => {
    const fm = readFileSync(join(dir, file), 'utf8').match(/^---\n([\s\S]*?)\n---/);
    if (!fm) throw new Error(`${file}: missing frontmatter`);
    const meta = { file };
    for (const line of fm[1].split('\n')) {
      const kv = line.match(/^(\w+):\s*(.*)$/);
      if (!kv) continue;
      let v = kv[2].trim();
      if (/^(".*"|'.*')$/.test(v)) v = v.slice(1, -1);
      meta[kv[1]] = kv[1] === 'day' ? Number(v) : v;
    }
    for (const k of ['day', 'date', 'title']) if (!meta[k]) throw new Error(`${file}: frontmatter needs "${k}"`);
    return meta;
  })
  .sort((a, b) => a.day - b.day);

writeFileSync(join(dir, 'index.json'), JSON.stringify(lessons, null, 2) + '\n');
console.log(`lessons/index.json: ${lessons.length} lesson(s)`);
