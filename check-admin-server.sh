#!/bin/bash

echo "🔍 Admin Server 健康检查开始..."
echo "========================================"

# 检查 Node.js 版本
echo ""
echo "📌 Node.js 版本检查:"
node --version
if [ $? -ne 0 ]; then
    echo "❌ Node.js 未安装或不在 PATH 中"
    exit 1
fi

# 检查 pnpm
echo ""
echo "📦 pnpm 版本检查:"
pnpm --version
if [ $? -ne 0 ]; then
    echo "❌ pnpm 未安装，请运行: npm install -g pnpm"
    exit 1
fi

# 检查当前目录
echo ""
echo "📂 当前目录: $(pwd)"

# 检查关键文件
echo ""
echo "📋 检查关键文件:"
files=(
    "package.json"
    "pnpm-workspace.yaml"
    "apps/admin-server/package.json"
    "apps/admin-server/tsconfig.json"
    "apps/admin-server/vite.config.ts"
    "apps/admin-server/react-router.config.ts"
    "apps/admin-server/app/root.tsx"
    "apps/admin-server/app/routes.ts"
    "packages/shared-types/package.json"
    "packages/shared-types/src/index.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - 文件缺失"
    fi
done

# 检查依赖安装
echo ""
echo "🔧 检查依赖安装:"
if [ -d "node_modules" ]; then
    echo "✅ 根目录 node_modules"
else
    echo "❌ 根目录 node_modules 缺失"
    echo "💡 请运行: pnpm install"
fi

if [ -d "apps/admin-server/node_modules" ]; then
    echo "✅ admin-server node_modules"
else
    echo "❌ admin-server node_modules 缺失"
    echo "💡 请运行: cd apps/admin-server && pnpm install"
fi

# 检查共享包构建
echo ""
echo "🏗️ 检查共享包构建:"
if [ -d "packages/shared-types/dist" ]; then
    echo "✅ shared-types 已构建"
else
    echo "❌ shared-types 未构建"
    echo "💡 请运行: cd packages/shared-types && pnpm build"
fi

# TypeScript 检查
echo ""
echo "🔍 TypeScript 检查:"
cd apps/admin-server
if pnpm typecheck --noEmit 2>/dev/null; then
    echo "✅ TypeScript 检查通过"
else
    echo "❌ TypeScript 检查失败"
    echo "💡 请运行: cd apps/admin-server && pnpm typecheck 查看详细错误"
fi

cd ../..

echo ""
echo "========================================"
echo "🏁 健康检查完成"
echo ""
echo "📋 下一步建议:"
echo "1. 如果有文件缺失，请检查项目完整性"
echo "2. 如果依赖缺失，运行对应的安装命令"
echo "3. 如果 TypeScript 检查失败，查看具体错误信息"
echo "4. 最后运行: cd apps/admin-server && pnpm dev"
echo ""
echo "🆘 如果仍有问题，请查看 TROUBLESHOOTING-ADMIN-SERVER.md"
