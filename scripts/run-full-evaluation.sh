#!/usr/bin/env bash
# Run the full evaluation pipeline end-to-end:
#   1. stochastic-variance benchmark   (3 runs × 12 questions × 3 models = 108 calls, ~20 min)
#   2. citation-verification post-process (queries Crossref for every REF)
#   3. chart regeneration               (3 SVGs)
# Writes:
#   public/docs/data/benchmark-variance.json
#   public/docs/charts/{adherence,latency,confidence}.svg
#
# Prereqs:
#   - the akasha server is running on localhost:3000 (npm run dev)
#   - ollama is up with gemma3:4b pulled
#   - .env has CF_ACCOUNT_ID + CF_API_TOKEN
#
# Usage:
#   chmod +x scripts/run-full-evaluation.sh
#   ./scripts/run-full-evaluation.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "▌ stage 1/3 · stochastic-variance benchmark (∼20 min)"
node scripts/benchmark3-variance.mjs

echo "▌ stage 2/3 · citation verification (Crossref)"
node scripts/postprocess-cite-rates.mjs

echo "▌ stage 3/3 · chart regeneration"
# charts2.mjs reads benchmark.json by default; symlink benchmark-variance.json onto it
# for the chart pass, then restore.
if [ -f public/docs/data/benchmark.json ]; then
  mv public/docs/data/benchmark.json public/docs/data/benchmark.single-run.json.bak
fi
cp public/docs/data/benchmark-variance.json public/docs/data/benchmark.json
node scripts/charts2.mjs
# restore
if [ -f public/docs/data/benchmark.single-run.json.bak ]; then
  mv public/docs/data/benchmark.single-run.json.bak public/docs/data/benchmark.json
fi

echo "✓ full evaluation complete · data at public/docs/data/benchmark-variance.json"
