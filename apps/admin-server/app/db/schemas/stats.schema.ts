import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

// 阅读历史表
export const readingHistory = sqliteTable('reading_history', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull(),
  comicId: text('comic_id').notNull(),
  chapterId: text('chapter_id').notNull(),
  pageNumber: integer('page_number').notNull(),
  readDuration: integer('read_duration'), // 阅读时长（秒）
  deviceType: text('device_type', { enum: ['mobile', 'tablet', 'desktop'] }),
  readAt: text('read_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    userComicIdx: index('idx_reading_history_user_comic').on(table.userId, table.comicId),
    userIdIdx: index('idx_reading_history_user_id').on(table.userId),
    comicIdIdx: index('idx_reading_history_comic_id').on(table.comicId),
    readAtIdx: index('idx_reading_history_read_at').on(table.readAt),
  };
});

// 用户行为统计表
export const userStats = sqliteTable('user_stats', {
  userId: text('user_id').primaryKey().notNull(),
  totalReadTime: integer('total_read_time').default(0).notNull(), // 总阅读时长（分钟）
  totalComicsRead: integer('total_comics_read').default(0).notNull(), // 阅读过的漫画数量
  totalChaptersRead: integer('total_chapters_read').default(0).notNull(), // 阅读过的章节数量
  totalPagesRead: integer('total_pages_read').default(0).notNull(), // 阅读过的页面数量
  totalSpent: integer('total_spent').default(0).notNull(), // 总消费积分
  favoriteGenres: text('favorite_genres'), // JSON格式的喜好分类
  lastActiveAt: text('last_active_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    lastActiveAtIdx: index('idx_user_stats_last_active_at').on(table.lastActiveAt),
    totalReadTimeIdx: index('idx_user_stats_total_read_time').on(table.totalReadTime),
    totalSpentIdx: index('idx_user_stats_total_spent').on(table.totalSpent),
  };
});

// 漫画统计表
export const comicStats = sqliteTable('comic_stats', {
  comicId: text('comic_id').primaryKey().notNull(),
  totalViews: integer('total_views').default(0).notNull(),
  uniqueReaders: integer('unique_readers').default(0).notNull(),
  totalReadTime: integer('total_read_time').default(0).notNull(), // 总阅读时长（分钟）
  averageRating: real('average_rating').default(0).notNull(),
  totalRatings: integer('total_ratings').default(0).notNull(),
  totalComments: integer('total_comments').default(0).notNull(),
  totalFavorites: integer('total_favorites').default(0).notNull(),
  totalRevenue: integer('total_revenue').default(0).notNull(), // 总收入积分
  conversionRate: real('conversion_rate').default(0).notNull(), // 转化率
  lastViewAt: text('last_view_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    totalViewsIdx: index('idx_comic_stats_total_views').on(table.totalViews),
    averageRatingIdx: index('idx_comic_stats_average_rating').on(table.averageRating),
    totalRevenueIdx: index('idx_comic_stats_total_revenue').on(table.totalRevenue),
    lastViewAtIdx: index('idx_comic_stats_last_view_at').on(table.lastViewAt),
  };
});

// 日统计表
export const dailyStats = sqliteTable('daily_stats', {
  id: text('id').primaryKey().notNull(),
  date: text('date').notNull(), // YYYY-MM-DD格式
  type: text('type', { enum: ['users', 'comics', 'revenue', 'views'] }).notNull(),
  newUsers: integer('new_users').default(0).notNull(),
  activeUsers: integer('active_users').default(0).notNull(),
  newComics: integer('new_comics').default(0).notNull(),
  totalViews: integer('total_views').default(0).notNull(),
  totalRevenue: integer('total_revenue').default(0).notNull(),
  totalOrders: integer('total_orders').default(0).notNull(),
  averageSessionTime: integer('average_session_time').default(0).notNull(), // 平均会话时长（分钟）
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    dateTypeIdx: uniqueIndex('idx_daily_stats_date_type').on(table.date, table.type),
    dateIdx: index('idx_daily_stats_date').on(table.date),
    typeIdx: index('idx_daily_stats_type').on(table.type),
  };
});

// 实时统计表
export const realtimeStats = sqliteTable('realtime_stats', {
  id: text('id').primaryKey().notNull(),
  metric: text('metric').notNull(), // 指标名称
  value: integer('value').notNull(), // 指标值
  timestamp: text('timestamp').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    metricIdx: index('idx_realtime_stats_metric').on(table.metric),
    timestampIdx: index('idx_realtime_stats_timestamp').on(table.timestamp),
  };
});
