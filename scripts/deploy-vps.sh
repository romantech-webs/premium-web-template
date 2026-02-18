#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/premium-web"
cd "$APP_DIR"

echo "==> Pulling latest changes..."
git pull --ff-only

echo "==> Installing dependencies..."
npm ci --omit=dev

echo "==> Building Next.js standalone..."
npm run build

echo "==> Copying static assets to standalone..."
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

echo "==> Restarting PM2..."
pm2 reload ecosystem.config.cjs

echo "==> Done! Checking status..."
pm2 status
