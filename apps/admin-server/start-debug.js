#!/usr/bin/env node

console.log('🔍 Debug: 开始诊断 admin-server...');

// 检查 Node.js 版本
console.log('📌 Node.js 版本:', process.version);

// 检查当前目录
console.log('📂 当前工作目录:', process.cwd());

// 检查关键文件是否存在
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'react-router.config.ts',
  'app/root.tsx',
  'app/routes.ts',
];

console.log('\n📋 检查关键文件:');
for (const file of requiredFiles) {
  const fullPath = join(__dirname, file);
  const exists = existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
}

// 检查依赖
console.log('\n📦 检查依赖安装:');
try {
  const nodeModulesExists = existsSync(join(__dirname, 'node_modules'));
  console.log(`${nodeModulesExists ? '✅' : '❌'} node_modules 目录`);
  
  if (nodeModulesExists) {
    const reactRouterExists = existsSync(join(__dirname, 'node_modules', '@react-router'));
    console.log(`${reactRouterExists ? '✅' : '❌'} @react-router 包`);
  }
} catch (error) {
  console.log('❌ 依赖检查失败:', error.message);
}

console.log('\n🚀 尝试启动开发服务器...');

try {
  // 动态导入 React Router 开发命令
  const { spawn } = await import('child_process');
  
  const child = spawn('npx', ['react-router', 'dev'], {
    stdio: 'inherit',
    cwd: __dirname,
  });
  
  child.on('error', (error) => {
    console.log('\n❌ 启动失败:', error.message);
    
    if (error.code === 'ENOENT') {
      console.log('\n💡 建议解决步骤:');
      console.log('1. 确保安装了 Node.js (建议 v18+)');
      console.log('2. 运行: pnpm install (在项目根目录)');
      console.log('3. 运行: cd apps/admin-server && pnpm install');
      console.log('4. 再次尝试运行');
    }
  });
  
  child.on('exit', (code) => {
    if (code !== 0) {
      console.log(`\n❌ 进程退出，退出码: ${code}`);
    }
  });
  
} catch (error) {
  console.log('\n❌ 无法启动开发服务器:', error.message);
  console.log('\n💡 请手动运行以下命令进行诊断:');
  console.log('1. cd apps/admin-server');
  console.log('2. pnpm install');
  console.log('3. pnpm dev');
}
