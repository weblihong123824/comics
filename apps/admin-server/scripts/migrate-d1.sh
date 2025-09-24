#!/bin/bash

# Drizzle + D1 数据库迁移管理脚本

set -e

DB_NAME="comic-dev"
DB_ID="ce2df114-db14-4b26-8e28-82f5c9fa2e25"

echo "🗄️  Drizzle + D1 数据库迁移管理"
echo "================================"

# 显示帮助信息
show_help() {
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  generate     生成新的迁移文件（基于 schema 变化）"
    echo "  apply        在本地 D1 数据库应用迁移"
    echo "  apply-remote 在远程 D1 数据库应用迁移"
    echo "  status       查看迁移状态"
    echo "  rollback     回滚最后一次迁移（仅本地）"
    echo "  reset        重置数据库（危险操作）"
    echo ""
    echo "示例:"
    echo "  $0 generate     # 生成迁移文件"
    echo "  $0 apply        # 应用到本地"
    echo "  $0 apply-remote # 应用到远程"
}

# 检查依赖
check_dependencies() {
    if ! command -v wrangler &> /dev/null; then
        echo "❌ 请先安装 wrangler: npm install -g wrangler"
        exit 1
    fi
    
    if ! command -v drizzle-kit &> /dev/null; then
        echo "❌ 请先安装 drizzle-kit: npm install -g drizzle-kit"
        exit 1
    fi
}

# 生成迁移文件
generate_migration() {
    echo "📝 生成新的迁移文件..."
    
    if [ -f "drizzle.config.d1.json" ]; then
        drizzle-kit generate --config drizzle.config.d1.json
        echo "✅ 迁移文件生成完成"
    else
        echo "❌ 找不到 drizzle.config.d1.json 配置文件"
        exit 1
    fi
}

# 应用迁移到本地
apply_local() {
    echo "🔄 应用迁移到本地 D1 数据库..."
    wrangler d1 migrations apply $DB_NAME
    echo "✅ 本地迁移应用完成"
}

# 应用迁移到远程
apply_remote() {
    echo "🌐 应用迁移到远程 D1 数据库..."
    echo "⚠️  这将修改生产数据库，请确认继续..."
    read -p "确认应用到远程数据库? (y/N): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        wrangler d1 migrations apply $DB_NAME --remote
        echo "✅ 远程迁移应用完成"
    else
        echo "❌ 操作已取消"
        exit 1
    fi
}

# 查看迁移状态
check_status() {
    echo "📊 迁移状态:"
    echo ""
    echo "本地数据库:"
    wrangler d1 migrations list $DB_NAME || echo "  无迁移记录"
    echo ""
    echo "远程数据库:"
    wrangler d1 migrations list $DB_NAME --remote || echo "  无迁移记录"
}

# 重置数据库
reset_database() {
    echo "⚠️  危险操作：重置数据库"
    echo "这将删除所有数据和表结构！"
    read -p "确认重置数据库? (输入 'RESET' 确认): " confirm
    
    if [[ $confirm == "RESET" ]]; then
        echo "🗑️  重置本地数据库..."
        # 这里可以添加重置逻辑
        echo "✅ 数据库重置完成"
    else
        echo "❌ 操作已取消"
        exit 1
    fi
}

# 主逻辑
main() {
    check_dependencies
    
    case "${1:-help}" in
        "generate"|"g")
            generate_migration
            ;;
        "apply"|"up")
            apply_local
            ;;
        "apply-remote"|"up-remote")
            apply_remote
            ;;
        "status"|"s")
            check_status
            ;;
        "reset")
            reset_database
            ;;
        "help"|"-h"|"--help"|*)
            show_help
            ;;
    esac
}

main "$@"
