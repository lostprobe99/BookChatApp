#!/usr/bin/env bash
set -euo pipefail

cd /workspace

if [ -f package-lock.json ]; then
  npm ci
elif [ -f package.json ]; then
  npm install
else
  echo "No Node.js manifest on this revision; skipping dependency install."
fi

if [ ! -f config.js ]; then
  node <<'NODE'
const fs = require('fs')
const source = fs.readFileSync('config.example.js', 'utf8')
const hostLine = "let host = 'http://127.0.0.1:8181/bookchat'"
const next = source.replace(/^\s*\/\/\s*let host = .+$/m, hostLine)
if (!next.includes(hostLine) || next.includes('// let host')) {
  throw new Error('Could not set the API host in config.js')
}
fs.writeFileSync('config.js', next)
NODE
  echo "Wrote config.js"
fi
