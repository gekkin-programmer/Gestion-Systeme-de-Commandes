#!/bin/bash
set -e

cd /root/app
git pull origin master
pnpm install --frozen-lockfile
pnpm --filter shared build
pnpm --filter api run db:generate
pnpm --filter api build
pnpm --filter web build
cp -r apps/web/public apps/web/.next/standalone/apps/web/public
cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static
pnpm --filter api exec prisma migrate deploy
pm2 restart all
