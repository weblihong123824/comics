# 开发指南

## 项目启动

### 同时启动所有应用
```bash
pnpm dev:all
# 或者
pnpm dev
```

### 单独启动应用

#### 后台管理系统
```bash
pnpm dev:admin
```
- 访问地址: http://localhost:3000
- 用于管理漫画、用户、订单等

#### 移动端客户端
```bash
pnpm dev:mobile
```
- 访问地址: http://localhost:3001
- 用于用户阅读漫画

## 端口配置

| 应用 | 端口 | 说明 |
|------|------|------|
| admin-server | 3000 | 后台管理系统 |
| mobile-client | 3001 | 移动端客户端 |

## 构建

### 构建所有应用
```bash
pnpm build
```

### 单独构建
```bash
pnpm build:admin   # 构建后台管理
pnpm build:mobile  # 构建移动端
```

## 数据库操作

```bash
cd apps/admin-server
pnpm db:generate  # 生成数据库迁移文件
pnpm db:migrate   # 执行数据库迁移
pnpm db:studio    # 打开数据库管理界面
```

## 项目结构

```
comic/
├── apps/
│   ├── admin-server/     # 后台管理系统 (React Router + Drizzle)
│   └── mobile-client/    # 移动端客户端 (Vite + React)
├── packages/
│   ├── shared-types/     # 共享类型定义
│   ├── ui-components/    # 共享UI组件
│   └── utils/           # 共享工具函数
└── ...
```
