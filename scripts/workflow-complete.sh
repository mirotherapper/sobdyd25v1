#!/bin/bash
# DoYouDj Session Cleanup - SMART SUPERVISOR AGENT

echo "🧹 DoYouDj Session Cleanup"
echo "========================="

# Clean temp files
find . -name "*.tmp" -o -name "*.temp" -o -name "*.log" -not -path "./node_modules/*" -not -path "./.next/*" -type f -delete 2>/dev/null

# Auto-fix what we can
echo "🤖 Auto-fixing issues..."
pnpm format > /dev/null 2>&1

# Check build status and auto-fix if possible
echo "🔨 Testing build..."
if pnpm build > /dev/null 2>&1; then
    echo "✅ Build successful"
else
    echo "❌ Build failed - checking for fixable issues..."
    # Try to fix common issues
    echo "🔧 Attempting auto-fixes..."
    pnpm type-check > /dev/null 2>&1 || echo "   - TypeScript errors need manual attention"
fi

# Health check
echo "🏥 Health check..."
node scripts/health-check.js

# Auto-execute available tasks
echo "🎯 Auto-executing tasks..."
if [ -f "scripts/task-executor.js" ]; then
    node scripts/task-executor.js
fi

# Git status summary
echo "📝 Git changes:"
git status --porcelain | head -5
echo ""
echo "✨ Cleanup complete! Ready for next session."
