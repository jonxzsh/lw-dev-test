#!/bin/sh
set -e

until pg_isready -h db -U lwdevtest; do
  echo "Waiting for Postgres..."
  sleep 2
done

if [ ! -f /app/.db_migrated ]; then
  echo "Running database migrations..."
  npm run db:push
  touch /app/.db_migrated
fi

npm run start