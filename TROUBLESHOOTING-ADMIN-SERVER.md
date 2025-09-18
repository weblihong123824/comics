# 🔧 Admin Server 故障排除指南

## 📋 常见问题及解决方案

### 1. 依赖安装问题

**症状**: `pnpm dev` 报错，提示模块未找到

**解决步骤**:
```bash
# 在项目根目录
pnpm install

# 进入 admin-server 目录
cd apps/admin-server
pnpm install

# 构建共享类型包
cd ../../packages/shared-types
pnpm build
```

### 2. TypeScript 类型错误

**症状**: 类型检查失败，找不到模块

**解决步骤**:
```bash
# 在 admin-server 目录
pnpm typecheck

# 如果有错误，检查 tsconfig.json 配置
# 确保 paths 映射正确
```

### 3. React Router v7 配置问题

**症状**: 路由加载失败，SSR 错误

**解决步骤**:
```bash
# 生成路由类型
pnpm react-router typegen

# 检查 react-router.config.ts 语法
# 确保所有路由文件存在
```

### 4. Tailwind CSS 样式问题

**症状**: 样式不加载，CSS 导入错误

**解决步骤**:
- 检查 `app/app.css` 中的导入语法
- 确保使用 Tailwind v4 语法:
  ```css
  @import "tailwindcss/preflight";
  @import "tailwindcss/utilities";
  ```

### 5. 数据库配置问题

**症状**: Drizzle ORM 连接失败

**解决步骤**:
```bash
# 生成数据库迁移
pnpm db:generate

# 检查 drizzle.config.ts 配置
# 确保 schema 路径正确
```

## 🚀 完整启动流程

### 步骤 1: 环境检查
```bash
node --version  # 应该是 v18+ 
pnpm --version  # 应该安装了 pnpm
```

### 步骤 2: 安装依赖
```bash
# 根目录
pnpm install

# 构建共享包
cd packages/shared-types
pnpm build

cd ../ui-components  
pnpm build
```

### 步骤 3: 启动开发服务器
```bash
cd apps/admin-server
pnpm dev
```

## 🐛 调试命令

### 检查路由配置
```bash
pnpm react-router routes
```

### 检查 TypeScript
```bash
pnpm typecheck
```

### 查看详细错误
```bash
pnpm dev --verbose
```

## 📁 关键文件检查清单

- [ ] `package.json` - 依赖配置
- [ ] `tsconfig.json` - TypeScript 配置  
- [ ] `vite.config.ts` - Vite 配置
- [ ] `react-router.config.ts` - 路由配置
- [ ] `tailwind.config.js` - 样式配置
- [ ] `app/root.tsx` - 应用根组件
- [ ] `app/routes.ts` - 路由定义
- [ ] `app/app.css` - 样式文件

## 🆘 最后的排查步骤

如果上述步骤都失败了:

1. **删除缓存**:
   ```bash
   rm -rf node_modules
   rm -rf .next
   rm -rf dist
   rm -rf build
   pnpm install
   ```

2. **检查端口占用**:
   ```bash
   lsof -i :5173  # 检查默认 Vite 端口
   ```

3. **使用替代启动方式**:
   ```bash
   npx vite dev
   # 或
   npx react-router dev
   ```

4. **查看完整错误日志**:
   ```bash
   pnpm dev 2>&1 | tee debug.log
   ```

## 💡 常见错误信息对照

| 错误信息 | 可能原因 | 解决方案 |
|---------|---------|----------|
| `Cannot find module '@fun-box/shared-types'` | 工作空间包未构建 | `cd packages/shared-types && pnpm build` |
| `Cannot find module 'react-router'` | 依赖未安装 | `pnpm install` |
| `TypeError: Cannot read properties of undefined` | 配置文件错误 | 检查配置文件语法 |
| `Port 5173 is already in use` | 端口占用 | 杀死进程或换端口 |
| `Failed to resolve import` | 路径配置错误 | 检查 `tsconfig.json` paths |

## 📞 如果仍然无法解决

请提供以下信息:
1. 完整的错误消息
2. Node.js 版本 (`node --version`)
3. pnpm 版本 (`pnpm --version`)
4. 操作系统信息
5. 运行的具体命令
