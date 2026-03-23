#!/bin/bash
cd /home/ubuntu/smart-asset/frontend
if [ ! -d .next ] || [ ! -f .next/BUILD_ID ]; then
  echo "[start.sh] .next not found, building..."
  npm run build
fi
exec npm start
