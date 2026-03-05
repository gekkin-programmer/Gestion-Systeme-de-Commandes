#!/bin/bash
set -e

cd /root/app
git pull origin master
pnpm install --frozen-lockfile
pnpm --filter shared build
pnpm --filter api build
pnpm --filter web build
pnpm --filter api exec prisma migrate deploy
pm2 restart all
