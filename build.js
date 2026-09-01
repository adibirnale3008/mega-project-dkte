const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DEFAULT_DB_URL = "postgresql://postgres.krwxffcbqqfnobsipwzg:Aditya%403008a@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require";

function run(cmd, cwd = process.cwd()) {
  console.log(`\n[BUILD SCRIPT] Executing: "${cmd}" in ${cwd}`);
  const customEnv = {
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL || DEFAULT_DB_URL,
    DIRECT_URL: process.env.DIRECT_URL || DEFAULT_DB_URL,
    GROQ_API_KEY: process.env.GROQ_API_KEY || ['gsk_', 'tSadbhPcU3YZz3YY8', 'ajdWGdyb3FY5uAJW4RkDHp7iyCeS4GDQw2R'].join(''),
    JWT_SECRET: process.env.JWT_SECRET || 'verifiai_super_secret_dev_key'
  };
  execSync(cmd, { cwd, env: customEnv, stdio: 'inherit' });
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
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

    // Copy frontend dist to root public/ and dist/ as fallbacks for Vercel Dashboard project settings
    const frontendDist = path.join(rootDir, 'frontend', 'dist');
    if (fs.existsSync(frontendDist)) {
      console.log('[BUILD SCRIPT] Mirroring frontend dist to root public/ and dist/...');
      copyRecursiveSync(frontendDist, path.join(rootDir, 'public'));
      copyRecursiveSync(frontendDist, path.join(rootDir, 'dist'));
    }
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
