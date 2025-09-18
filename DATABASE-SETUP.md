# 🗄️ Cloudflare D1 + Drizzle ORM 数据库配置指南

## 📋 概述

本项目使用 **Cloudflare D1** 作为数据库，配合 **Drizzle ORM** 提供类型安全的数据库操作。D1 是 Cloudflare 的 SQLite 兼容数据库，完美适配 Serverless 架构。

## 🚀 快速开始

### 1. 安装 Wrangler CLI
```bash
npm install -g wrangler

# 登录 Cloudflare 账户
wrangler login
```

### 2. 创建数据库
```bash
# 开发环境
wrangler d1 create comic-system-dev

# 生产环境
wrangler d1 create comic-system-prod
```

### 3. 配置 wrangler.toml
复制创建数据库时返回的 database_id，更新 `apps/admin-server/wrangler.toml`:

```toml
[[env.development.d1_databases]]
binding = "DB"
database_name = "comic-system-dev"
database_id = "your-database-id-here"
```

### 4. 生成和应用迁移
```bash
cd apps/admin-server

# 生成迁移文件
npm run db:generate

# 应用到本地数据库
wrangler d1 migrations apply comic-system-dev --local

# 应用到远程数据库
wrangler d1 migrations apply comic-system-dev
```

## 📊 数据库结构

### 核心表设计

#### users (用户表)
```sql
- id: TEXT PRIMARY KEY
- username: TEXT UNIQUE NOT NULL
- email: TEXT UNIQUE NOT NULL  
- password_hash: TEXT NOT NULL
- role: TEXT (admin/user)
- coin_balance: INTEGER (积分余额)
- vip_level: INTEGER (VIP等级)
- vip_expired_at: TIMESTAMP
```

#### comics (漫画表)
```sql
- id: TEXT PRIMARY KEY
- title: TEXT NOT NULL
- author: TEXT NOT NULL
- cover: TEXT (封面图URL)
- status: TEXT (ongoing/completed)
- free_chapters: INTEGER (免费章节数)
- price: INTEGER (价格，分)
- is_hot: BOOLEAN (是否热门)
- has_updates: BOOLEAN (是否有更新)
```

#### chapters (章节表)
```sql
- id: TEXT PRIMARY KEY
- comic_id: TEXT REFERENCES comics(id)
- chapter_number: INTEGER
- title: TEXT NOT NULL
- page_count: INTEGER
- is_free: BOOLEAN
- is_published: BOOLEAN
```

#### pages (页面表)
```sql
- id: TEXT PRIMARY KEY
- chapter_id: TEXT REFERENCES chapters(id)
- page_number: INTEGER
- image_url: TEXT (R2存储的图片URL)
- width: INTEGER
- height: INTEGER
```

#### user_comics (用户漫画关系表)
```sql
- id: TEXT PRIMARY KEY
- user_id: TEXT REFERENCES users(id)
- comic_id: TEXT REFERENCES comics(id)
- is_purchased: BOOLEAN (是否已购买)
- is_favorited: BOOLEAN (是否收藏)
- last_read_chapter: INTEGER
- purchased_at: TIMESTAMP
```

#### reading_history (阅读历史表)
```sql
- id: TEXT PRIMARY KEY
- user_id: TEXT REFERENCES users(id)
- comic_id: TEXT REFERENCES comics(id)
- chapter_id: TEXT REFERENCES chapters(id)
- last_page_number: INTEGER
- read_at: TIMESTAMP
```

## 🔧 Drizzle ORM 使用

### 基本查询示例

```typescript
import { eq, and, desc } from 'drizzle-orm';
import { comics, chapters, userComics } from './schema';

// 获取漫画列表
const comicsList = await db
  .select()
  .from(comics)
  .where(eq(comics.status, 'ongoing'))
  .orderBy(desc(comics.updatedAt));

// 获取用户收藏
const favorites = await db
  .select({
    comic: comics,
    userComic: userComics,
  })
  .from(userComics)
  .innerJoin(comics, eq(userComics.comicId, comics.id))
  .where(and(
    eq(userComics.userId, userId),
    eq(userComics.isFavorited, true)
  ));

// 插入新漫画
await db.insert(comics).values({
  id: crypto.randomUUID(),
  title: '新漫画',
  author: '作者名',
  status: 'ongoing',
});
```

### 关系查询

```typescript
// 包含关系的查询
const comicWithChapters = await db.query.comics.findFirst({
  where: eq(comics.id, comicId),
  with: {
    chapters: {
      orderBy: chapters.chapterNumber,
    },
  },
});
```

### 事务操作

```typescript
await db.transaction(async (tx) => {
  // 扣除用户积分
  await tx
    .update(users)
    .set({ coinBalance: sql`${users.coinBalance} - ${price}` })
    .where(eq(users.id, userId));

  // 标记漫画为已购买
  await tx.insert(userComics).values({
    id: crypto.randomUUID(),
    userId,
    comicId,
    isPurchased: true,
    purchasedAt: new Date(),
  });
});
```

## 🛠️ 开发工具

### Drizzle Studio
可视化数据库管理工具：
```bash
npm run db:studio
```

### 常用命令

```bash
# 生成新的迁移文件
npm run db:generate

# 应用迁移到本地数据库
wrangler d1 migrations apply comic-system-dev --local

# 应用迁移到远程数据库
wrangler d1 migrations apply comic-system-dev

# 查看数据库内容
wrangler d1 execute comic-system-dev --command="SELECT * FROM comics LIMIT 10"

# 导出数据库
wrangler d1 export comic-system-dev --output=backup.sql
```

## 📈 性能优化

### 索引策略
```sql
-- 主要查询索引
CREATE INDEX idx_comics_status ON comics(status);
CREATE INDEX idx_comics_is_hot ON comics(is_hot);
CREATE INDEX idx_comics_has_updates ON comics(has_updates);
CREATE INDEX idx_chapters_comic_id ON chapters(comic_id);
CREATE INDEX idx_user_comics_user_id ON user_comics(user_id);
CREATE INDEX idx_reading_history_user_id ON reading_history(user_id);
```

### 查询优化
1. **使用 WHERE 子句限制结果集**
2. **合理使用 LIMIT 和 OFFSET 进行分页**
3. **避免 N+1 查询，使用 JOIN 或关系查询**
4. **对频繁查询的字段建立索引**

## 🔐 安全考虑

### 数据验证
```typescript
// 输入验证
const validateComicData = (data: any) => {
  if (!data.title || data.title.length < 1) {
    throw new Error('Title is required');
  }
  if (!data.author || data.author.length < 1) {
    throw new Error('Author is required');
  }
  // 更多验证...
};
```

### 权限控制
```typescript
// 检查用户权限
const checkReadPermission = async (userId: string, chapterId: string) => {
  const chapter = await getChapterById(chapterId);
  const comic = await getComicById(chapter.comicId);
  
  // 检查是否为免费章节
  if (chapter.isFree || chapter.chapterNumber <= comic.freeChapters) {
    return true;
  }
  
  // 检查用户是否已购买
  const userComic = await getUserComic(userId, comic.id);
  return userComic?.isPurchased || false;
};
```

## 🚀 部署流程

### 1. 开发环境
```bash
# 设置本地开发数据库
wrangler d1 migrations apply comic-system-dev --local

# 启动开发服务器
npm run dev
```

### 2. 生产部署
```bash
# 应用迁移到生产数据库
wrangler d1 migrations apply comic-system-prod

# 部署应用
npm run build
wrangler pages publish build/client --project-name=comic-admin
```

## 📝 最佳实践

1. **总是使用类型安全的查询**
2. **合理设计数据库索引**
3. **使用事务保证数据一致性**
4. **定期备份数据库**
5. **监控查询性能**
6. **使用连接池管理数据库连接**

## 🎯 数据迁移策略

### 版本控制
- 每次schema变更都生成新的迁移文件
- 迁移文件按时间戳命名，确保顺序执行
- 生产环境迁移前先在测试环境验证

### 回滚策略
```bash
# 查看迁移历史
wrangler d1 migrations list comic-system-prod

# 如需回滚，可以创建反向迁移
npm run db:generate # 创建回滚迁移
```

这个数据库配置为漫画系统提供了强大、灵活且类型安全的数据存储解决方案！
