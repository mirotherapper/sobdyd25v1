#!/usr/bin/env node
// Simplified DoYouDj Task Executor

const { execSync } = require('child_process');
const fs = require('fs');

const TASKS = {
  'Fix Imports': {
    script: 'pnpm format',
    description: 'Format all JavaScript and TypeScript files',
  },
  'TypeScript Check': {
    script: 'pnpm type-check',
    description: 'Run TypeScript checks',
  },
  'Run Build': {
    script: 'pnpm build',
    description:
      'Build the project to ensure all dependencies and types are resolved',
  },
  'Generate Task Report': {
    script: 'node scripts/task-status-report.js',
    description: 'Create a task status report from docs/AGENT_TASKS.md',
  },
};

console.log('🔄 Starting Task Execution...');
for (const [taskName, task] of Object.entries(TASKS)) {
  try {
    console.log(`
▶️  Executing: ${taskName}
${task.description}`);
    execSync(task.script, { stdio: 'inherit' });
    console.log(`✅ ${taskName} completed successfully.`);
  } catch (error) {
    console.error(`❌ ${taskName} failed. Error: ${error.message}`);
  }
}
console.log(
  '🎉 All tasks executed. Check above for any failures for manual intervention if needed.'
);
