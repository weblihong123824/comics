import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

// 系统设置表
export const systemSettings = sqliteTable('system_settings', {
  key: text('key').primaryKey().notNull(),
  value: text('value').notNull(),
  type: text('type', { enum: ['string', 'number', 'boolean', 'json'] }).default('string').notNull(),
  category: text('category').default('general').notNull(), // 设置分类
  description: text('description'),
  isPublic: integer('is_public', { mode: 'boolean' }).default(false).notNull(), // 是否公开给前端
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedBy: text('updated_by'), // 更新人员ID
}, (table) => {
  return {
    categoryIdx: index('idx_system_settings_category').on(table.category),
    publicIdx: index('idx_system_settings_public').on(table.isPublic),
  };
});

// 管理员表
export const admins = sqliteTable('admins', {
  id: text('id').primaryKey().notNull(),
  username: text('username').unique().notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url'),
  role: text('role', { enum: ['super_admin', 'admin', 'moderator', 'editor'] }).default('editor').notNull(),
  permissions: text('permissions'), // JSON格式的权限列表
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  lastLoginAt: text('last_login_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdBy: text('created_by'), // 创建人员ID
}, (table) => {
  return {
    usernameIdx: uniqueIndex('idx_admins_username').on(table.username),
    emailIdx: uniqueIndex('idx_admins_email').on(table.email),
    roleIdx: index('idx_admins_role').on(table.role),
    activeIdx: index('idx_admins_active').on(table.isActive),
  };
});

// 管理员操作日志表
export const adminLogs = sqliteTable('admin_logs', {
  id: text('id').primaryKey().notNull(),
  adminId: text('admin_id').notNull(),
  action: text('action').notNull(), // 操作类型
  resource: text('resource'), // 操作的资源类型
  resourceId: text('resource_id'), // 操作的资源ID
  details: text('details'), // JSON格式的详细信息
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    adminIdIdx: index('idx_admin_logs_admin_id').on(table.adminId),
    actionIdx: index('idx_admin_logs_action').on(table.action),
    resourceIdx: index('idx_admin_logs_resource').on(table.resource),
    createdAtIdx: index('idx_admin_logs_created_at').on(table.createdAt),
  };
});

// 通知表
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id'), // 用户ID，null表示系统通知
  type: text('type', { enum: ['system', 'comic_update', 'payment', 'comment', 'promotion'] }).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  data: text('data'), // JSON格式的额外数据
  isRead: integer('is_read', { mode: 'boolean' }).default(false).notNull(),
  readAt: text('read_at'),
  expiresAt: text('expires_at'), // 过期时间
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    userIdIdx: index('idx_notifications_user_id').on(table.userId),
    typeIdx: index('idx_notifications_type').on(table.type),
    readIdx: index('idx_notifications_read').on(table.isRead),
    createdAtIdx: index('idx_notifications_created_at').on(table.createdAt),
    expiresAtIdx: index('idx_notifications_expires_at').on(table.expiresAt),
  };
});

// 文件上传记录表
export const uploads = sqliteTable('uploads', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id'), // 上传者ID
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(), // 文件大小（字节）
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'), // 缩略图URL
  category: text('category', { enum: ['comic_cover', 'comic_page', 'avatar', 'system'] }).notNull(),
  metadata: text('metadata'), // JSON格式的元数据
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    userIdIdx: index('idx_uploads_user_id').on(table.userId),
    categoryIdx: index('idx_uploads_category').on(table.category),
    createdAtIdx: index('idx_uploads_created_at').on(table.createdAt),
  };
});
