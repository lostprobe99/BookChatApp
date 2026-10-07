#!/usr/bin/env bash
set -euo pipefail

cd /workspace
export NODE_OPTIONS="${NODE_OPTIONS:---openssl-legacy-provider}"

if [ ! -f config.js ]; then
  bash .cursor/install.sh
fi

mkdir -p /tmp/cursor

port_open() {
  bash -c "echo >/dev/tcp/127.0.0.1/$1" >/dev/null 2>&1
}

if [ -f .cursor/dev-api.js ]; then
  if ! port_open 8181; then
    tmux kill-session -t bookchat-api 2>/dev/null || true
    tmux new-session -d -s bookchat-api "cd /workspace && node .cursor/dev-api.js >> /tmp/cursor/bookchat-api.log 2>&1"
  fi
  for _ in $(seq 1 30); do
    if curl -sf http://127.0.0.1:8181/health >/dev/null; then
      break
    fi
    sleep 1
  done
  curl -sf http://127.0.0.1:8181/health >/dev/null
fi

if [ -f package.json ] && grep -q '"dev:h5"' package.json; then
  if ! port_open 8080; then
    tmux kill-session -t bookchat-h5 2>/dev/null || true
    tmux new-session -d -s bookchat-h5 "cd /workspace && npm run dev:h5 >> /tmp/cursor/bookchat-h5.log 2>&1"
  fi
  for _ in $(seq 1 90); do
    if curl -sf -o /dev/null http://127.0.0.1:8080/; then
      break
    fi
    sleep 2
  done
  curl -sf -o /dev/null http://127.0.0.1:8080/
fi
