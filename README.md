# 🎨 漫画管理系统

一个基于 **React Router v7** + **Cloudflare D1** + **Drizzle ORM** 的现代化漫画管理和阅读平台。

## 🚀 项目特性

### 📚 **后台管理系统** (`apps/admin-server`)
- ✅ **完整的漫画管理** - 创建、编辑、删除漫画
- ✅ **章节管理** - 为漫画添加章节和页面内容
- ✅ **批量上传** - 支持拖拽批量上传页面图片
- ✅ **用户管理** - 用户账户和权限管理
- ✅ **订单系统** - 积分购买和订单管理
- ✅ **数据分析** - 阅读统计和用户行为分析
- ✅ **响应式设计** - 支持桌面和移动端

### 📱 **移动客户端** (`apps/mobile-client`)
- ✅ **漫画阅读** - 流畅的阅读体验
- ✅ **用户中心** - 个人资料和阅读历史
- ✅ **收藏功能** - 收藏喜欢的漫画
- ✅ **搜索和筛选** - 快速找到想看的漫画
- ✅ **离线阅读** - 支持下载离线阅读

## 🏗️ 技术架构

### 前端技术栈
- **React 19** - 最新的 React 版本
- **React Router v7** - 现代化的路由解决方案
- **TypeScript** - 类型安全
- **Tailwind CSS** - 原子化 CSS 框架
- **Vite** - 快速的构建工具

### 后端技术栈
- **Cloudflare Pages** - 全球 CDN 部署
- **Cloudflare D1** - Serverless SQLite 数据库
- **Drizzle ORM** - 类型安全的 ORM
- **Cloudflare R2** - 对象存储（图片文件）

### 开发工具
- **pnpm** - 高效的包管理器
- **Turbo** - Monorepo 构建工具
- **Wrangler** - Cloudflare 开发工具

## 📦 项目结构

```
comic/
├── apps/
│   ├── admin-server/          # 后台管理系统
│   │   ├── app/
│   │   │   ├── routes/        # 路由和页面
│   │   │   ├── components/    # 组件
│   │   │   ├── db/           # 数据库配置
│   │   │   └── services/     # 业务逻辑
│   │   ├── migrations/       # 数据库迁移
│   │   └── scripts/          # 部署脚本
│   └── mobile-client/        # 移动客户端
│       └── src/
│           ├── pages/        # 页面组件
│           └── components/   # 共享组件
├── packages/
│   ├── shared-types/         # 共享类型定义
│   ├── ui-components/        # UI 组件库
│   └── utils/               # 工具函数
└── README.md
```

## 🚀 快速开始

### 1. 环境要求
- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Cloudflare 账户**（用于部署）

### 2. 安装依赖
```bash
# 克隆项目
git clone <your-repo-url>
cd comic

# 安装依赖
pnpm install
```

### 3. 配置数据库
```bash
# 登录 Cloudflare
wrangler login

# 创建 D1 数据库
wrangler d1 create comic-dev

# 配置 wrangler.toml 中的数据库 ID
# 然后运行迁移
cd apps/admin-server
npm run d1:up:remote
```

### 4. 启动开发服务器
```bash
# 启动后台管理系统
cd apps/admin-server
npm run dev

# 启动移动客户端（新终端）
cd apps/mobile-client
npm run dev
```

## 📊 数据库管理

### 常用命令
```bash
# 生成迁移文件
npm run d1:g

# 应用迁移到本地
npm run d1:up

# 应用迁移到远程
npm run d1:up:remote

# 查看迁移状态
npm run d1:status:remote

# 执行 SQL 查询
npm run d1:execute:remote -- --command="SELECT * FROM comics LIMIT 5;"
```

详细的数据库管理指南请查看 [`apps/admin-server/DATABASE-COMMANDS.md`](apps/admin-server/DATABASE-COMMANDS.md)

## 🚀 部署

### 后台管理系统部署
```bash
cd apps/admin-server

# 构建项目
npm run build

# 部署到 Cloudflare Pages
npm run deploy
```

### 移动客户端部署
```bash
cd apps/mobile-client

# 构建项目
npm run build

# 部署到 Cloudflare Pages
wrangler pages deploy dist
```

## 🎯 功能演示

### 后台管理系统
- **URL**: https://comic-admin.pages.dev
- **功能**: 漫画管理、用户管理、数据分析

### 移动客户端
- **URL**: https://comic-mobile.pages.dev
- **功能**: 漫画阅读、用户中心、收藏管理

## 🛠️ 开发指南

### 添加新功能
1. 在 `packages/shared-types` 中定义类型
2. 在对应的 app 中实现功能
3. 更新数据库 schema（如需要）
4. 运行迁移和测试

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 React 最佳实践
- 使用 Tailwind CSS 进行样式设计
- 保持组件的可复用性

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题请提交 Issue 或联系维护者。

---

**⭐ 如果这个项目对您有帮助，请给个 Star！**