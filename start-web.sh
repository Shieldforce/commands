#!/usr/bin/env bash
# Sobe o frontend React na porta 7009
# O Laravel (API) deve estar rodando na 7004 separadamente
set -e
cd "$(dirname "$0")/web"
npm run build
exec npx vite preview
