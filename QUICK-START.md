# 🚀 Admin Server 快速启动指南

## 💫 立即运行 (1分钟启动)

### 第一步: 安装依赖
```bash
# 在项目根目录运行
pnpm install
```

### 第二步: 启动开发服务器
```bash
cd apps/admin-server
pnpm dev
```

## 🛠️ 如果出现错误

### 错误 1: 模块未找到
```bash
# 确保工作空间正确链接
pnpm install --force
```

### 错误 2: TypeScript 错误
```bash
# 检查类型
cd apps/admin-server
pnpm typecheck
```

### 错误 3: 端口被占用
```bash
# 使用不同端口
pnpm dev --port 3001
```

## 🎯 期望的结果

启动成功后，您应该看到:
```
Local:   http://localhost:5173
Network: use --host to expose
```

## 📱 访问管理后台

打开浏览器访问: http://localhost:5173

您将看到漫画管理系统的界面，包括:
- 📊 仪表板 (统计数据)
- 📚 漫画管理 (CRUD操作)
- 👥 用户管理
- 📈 数据分析

## 🔧 开发工具

```bash
# 类型检查
pnpm typecheck

# 数据库操作
pnpm db:generate  # 生成迁移
pnpm db:studio    # 数据库可视化

# 构建生产版本
pnpm build
```

## 🆘 如果仍然失败

1. **检查 Node.js 版本** (需要 v18+):
   ```bash
   node --version
   ```

2. **清理并重新安装**:
   ```bash
   rm -rf node_modules
   pnpm install
   ```

3. **运行健康检查**:
   ```bash
   chmod +x check-admin-server.sh
   ./check-admin-server.sh
   ```

4. **查看详细故障排除**: 参考 `TROUBLESHOOTING-ADMIN-SERVER.md`

## 📞 需要帮助?

如果还是无法启动，请提供:
1. 完整的错误消息
2. 运行 `node --version` 的输出
3. 运行 `pnpm --version` 的输出
4. 您的操作系统信息

---

💡 **提示**: 第一次运行可能需要下载依赖，请稍等片刻。
