import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

// 分类表
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(), // URL友好的标识符
  description: text('description'),
  coverImageUrl: text('cover_image_url'),
  parentId: text('parent_id').references(() => categories.id, { onDelete: 'set null' }), // 支持分类层级
  sortOrder: integer('sort_order').default(0).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    slugIdx: uniqueIndex('idx_categories_slug').on(table.slug),
    parentIdIdx: index('idx_categories_parent_id').on(table.parentId),
    activeIdx: index('idx_categories_active').on(table.isActive),
    sortOrderIdx: index('idx_categories_sort_order').on(table.sortOrder),
  };
});

// 漫画分类关系表
export const comicCategories = sqliteTable('comic_categories', {
  comicId: text('comic_id').notNull(),
  categoryId: text('category_id').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    pk: uniqueIndex('idx_comic_categories_pk').on(table.comicId, table.categoryId),
    comicIdIdx: index('idx_comic_categories_comic_id').on(table.comicId),
    categoryIdIdx: index('idx_comic_categories_category_id').on(table.categoryId),
  };
});

// 标签表
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey().notNull(),
  name: text('name').unique().notNull(),
  slug: text('slug').unique().notNull(),
  color: text('color'), // 标签颜色 hex
  description: text('description'),
  usageCount: integer('usage_count').default(0).notNull(), // 使用次数
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    nameIdx: uniqueIndex('idx_tags_name').on(table.name),
    slugIdx: uniqueIndex('idx_tags_slug').on(table.slug),
    activeIdx: index('idx_tags_active').on(table.isActive),
    usageCountIdx: index('idx_tags_usage_count').on(table.usageCount),
  };
});

// 漫画标签关系表
export const comicTags = sqliteTable('comic_tags', {
  comicId: text('comic_id').notNull(),
  tagId: text('tag_id').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => {
  return {
    pk: uniqueIndex('idx_comic_tags_pk').on(table.comicId, table.tagId),
    comicIdIdx: index('idx_comic_tags_comic_id').on(table.comicId),
    tagIdIdx: index('idx_comic_tags_tag_id').on(table.tagId),
  };
});
