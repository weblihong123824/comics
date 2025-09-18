# Fun Box - 新架构文档

## 🏗️ 项目架构

基于您的需求，我们采用了**2+1混合架构**方案：

### 📱 客户移动端 (apps/mobile-client)
- **技术栈**: React 19 + Vite + PWA
- **部署**: Cloudflare Pages (静态托管)
- **特性**: 移动端优化、离线支持、推送通知
- **功能**: 文件浏览、上传、预览、个人中心

### 🔧 后台管理端+服务端 (apps/admin-server)  
- **技术栈**: React Router 7 + SSR + Cloudflare Functions
- **部署**: Cloudflare Pages + Functions (Serverless)
- **特性**: 服务端渲染、API集成、权限管理
- **功能**: 用户管理、文件管理、数据分析、系统设置

### 📦 共享包 (packages/)
- **shared-types**: TypeScript类型定义
- **ui-components**: 通用UI组件库
- **utils**: 工具函数库

## 🚀 开发指南

### 环境要求
- Node.js 20+
- pnpm 8+

### 安装依赖
```bash
pnpm install
```

### 开发命令
```bash
# 启动所有应用
pnpm dev

# 单独启动移动端
pnpm dev:mobile

# 单独启动管理端
pnpm dev:admin

# 构建所有应用
pnpm build

# 类型检查
pnpm typecheck
```

### 访问地址
- 移动端: http://localhost:5173
- 管理端: http://localhost:5174

## 📁 目录结构

```
fun-box/
├── packages/                    # 共享包
│   ├── shared-types/           # 共享TypeScript类型
│   ├── ui-components/          # 共享UI组件
│   └── utils/                  # 共享工具函数
│
├── apps/
│   ├── mobile-client/          # 客户移动端应用
│   │   ├── src/
│   │   │   ├── pages/          # 页面组件
│   │   │   ├── components/     # 移动端组件
│   │   │   └── services/       # API服务
│   │   ├── public/
│   │   └── wrangler.toml       # Cloudflare配置
│   │
│   └── admin-server/           # 后台+服务端
│       ├── app/
│       │   ├── routes/
│       │   │   ├── admin/      # 后台管理路由
│       │   │   └── api/        # API路由
│       │   ├── components/
│       │   │   └── admin/      # 后台专用组件
│       │   └── services/       # 后端服务
│       └── wrangler.toml       # Cloudflare配置
│
├── .github/workflows/          # CI/CD配置
├── wrangler.toml              # 主Cloudflare配置
├── turbo.json                 # Monorepo配置
└── pnpm-workspace.yaml        # 工作空间配置
```

## 🌐 部署到Cloudflare

### 先决条件
1. 创建Cloudflare账户
2. 安装Wrangler CLI: `npm install -g wrangler`
3. 登录: `wrangler login`

### 手动部署

#### 移动端
```bash
cd apps/mobile-client
pnpm build
wrangler pages publish dist --project-name=fun-box-mobile
```

#### 管理端
```bash
cd apps/admin-server  
pnpm build
wrangler pages publish build/client --project-name=fun-box-admin
```

### 自动部署 (GitHub Actions)
1. 在GitHub仓库设置中添加Secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

2. 推送到main分支触发自动部署

## 🛡️ 环境配置

### 环境变量
在Cloudflare Pages设置中配置：

**移动端**:
- `VITE_API_URL`: 管理端API地址

**管理端**:
- `NODE_ENV`: 环境标识
- `DATABASE_URL`: 数据库连接
- `JWT_SECRET`: JWT密钥

### Cloudflare服务
1. **D1数据库**: 用户数据、文件元数据
2. **R2存储**: 文件存储
3. **KV存储**: 缓存、会话
4. **Pages Functions**: API服务

## 🔄 迁移指南

### 从旧架构迁移
1. 现有代码已经迁移到新结构
2. 组件已提取到共享包
3. 保持原有功能不变

### 数据迁移
- 文件元数据迁移到D1数据库
- 文件内容迁移到R2存储
- 用户数据结构保持兼容

## 🎯 优势对比

| 特性 | 旧架构 | 新架构 |
|------|--------|--------|
| 部署方式 | 单一应用 | 分离部署 |
| 移动端优化 | 通用响应式 | 专门优化 |
| 管理功能 | 混合在一起 | 独立后台 |
| 扩展性 | 有限 | 高度可扩展 |
| 成本 | 单一服务器 | Serverless |
| 性能 | 一般 | 全球CDN |

## 📞 下一步

1. **测试验证**: 确保所有功能正常
2. **数据库设计**: 设计D1数据库schema
3. **API开发**: 完善API接口
4. **部署配置**: 配置生产环境
5. **监控告警**: 设置监控和日志

需要帮助或有疑问，请随时联系！
