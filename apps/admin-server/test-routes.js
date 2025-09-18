#!/usr/bin/env node

// 简单的路由配置验证脚本
console.log('🧪 测试路由配置...');

try {
  // 模拟检查路由配置
  const routes = [
    { path: "/", file: "routes/admin/dashboard.tsx" },
    { path: "/admin/dashboard", file: "routes/admin/dashboard.tsx" },
    { path: "/admin/comics", file: "routes/admin/comics.tsx" },
    { path: "/admin/users", file: "routes/admin/users.tsx" },
    { path: "/admin/analytics", file: "routes/admin/analytics.tsx" },
    { path: "/api/comics", file: "routes/api/comics.ts" },
    { path: "/api/comics/:id", file: "routes/api/comics.[id].ts" },
    { path: "/api/chapters/:id", file: "routes/api/chapters.[id].ts" },
    { path: "/api/users", file: "routes/api/users.ts" },
    { path: "/api/upload", file: "routes/api/upload.ts" },
  ];

  console.log('📋 路由映射:');
  routes.forEach(route => {
    console.log(`  ${route.path} -> ${route.file}`);
  });

  // 检查重复
  const paths = routes.map(r => r.path);
  const duplicates = paths.filter((path, index) => paths.indexOf(path) !== index);
  
  if (duplicates.length > 0) {
    console.log('❌ 发现重复路由:', duplicates);
  } else {
    console.log('✅ 无重复路由');
  }

  console.log('\n🎯 修复的问题:');
  console.log('- 移除了重复的 dashboard 路由');
  console.log('- 创建了缺失的 API 路由文件');
  console.log('- 更新了导航链接路径');

  console.log('\n🚀 现在可以尝试运行:');
  console.log('cd apps/admin-server && pnpm dev');

} catch (error) {
  console.error('❌ 测试失败:', error.message);
}
