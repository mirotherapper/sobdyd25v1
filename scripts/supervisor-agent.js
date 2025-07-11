#!/usr/bin/env node
// DoYouDj Supervisor Agent - Automatically assigns and executes tasks

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TASK_QUEUE = [
  {
    id: '1.1',
    name: 'Update Import Paths',
    priority: 1,
    autoExecute: true,
    command: 'node scripts/fix-imports.js',
    estimated: '5 minutes',
  },
  {
    id: '1.2',
    name: 'Fix TypeScript Errors',
    priority: 1,
    autoExecute: true,
    command: 'node scripts/fix-typescript.js',
    estimated: '10 minutes',
  },
  {
    id: '2.1',
    name: 'Clean Code Format',
    priority: 2,
    autoExecute: true,
    command: 'pnpm format',
    estimated: '2 minutes',
  },
  {
    id: '3.1',
    name: 'Build Test',
    priority: 3,
    autoExecute: true,
    command: 'pnpm build',
    estimated: '3 minutes',
  },
];

class SupervisorAgent {
  constructor() {
    this.completedTasks = [];
    this.failedTasks = [];
  }

  async executeTask(task) {
    console.log(`🤖 Executing: ${task.name} (${task.estimated})`);

    try {
      const result = execSync(task.command, {
        encoding: 'utf8',
        timeout: 300000, // 5 minute timeout
        stdio: 'pipe',
      });

      this.completedTasks.push(task);
      console.log(`✅ Completed: ${task.name}`);
      return true;
    } catch (error) {
      this.failedTasks.push({ ...task, error: error.message });
      console.log(
        `❌ Failed: ${task.name} - ${error.message.slice(0, 100)}...`
      );
      return false;
    }
  }

  async runAutomation() {
    console.log('🎯 DoYouDj Supervisor Agent Starting...');
    console.log('=====================================');

    // Sort by priority
    const sortedTasks = TASK_QUEUE.filter(task => task.autoExecute).sort(
      (a, b) => a.priority - b.priority
    );

    for (const task of sortedTasks) {
      // Check if task script exists
      if (task.command.includes('scripts/')) {
        const scriptPath = task.command.split(' ')[1];
        if (!fs.existsSync(scriptPath)) {
          console.log(`⚠️  Skipping ${task.name} - script not found`);
          continue;
        }
      }

      await this.executeTask(task);
    }

    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 SUPERVISOR AGENT REPORT:');
    console.log('============================');
    console.log(`✅ Completed: ${this.completedTasks.length} tasks`);
    console.log(`❌ Failed: ${this.failedTasks.length} tasks`);

    if (this.failedTasks.length > 0) {
      console.log('\n🔧 Manual intervention needed for:');
      this.failedTasks.forEach(task => {
        console.log(`   - ${task.name}`);
      });
    }

    console.log('\n🎉 Automation complete!');
  }
}

// Auto-execute if run directly
if (require.main === module) {
  const supervisor = new SupervisorAgent();
  supervisor.runAutomation();
}
