#!/usr/bin/env node
// DoYouDj Project Health Check

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const healthChecks = {
  files: {
    name: 'Required Files',
    checks: [
      { file: '.env.example', status: false },
      { file: 'package.json', status: false },
      { file: 'tsconfig.json', status: false },
      { file: 'tailwind.config.ts', status: false },
      { file: 'next.config.js', status: false },
      { file: '.prettierrc', status: false },
      { file: 'docs/AGENT_TASKS.md', status: false },
    ],
  },
  structure: {
    name: 'Project Structure',
    checks: [
      { dir: 'src/app', status: false },
      { dir: 'src/components', status: false },
      { dir: 'src/lib', status: false },
      { dir: 'docs', status: false },
      { dir: 'scripts', status: false },
    ],
  },
  dependencies: {
    name: 'Critical Dependencies',
    checks: [
      { dep: 'next', status: false },
      { dep: 'react', status: false },
      { dep: 'typescript', status: false },
      { dep: '@clerk/nextjs', status: false },
      { dep: 'mongodb', status: false },
      { dep: 'gsap', status: false },
    ],
  },
};

function checkFiles() {
  healthChecks.files.checks.forEach(check => {
    check.status = fs.existsSync(check.file);
  });
}

function checkStructure() {
  healthChecks.structure.checks.forEach(check => {
    check.status =
      fs.existsSync(check.dir) && fs.statSync(check.dir).isDirectory();
  });
}

function checkDependencies() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    healthChecks.dependencies.checks.forEach(check => {
      check.status = allDeps[check.dep] !== undefined;
    });
  } catch (error) {
    console.error('❌ Error reading package.json');
  }
}

function generateHealthReport() {
  console.log('🏥 DoYouDj Project Health Check');
  console.log('================================\n');

  Object.entries(healthChecks).forEach(([category, data]) => {
    console.log(`📂 ${data.name}:`);

    data.checks.forEach(check => {
      const item = check.file || check.dir || check.dep;
      const status = check.status ? '✅' : '❌';
      console.log(`  ${status} ${item}`);
    });

    const passed = data.checks.filter(c => c.status).length;
    const total = data.checks.length;
    console.log(`  Score: ${passed}/${total}\n`);
  });

  // Overall score
  const totalPassed = Object.values(healthChecks).reduce(
    (sum, category) => sum + category.checks.filter(c => c.status).length,
    0
  );
  const totalChecks = Object.values(healthChecks).reduce(
    (sum, category) => sum + category.checks.length,
    0
  );

  console.log(
    `📊 Overall Health Score: ${totalPassed}/${totalChecks} (${Math.round((totalPassed / totalChecks) * 100)}%)`
  );

  if (totalPassed === totalChecks) {
    console.log('🎉 Project is in excellent health!');
  } else if (totalPassed / totalChecks > 0.8) {
    console.log('👍 Project is in good health with minor issues');
  } else {
    console.log('⚠️  Project needs attention');
  }

  console.log('\n================================');
}

// Run all checks
checkFiles();
checkStructure();
checkDependencies();
generateHealthReport();
