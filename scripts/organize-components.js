#!/usr/bin/env node
/**
 * Script to help reorganize components according to DoYouDj structure
 * Run with: node scripts/organize-components.js
 */

const fs = require('fs');
const path = require('path');

const componentMappings = {
  // Admin components
  'src/app/admin/AdminHUD.tsx': 'src/components/admin/AdminHUD.tsx',
  'src/app/admin/HudButton.tsx': 'src/components/admin/HudButton.tsx',
  'src/app/admin/UpcomingQueue.tsx': 'src/components/admin/UpcomingQueue.tsx',
  'src/app/admin/SubmissionsPanel.tsx':
    'src/components/admin/SubmissionsPanel.tsx',
  'src/app/admin/NowPlayingCard.tsx': 'src/components/admin/NowPlayingCard.tsx',

  // Submit components
  'src/app/submit/promotional-banner.tsx':
    'src/components/submit/PromotionalBanner.tsx',
};

function moveComponent(oldPath, newPath) {
  if (fs.existsSync(oldPath)) {
    // Create directory if it doesn't exist
    const dir = path.dirname(newPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Move file
    fs.renameSync(oldPath, newPath);
    console.log(`✅ Moved: ${oldPath} → ${newPath}`);
  } else {
    console.log(`⚠️  File not found: ${oldPath}`);
  }
}

console.log('🔄 Reorganizing components for DoYouDj structure...\n');

Object.entries(componentMappings).forEach(([oldPath, newPath]) => {
  moveComponent(oldPath, newPath);
});

console.log('\n✨ Component reorganization complete!');
console.log('\n📝 Remember to update import paths in your files.');
