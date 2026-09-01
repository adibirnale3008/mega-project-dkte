const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, cwd = process.cwd()) {
  console.log(`\n[BUILD SCRIPT] Executing: "${cmd}" in ${cwd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

try {
  const rootDir = process.cwd();
  console.log(`[BUILD SCRIPT] Root Directory: ${rootDir}`);

  // Check where Vercel started
  const hasFrontendDir = fs.existsSync(path.join(rootDir, 'frontend'));
  const hasBackendDir = fs.existsSync(path.join(rootDir, 'backend'));

  if (hasFrontendDir && hasBackendDir) {
    console.log('[BUILD SCRIPT] Monorepo root detected.');
    run('npm install', path.join(rootDir, 'frontend'));
    run('npm run build', path.join(rootDir, 'frontend'));
    run('npm install', path.join(rootDir, 'backend'));
    run('npx prisma generate', path.join(rootDir, 'backend'));
  } else if (fs.existsSync(path.join(rootDir, 'package.json'))) {
    console.log('[BUILD SCRIPT] Subdirectory build detected.');
    run('npm install');
    if (fs.existsSync(path.join(rootDir, 'vite.config.js'))) {
      run('npm run build');
    } else if (fs.existsSync(path.join(rootDir, 'prisma'))) {
      run('npx prisma generate');
    }
  }

  console.log('\n✅ [BUILD SCRIPT] Build completed successfully!');
} catch (err) {
  console.error('\n🔴 [BUILD SCRIPT ERROR]:', err.message);
  process.exit(1);
}
