#!/bin/bash

# 漫画管理系统 - D1 数据库部署脚本

set -e

echo "🚀 开始部署 D1 数据库..."

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ 请先安装 wrangler: npm install -g wrangler"
    exit 1
fi

# 检查是否已登录
if ! wrangler whoami &> /dev/null; then
    echo "❌ 请先登录 Cloudflare: wrangler login"
    exit 1
fi

# 数据库信息
DB_NAME="comic-dev"
DB_ID="ce2df114-db14-4b26-8e28-82f5c9fa2e25"

echo "📊 数据库信息:"
echo "  名称: $DB_NAME"
echo "  ID: $DB_ID"

# 执行迁移
echo "📋 执行数据库迁移..."

if [ -f "migrations/0001_create_tables.sql" ]; then
    echo "  - 创建数据表..."
    wrangler d1 execute $DB_NAME --file=migrations/0001_create_tables.sql
    echo "  ✅ 数据表创建完成"
else
    echo "  ❌ 迁移文件不存在: migrations/0001_create_tables.sql"
    exit 1
fi

# 验证表是否创建成功
echo "🔍 验证数据库表..."
wrangler d1 execute $DB_NAME --command="SELECT name FROM sqlite_master WHERE type='table';"

echo "✅ D1 数据库部署完成！"
echo ""
echo "📝 接下来的步骤:"
echo "1. 运行 npm run build 构建项目"
echo "2. 运行 wrangler pages deploy 部署到 Cloudflare Pages"
echo "3. 访问您的应用程序 URL 测试功能"
echo ""
echo "🔗 有用的命令:"
echo "  查看数据库: wrangler d1 execute $DB_NAME --command='SELECT * FROM comics LIMIT 5;'"
echo "  查看表结构: wrangler d1 execute $DB_NAME --command='.schema'"
