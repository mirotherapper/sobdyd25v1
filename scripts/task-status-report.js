#!/usr/bin/env node
// Task Status Report Generator

const fs = require('fs');
const path = require('path');

const tasksFilePath = path.join(__dirname, '../docs/AGENT_TASKS.md');

function parseTasks(fileContent) {
  const tasksRegex = /## Task (.*?)\n(.*?)Priority: (.*?)\n/gm;
  const taskBlocks = [...fileContent.matchAll(tasksRegex)];

  return taskBlocks.map(block => ({
    id: block[1].trim(),
    details: block[2].trim(),
    priority: block[3].trim(),
  }));
}

function generateReport(tasks) {
  const reportLines = [];
  reportLines.push('================================================');
  reportLines.push('\n📋 DoYouDj Task Status Report:\n');

  tasks
    .sort((a, b) => a.priority.localeCompare(b.priority))
    .forEach((task, index) => {
      reportLines.push(`🚀 Task ${index + 1}: ${task.id}`);
      reportLines.push(`Priority: ${task.priority}`);
      reportLines.push(`Details: ${task.details}\n`);
    });

  reportLines.push('================================================');

  fs.writeFileSync(
    path.join(__dirname, '../docs/TASK_STATUS_REPORT.md'),
    reportLines.join('\n'),
    'utf8'
  );
  console.log(reportLines.join('\n'));
}

// Read and parse task document
if (fs.existsSync(tasksFilePath)) {
  const fileContent = fs.readFileSync(tasksFilePath, 'utf8');
  const tasks = parseTasks(fileContent);
  generateReport(tasks);
} else {
  console.error('❌ Task file not found.');
}
