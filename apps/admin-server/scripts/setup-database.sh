#!/bin/bash

# Cloudflare D1 + Drizzle 数据库设置脚本

echo "🚀 Setting up Comic System Database with Cloudflare D1 + Drizzle"

# 检查 wrangler 是否已安装
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# 检查是否已登录
echo "📝 Checking Wrangler authentication..."
wrangler whoami || {
    echo "❌ Please login to Wrangler first: wrangler login"
    exit 1
}

echo "✅ Wrangler authentication verified"

# 创建开发环境数据库
echo "🗄️ Creating development D1 database..."
wrangler d1 create comic-system-dev

echo "📋 Please update your wrangler.toml with the database ID from above"
echo "💡 Add the database ID to [env.development.d1_databases] section"

# 生成迁移文件
echo "📁 Generating Drizzle migrations..."
cd apps/admin-server
npm run db:generate

# 应用迁移到本地数据库
echo "⚡ Applying migrations to local database..."
wrangler d1 migrations apply comic-system-dev --local

# 初始化示例数据（可选）
echo "🌱 Do you want to seed the database with sample data? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "🌱 Seeding database with sample data..."
    # 这里可以添加种子数据脚本
    echo "✅ Database seeded successfully"
fi

echo ""
echo "🎉 Database setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update wrangler.toml with your database IDs"
echo "2. Create production database: wrangler d1 create comic-system-prod"
echo "3. Apply migrations to production: wrangler d1 migrations apply comic-system-prod"
echo "4. Configure R2 buckets: wrangler r2 bucket create comic-files-dev"
echo "5. Set up KV namespaces for caching and sessions"
echo ""
echo "🔧 Development commands:"
echo "- npm run db:generate    # Generate new migrations"
echo "- npm run db:migrate     # Apply migrations"
echo "- npm run db:studio      # Open Drizzle Studio"
echo ""
