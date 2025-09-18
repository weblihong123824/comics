import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Users Table
export const users = sqliteTable('users', {
  id: text('id').primaryKey().notNull(),
  username: text('username').unique().notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  isVip: integer('is_vip', { mode: 'boolean' }).default(false).notNull(),
  vipExpiresAt: text('vip_expires_at'), // ISO date string
  balance: integer('balance').default(0).notNull(), // 用户积分余额
}, (table) => {
  return {
    emailIdx: uniqueIndex('idx_users_email').on(table.email),
  };
});

// Comics Table
export const comics = sqliteTable('comics', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  description: text('description').notNull(),
  coverImageUrl: text('cover_image_url').notNull(),
  status: text('status', { enum: ['ongoing', 'completed'] }).default('ongoing').notNull(),
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
}, (table) => {
  return {
    statusIdx: uniqueIndex('idx_comics_status').on(table.status),
    updatedAtIdx: uniqueIndex('idx_comics_updated_at').on(table.updatedAt),
  };
});

// Chapters Table
export const chapters = sqliteTable('chapters', {
  id: text('id').primaryKey().notNull(),
  comicId: text('comic_id').notNull().references(() => comics.id, { onDelete: 'cascade' }),
  chapterNumber: integer('chapter_number').notNull(),
  title: text('title').notNull(),
  pageCount: integer('page_count').default(0).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  isFree: integer('is_free', { mode: 'boolean' }).default(false).notNull(),
}, (table) => {
  return {
    comicChapterNumberIdx: uniqueIndex('idx_chapters_comic_chapter_number').on(table.comicId, table.chapterNumber),
    comicIdIdx: uniqueIndex('idx_chapters_comic_id').on(table.comicId),
  };
});

// Pages Table (for comic content)
export const pages = sqliteTable('pages', {
  id: text('id').primaryKey().notNull(),
  chapterId: text('chapter_id').notNull().references(() => chapters.id, { onDelete: 'cascade' }),
  pageNumber: integer('page_number').notNull(),
  imageUrl: text('image_url').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    chapterPageNumberIdx: uniqueIndex('idx_pages_chapter_page_number').on(table.chapterId, table.pageNumber),
    chapterIdIdx: uniqueIndex('idx_pages_chapter_id').on(table.chapterId),
  };
});

// User-Comic Relationship (for favorites, reading progress, purchases)
export const userComics = sqliteTable('user_comics', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  comicId: text('comic_id').notNull().references(() => comics.id, { onDelete: 'cascade' }),
  isFavorited: integer('is_favorited', { mode: 'boolean' }).default(false).notNull(),
  lastReadChapterId: text('last_read_chapter_id').references(() => chapters.id, { onDelete: 'set null' }),
  lastReadPageNumber: integer('last_read_page_number'),
  lastReadAt: text('last_read_at'), // ISO date string
  purchasedAt: text('purchased_at'), // ISO date string
}, (table) => {
  return {
    pk: uniqueIndex('idx_user_comics_pk').on(table.userId, table.comicId),
    userIdIdx: uniqueIndex('idx_user_comics_user_id').on(table.userId),
    comicIdIdx: uniqueIndex('idx_user_comics_comic_id').on(table.comicId),
  };
});

// Reading History (more detailed, if needed, or can be managed via user_comics)
export const readingHistory = sqliteTable('reading_history', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  comicId: text('comic_id').notNull().references(() => comics.id, { onDelete: 'cascade' }),
  chapterId: text('chapter_id').notNull().references(() => chapters.id, { onDelete: 'cascade' }),
  pageNumber: integer('page_number').notNull(),
  readAt: text('read_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    userIdComicIdIdx: uniqueIndex('idx_reading_history_user_comic').on(table.userId, table.comicId),
  };
});

// Comments Table
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  comicId: text('comic_id').notNull().references(() => comics.id, { onDelete: 'cascade' }),
  chapterId: text('chapter_id').references(() => chapters.id, { onDelete: 'cascade' }), // Optional
  content: text('content').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    comicIdIdx: uniqueIndex('idx_comments_comic_id').on(table.comicId),
  };
});

// Orders Table (for purchases)
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  comicId: text('comic_id').notNull().references(() => comics.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // 支付金额 (积分)
  status: text('status', { enum: ['pending', 'completed', 'failed'] }).default('pending').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  completedAt: text('completed_at'), // ISO date string
}, (table) => {
  return {
    userIdIdx: uniqueIndex('idx_orders_user_id').on(table.userId),
  };
});
