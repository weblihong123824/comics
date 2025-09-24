import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

// 用户表
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
    usernameIdx: uniqueIndex('idx_users_username').on(table.username),
  };
});

// 用户配额交易记录表
export const userQuotaTransactions = sqliteTable('user_quota_transactions', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['purchase', 'consume', 'refund', 'reward'] }).notNull(),
  amount: integer('amount').notNull(), // 积分数量，正数为增加，负数为消费
  balance: integer('balance').notNull(), // 交易后的余额
  description: text('description').notNull(),
  relatedOrderId: text('related_order_id'), // 关联的订单ID
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    userIdIdx: uniqueIndex('idx_user_quota_transactions_user_id').on(table.userId),
    typeIdx: uniqueIndex('idx_user_quota_transactions_type').on(table.type),
    createdAtIdx: uniqueIndex('idx_user_quota_transactions_created_at').on(table.createdAt),
  };
});

// 用户解锁资源表
export const userUnlockResources = sqliteTable('user_unlock_resources', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  resourceType: text('resource_type', { enum: ['comic', 'chapter'] }).notNull(),
  resourceId: text('resource_id').notNull(), // 漫画ID或章节ID
  unlockedAt: text('unlocked_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  expiresAt: text('expires_at'), // 解锁过期时间，null表示永久
  method: text('method', { enum: ['purchase', 'vip', 'free', 'gift'] }).notNull(),
}, (table) => {
  return {
    userResourceIdx: uniqueIndex('idx_user_unlock_resources_user_resource').on(table.userId, table.resourceType, table.resourceId),
    userIdIdx: uniqueIndex('idx_user_unlock_resources_user_id').on(table.userId),
  };
});
