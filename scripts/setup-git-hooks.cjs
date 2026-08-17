/**
 * Cross-platform Git Hook Setup Script for Richy Rich Workspace
 * Automatically provisions .git/hooks/post-merge to keep client and server
 * dependencies synchronized upon pulling changes from remote branches.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const gitDir = path.join(repoRoot, '.git');
const hooksDir = path.join(gitDir, 'hooks');
const postMergeFile = path.join(hooksDir, 'post-merge');

if (!fs.existsSync(gitDir)) {
  console.log('[Git Hooks] Not a git repository root. Skipping hook setup.');
  process.exit(0);
}

if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

const postMergeScript = `#!/bin/sh
# Richy Rich Automated Dependency Synchronization Hook
# Triggered automatically after git pull or git merge

echo ""
echo "🔄 [Git Hook] Analyzing pulled changes for dependency updates..."

# 1. Check Server Dependencies
if git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD | grep -E 'server/package(-lock)?\\.json' > /dev/null 2>&1; then
  echo "📦 [Git Hook] Detected changes in server/package.json! Running npm install in server..."
  (cd server && npm install)
  echo "✅ [Git Hook] Server dependencies synchronized successfully."
fi

# 2. Check Client Dependencies
if git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD | grep -E 'client/package(-lock)?\\.json' > /dev/null 2>&1; then
  echo "📦 [Git Hook] Detected changes in client/package.json! Running npm install in client..."
  (cd client && npm install)
  echo "✅ [Git Hook] Client dependencies synchronized successfully."
fi

echo "🚀 [Git Hook] Post-merge check complete."
echo ""
`;

try {
  fs.writeFileSync(postMergeFile, postMergeScript, { mode: 0o755 });
  console.log('✅ [Git Hooks] Automated post-merge hook installed successfully in .git/hooks/post-merge');
} catch (error) {
  console.error('⚠️ [Git Hooks] Failed to write post-merge hook:', error.message);
}
