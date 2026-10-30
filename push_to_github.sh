#!/bin/bash
# ==============================================================================
# AICTE SIH Project - Automated Push Script to GitHub
# Target: https://github.com/balakrishnan2398e-spec/AICTE-sih-project-
# ==============================================================================

set -e

REPO_URL="https://github.com/balakrishnan2398e-spec/AICTE-sih-project-.git"

if [ -n "$1" ]; then
    TOKEN="$1"
    AUTH_REPO_URL="https://${TOKEN}@github.com/balakrishnan2398e-spec/AICTE-sih-project-.git"
    echo "🔑 Using provided GitHub Personal Access Token..."
    git remote set-url origin "$AUTH_REPO_URL"
    git branch -M main
    git push -u origin main
    # Reset remote URL to clean URL so token is not stored in git config
    git remote set-url origin "$REPO_URL"
    echo "✅ Successfully pushed entire codebase to ${REPO_URL}!"
    exit 0
fi

echo "================================================================="
echo "AICTE Integrated Grievance Portal - Push to GitHub"
echo "================================================================="
echo "To push to https://github.com/balakrishnan2398e-spec/AICTE-sih-project-:"
echo ""
echo "Method 1: Run with your GitHub Personal Access Token (PAT):"
echo "  ./push_to_github.sh <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>"
echo ""
echo "Method 2: Using standard Git credentials:"
echo "  git push -u origin main"
echo "================================================================="
