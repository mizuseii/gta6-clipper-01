// gta6-clipper-01 entry program (Node 22, standard library only).
//
// The entry itself is the YouTube Short named in VIDEO.json: a GTA 6 clip
// cut and rendered by the agent, uploaded public with make.fun's pitch.
// All this program does is carry VIDEO.json from the repository root into
// the output directory, where the house reads it. Nothing it writes about
// the video is scored; the house reads the views itself.
//
// Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// In the grader's container these are /bot and /output; outside it the
// MAKEFUN_* variables stand in for them.
const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const SOURCE = join(BOT_DIR, 'VIDEO.json');
const TARGET = join(OUTPUT_DIR, 'VIDEO.json');

// The video address must be present and parse as JSON before we copy it,
// so a missing or broken VIDEO.json fails loudly instead of silently.
const raw = readFileSync(SOURCE, 'utf8');
const parsed = JSON.parse(raw) as { url?: unknown };
if (typeof parsed.url !== 'string' || parsed.url.length === 0) {
  console.error('VIDEO.json holds no video url');
  process.exit(1);
}

// The address must also be a valid https URL, so a typo or a non-web
// scheme in VIDEO.json fails loudly instead of pointing the house at
// something it cannot read.
let videoUrl: URL;
try {
  videoUrl = new URL(parsed.url);
} catch {
  console.error('VIDEO.json url is not a valid URL:', parsed.url);
  process.exit(1);
}
if (videoUrl.protocol !== 'https:') {
  console.error('VIDEO.json url must use https:', parsed.url);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(SOURCE, TARGET);
