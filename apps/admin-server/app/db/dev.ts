import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as schema from './schema';
import * as fs from 'fs';
import * as path from 'path';

// 开发环境数据库配置
let devDb: ReturnType<typeof drizzle> | null = null;

export function getDevDatabase() {
  if (!devDb) {
    // 创建或连接到本地 SQLite 数据库
    const sqlite = new Database('./dev.db');
    devDb = drizzle(sqlite, { schema });
    
    // 运行迁移
    try {
      const migrationsFolder = path.join(process.cwd(), 'drizzle');
      if (fs.existsSync(migrationsFolder)) {
        migrate(devDb, { migrationsFolder });
        console.log('✅ Development database migrations completed');
      } else {
        console.log('⚠️ No migrations folder found, creating tables manually...');
        // 如果没有迁移文件，手动创建表
        createTablesManually(sqlite);
      }
    } catch (error) {
      console.error('❌ Database migration error:', error);
      // 尝试手动创建表
      createTablesManually(sqlite);
    }
  }
  
  return devDb;
}

function createTablesManually(sqlite: Database.Database) {
  try {
    // 读取并执行迁移SQL
    const migrationPath = path.join(process.cwd(), 'drizzle', '0000_clumsy_miek.sql');
    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, 'utf8');
      // 分割SQL语句并执行
      const statements = sql.split('--> statement-breakpoint');
      for (const statement of statements) {
        const trimmed = statement.trim();
        if (trimmed && !trimmed.startsWith('-->')) {
          sqlite.exec(trimmed);
        }
      }
      console.log('✅ Tables created manually from migration file');
    }
  } catch (error) {
    console.warn('⚠️ Could not create tables manually:', error);
  }
}

// 检测是否在开发环境
export function isDevelopment() {
  return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
}

// 统一的数据库获取函数
export function getDatabase(context?: any) {
  if (isDevelopment()) {
    return getDevDatabase();
  }
  
  // 生产环境使用 Cloudflare D1
  if (context?.cloudflare?.env?.DB) {
    return drizzleD1(context.cloudflare.env.DB, { schema });
  }
  
  throw new Error('Database not available');
}
