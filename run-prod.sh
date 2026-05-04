#!/usr/bin/env bash
# Run Taka Bachai locally against the Supabase Postgres database.
# Reads credentials from .env (gitignored).

set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f .env ]]; then
  echo "ERROR: .env file not found. Copy .env.example to .env and fill in your Supabase credentials." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

exec ./mvnw spring-boot:run
