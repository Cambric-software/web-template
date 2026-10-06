#!/usr/bin/env bash
# Cambric Web Template — secret scanner (Linux/macOS)
# Usage: bash security/secret-scan.sh [root_dir]
#
# Complements security/secret-scan.ps1 for Windows.
# Scans JavaScript, JSON, and HTML files for patterns that suggest
# hardcoded credentials or private key material.

set -euo pipefail

ROOT="${1:-.}"
FAILED=0

echo "Scanning $ROOT for secrets..."

# Private key material
if grep -rInE \
    --exclude-dir=".git" \
    --exclude-dir="node_modules" \
    --exclude="*.md" \
    'BEGIN (RSA|OPENSSH|EC|DSA) PRIVATE KEY' "$ROOT"; then
    echo "FAIL: Private key material detected."
    FAILED=1
fi

# OpenAI / common API key patterns
if grep -rInE \
    --exclude-dir=".git" \
    --exclude-dir="node_modules" \
    --exclude="*.md" \
    'sk-[A-Za-z0-9]{20,}' "$ROOT"; then
    echo "FAIL: Potential API key detected."
    FAILED=1
fi

# Generic hardcoded secret patterns in source files
if grep -rInE \
    --exclude-dir=".git" \
    --exclude-dir="node_modules" \
    --include="*.js" \
    --include="*.json" \
    'SECRET[[:space:]]*=[[:space:]]*["'"'"']|PASSWORD[[:space:]]*=[[:space:]]*["'"'"']|API_KEY[[:space:]]*=[[:space:]]*["'"'"']' \
    "$ROOT"; then
    echo "FAIL: Potential hardcoded secret in source file."
    FAILED=1
fi

# .env files
if find "$ROOT" -name ".env" -not -path "*/.git/*" -not -path "*/node_modules/*" | grep -q .; then
    echo "FAIL: .env file found in repository."
    FAILED=1
fi

if [ "$FAILED" -eq 0 ]; then
    echo "OK: No secrets detected."
fi

exit "$FAILED"
