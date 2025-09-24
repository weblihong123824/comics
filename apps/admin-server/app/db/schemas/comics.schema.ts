import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

// 漫画表
export const comics = sqliteTable('comics', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  description: text('description').notNull(),
  coverImageUrl: text('cover_image_url').notNull(),
  status: text('status', { enum: ['ongoing', 'completed', 'paused'] }).default('ongoing').notNull(),
  genre: text('genre'), // JSON string
  tags: text('tags'), // JSON string
  views: integer('views').default(0).notNull(),
  likes: integer('likes').default(0).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  lastChapterUpdate: text('last_chapter_update'), // ISO date string
  hasUpdates: integer('has_updates', { mode: 'boolean' }).default(false).notNull(),
  freeChapters: integer('free_chapters').default(0).notNull(), // 前几章免费
  price: integer('price').default(0).notNull(), // 解锁整部漫画的价格 (积分)
  isRecommended: integer('is_recommended', { mode: 'boolean' }).default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(), // 排序权重
}, (table) => {
  return {
    statusIdx: index('idx_comics_status').on(table.status),
    updatedAtIdx: index('idx_comics_updated_at').on(table.updatedAt),
    viewsIdx: index('idx_comics_views').on(table.views),
    recommendedIdx: index('idx_comics_recommended').on(table.isRecommended),
  };
});

// 章节表
export const chapters = sqliteTable('chapters', {
  id: text('id').primaryKey().notNull(),
  comicId: text('comic_id').notNull().references(() => comics.id, { onDelete: 'cascade' }),
  chapterNumber: integer('chapter_number').notNull(),
  title: text('title').notNull(),
  pageCount: integer('page_count').default(0).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  isFree: integer('is_free', { mode: 'boolean' }).default(false).notNull(),
  isPublished: integer('is_published', { mode: 'boolean' }).default(true).notNull(),
}, (table) => {
  return {
    comicChapterNumberIdx: uniqueIndex('idx_chapters_comic_chapter_number').on(table.comicId, table.chapterNumber),
    comicIdIdx: index('idx_chapters_comic_id').on(table.comicId),
    publishedIdx: index('idx_chapters_published').on(table.isPublished),
  };
});

// 页面表 (漫画内容)
export const pages = sqliteTable('pages', {
  id: text('id').primaryKey().notNull(),
  chapterId: text('chapter_id').notNull().references(() => chapters.id, { onDelete: 'cascade' }),
  pageNumber: integer('page_number').notNull(),
  imageUrl: text('image_url').notNull(),
  thumbnailUrl: text('thumbnail_url'), // 缩略图URL
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    chapterPageNumberIdx: uniqueIndex('idx_pages_chapter_page_number').on(table.chapterId, table.pageNumber),
    chapterIdIdx: index('idx_pages_chapter_id').on(table.chapterId),
  };
});

// 用户漫画关系表 (收藏、阅读进度等)
export const userComics = sqliteTable('user_comics', {
  userId: text('user_id').notNull(),
  comicId: text('comic_id').notNull(),
  isFavorited: integer('is_favorited', { mode: 'boolean' }).default(false).notNull(),
  lastReadChapterId: text('last_read_chapter_id'),
  lastReadPageNumber: integer('last_read_page_number'),
  lastReadAt: text('last_read_at'), // ISO date string
  purchasedAt: text('purchased_at'), // ISO date string
  rating: integer('rating'), // 用户评分 1-5
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    pk: uniqueIndex('idx_user_comics_pk').on(table.userId, table.comicId),
    userIdIdx: index('idx_user_comics_user_id').on(table.userId),
    comicIdIdx: index('idx_user_comics_comic_id').on(table.comicId),
    favoritedIdx: index('idx_user_comics_favorited').on(table.isFavorited),
  };
});
