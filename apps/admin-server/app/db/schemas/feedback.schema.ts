import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

// 评论表
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull(),
  comicId: text('comic_id').notNull(),
  chapterId: text('chapter_id'), // 可选，章节评论
  parentId: text('parent_id').references(() => comments.id, { onDelete: 'cascade' }), // 回复评论
  content: text('content').notNull(),
  rating: integer('rating'), // 评分 1-5
  likes: integer('likes').default(0).notNull(),
  dislikes: integer('dislikes').default(0).notNull(),
  isHidden: integer('is_hidden', { mode: 'boolean' }).default(false).notNull(),
  isReported: integer('is_reported', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    userIdIdx: index('idx_comments_user_id').on(table.userId),
    comicIdIdx: index('idx_comments_comic_id').on(table.comicId),
    chapterIdIdx: index('idx_comments_chapter_id').on(table.chapterId),
    parentIdIdx: index('idx_comments_parent_id').on(table.parentId),
    createdAtIdx: index('idx_comments_created_at').on(table.createdAt),
    hiddenIdx: index('idx_comments_hidden').on(table.isHidden),
  };
});

// 评论点赞表
export const commentLikes = sqliteTable('comment_likes', {
  userId: text('user_id').notNull(),
  commentId: text('comment_id').notNull(),
  type: text('type', { enum: ['like', 'dislike'] }).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    pk: uniqueIndex('idx_comment_likes_pk').on(table.userId, table.commentId),
    userIdIdx: index('idx_comment_likes_user_id').on(table.userId),
    commentIdIdx: index('idx_comment_likes_comment_id').on(table.commentId),
  };
});

// 用户反馈表
export const feedback = sqliteTable('feedback', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id'),
  type: text('type', { enum: ['bug', 'feature', 'complaint', 'suggestion', 'other'] }).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  email: text('email'), // 联系邮箱
  status: text('status', { enum: ['pending', 'in_progress', 'resolved', 'closed'] }).default('pending').notNull(),
  priority: text('priority', { enum: ['low', 'medium', 'high', 'urgent'] }).default('medium').notNull(),
  assignedTo: text('assigned_to'), // 分配给的管理员ID
  response: text('response'), // 管理员回复
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  resolvedAt: text('resolved_at'),
}, (table) => {
  return {
    userIdIdx: index('idx_feedback_user_id').on(table.userId),
    typeIdx: index('idx_feedback_type').on(table.type),
    statusIdx: index('idx_feedback_status').on(table.status),
    priorityIdx: index('idx_feedback_priority').on(table.priority),
    assignedToIdx: index('idx_feedback_assigned_to').on(table.assignedTo),
    createdAtIdx: index('idx_feedback_created_at').on(table.createdAt),
  };
});

// 举报表
export const reports = sqliteTable('reports', {
  id: text('id').primaryKey().notNull(),
  reporterId: text('reporter_id').notNull(), // 举报人ID
  targetType: text('target_type', { enum: ['comic', 'comment', 'user'] }).notNull(),
  targetId: text('target_id').notNull(), // 被举报对象ID
  reason: text('reason', { enum: ['spam', 'inappropriate', 'copyright', 'harassment', 'other'] }).notNull(),
  description: text('description'),
  status: text('status', { enum: ['pending', 'reviewing', 'resolved', 'dismissed'] }).default('pending').notNull(),
  reviewedBy: text('reviewed_by'), // 审核人员ID
  reviewNote: text('review_note'), // 审核备注
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  reviewedAt: text('reviewed_at'),
}, (table) => {
  return {
    reporterIdIdx: index('idx_reports_reporter_id').on(table.reporterId),
    targetIdx: index('idx_reports_target').on(table.targetType, table.targetId),
    statusIdx: index('idx_reports_status').on(table.status),
    reviewedByIdx: index('idx_reports_reviewed_by').on(table.reviewedBy),
    createdAtIdx: index('idx_reports_created_at').on(table.createdAt),
  };
});
