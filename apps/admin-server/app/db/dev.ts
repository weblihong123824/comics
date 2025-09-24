import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as schema from './schema';
import * as fs from 'fs';
import * as path from 'path';

// 开发环境数据库配置
let devDb: ReturnType<typeof drizzle> | null = null;
let migrationCompleted = false;

export function getDevDatabase() {
  if (!devDb) {
    // 创建或连接到本地 SQLite 数据库
    const sqlite = new Database('./dev.db');
    devDb = drizzle(sqlite, { schema });
    
    // 只在第一次初始化时运行迁移
    if (!migrationCompleted) {
      try {
        const migrationsFolder = path.join(process.cwd(), 'app', 'db', 'drizzle');
        if (fs.existsSync(migrationsFolder)) {
          migrate(devDb, { migrationsFolder });
          // 只在首次启动时显示迁移完成信息
          if (process.env.NODE_ENV !== 'production') {
            console.log('✅ Development database initialized');
          }
        } else {
          // 如果没有迁移文件，手动创建表
          createTablesManually(sqlite);
        }
        migrationCompleted = true;
      } catch (error) {
        console.error('❌ Database migration error:', error);
        // 尝试手动创建表
        createTablesManually(sqlite);
        migrationCompleted = true;
      }
    }
  }
  
  return devDb;
}

function createTablesManually(sqlite: Database.Database) {
  try {
    // 读取并执行迁移SQL
    const migrationPath = path.join(process.cwd(), 'app', 'db', 'drizzle', '0000_clumsy_miek.sql');
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
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Database tables initialized');
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ Could not create tables manually:', error);
    }
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
