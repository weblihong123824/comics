import { eq, and, sql, desc, asc } from 'drizzle-orm';
import type { Database } from '../db';
import { categories, tags, comicCategories, comicTags } from '../db/schema';
import { createId } from '../utils/id';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  description?: string;
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CategoryService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // === 分类管理 ===

  async createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<Category> {
    try {
      const newCategoryId = createId('cat');
      
      const insertData = {
        id: newCategoryId,
        name: data.name.trim(),
        slug: data.slug.trim(),
        description: data.description?.trim(),
        coverImageUrl: data.coverImageUrl?.trim(),
        parentId: data.parentId,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await this.db.insert(categories).values(insertData);
      
      return {
        ...insertData,
        isActive: Boolean(insertData.isActive),
        createdAt: new Date(insertData.createdAt),
        updatedAt: new Date(insertData.updatedAt),
      };
    } catch (error) {
      console.error('创建分类失败:', error);
      throw new Error('创建分类时发生错误');
    }
  }

  async getCategories(filters?: { 
    parentId?: string | null;
    isActive?: boolean;
  }): Promise<Category[]> {
    try {
      let query = this.db.select().from(categories);
      
      if (filters?.parentId !== undefined) {
        if (filters.parentId === null) {
          query = query.where(sql`${categories.parentId} IS NULL`);
        } else {
          query = query.where(eq(categories.parentId, filters.parentId));
        }
      }
      
      if (filters?.isActive !== undefined) {
        query = query.where(eq(categories.isActive, filters.isActive ? 1 : 0));
      }
      
      const result = await query.orderBy(asc(categories.sortOrder), asc(categories.name)).all();
      
      return result.map(cat => ({
        ...cat,
        isActive: Boolean(cat.isActive),
        createdAt: new Date(cat.createdAt),
        updatedAt: new Date(cat.updatedAt),
      }));
    } catch (error) {
      console.error('获取分类失败:', error);
      throw new Error('获取分类时发生错误');
    }
  }

  async getCategoryById(categoryId: string): Promise<Category | undefined> {
    try {
      const result = await this.db.select().from(categories).where(eq(categories.id, categoryId)).all();
      const category = result[0];
      
      if (!category) return undefined;
      
      return {
        ...category,
        isActive: Boolean(category.isActive),
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt),
      };
    } catch (error) {
      console.error('获取分类详情失败:', error);
      return undefined;
    }
  }

  async updateCategory(categoryId: string, data: Partial<Category>): Promise<Category | undefined> {
    try {
      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };

      if (data.name) updateData.name = data.name.trim();
      if (data.slug) updateData.slug = data.slug.trim();
      if (data.description !== undefined) updateData.description = data.description?.trim();
      if (data.coverImageUrl !== undefined) updateData.coverImageUrl = data.coverImageUrl?.trim();
      if (data.parentId !== undefined) updateData.parentId = data.parentId;
      if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
      if (data.isActive !== undefined) updateData.isActive = data.isActive ? 1 : 0;

      await this.db.update(categories).set(updateData).where(eq(categories.id, categoryId));
      
      return this.getCategoryById(categoryId);
    } catch (error) {
      console.error('更新分类失败:', error);
      throw new Error('更新分类时发生错误');
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      await this.db.delete(categories).where(eq(categories.id, categoryId));
    } catch (error) {
      console.error('删除分类失败:', error);
      throw new Error('删除分类时发生错误');
    }
  }

  // === 标签管理 ===

  async createTag(data: Omit<Tag, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<Tag> {
    try {
      const newTagId = createId('tag');
      
      const insertData = {
        id: newTagId,
        name: data.name.trim(),
        slug: data.slug.trim(),
        color: data.color?.trim(),
        description: data.description?.trim(),
        usageCount: 0,
        isActive: data.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await this.db.insert(tags).values(insertData);
      
      return {
        ...insertData,
        isActive: Boolean(insertData.isActive),
        createdAt: new Date(insertData.createdAt),
        updatedAt: new Date(insertData.updatedAt),
      };
    } catch (error) {
      console.error('创建标签失败:', error);
      throw new Error('创建标签时发生错误');
    }
  }

  async getTags(filters?: { 
    isActive?: boolean;
    orderBy?: 'name' | 'usageCount';
  }): Promise<Tag[]> {
    try {
      let query = this.db.select().from(tags);
      
      if (filters?.isActive !== undefined) {
        query = query.where(eq(tags.isActive, filters.isActive ? 1 : 0));
      }
      
      const orderBy = filters?.orderBy || 'name';
      if (orderBy === 'usageCount') {
        query = query.orderBy(desc(tags.usageCount), asc(tags.name));
      } else {
        query = query.orderBy(asc(tags.name));
      }
      
      const result = await query.all();
      
      return result.map(tag => ({
        ...tag,
        isActive: Boolean(tag.isActive),
        createdAt: new Date(tag.createdAt),
        updatedAt: new Date(tag.updatedAt),
      }));
    } catch (error) {
      console.error('获取标签失败:', error);
      throw new Error('获取标签时发生错误');
    }
  }

  async getTagById(tagId: string): Promise<Tag | undefined> {
    try {
      const result = await this.db.select().from(tags).where(eq(tags.id, tagId)).all();
      const tag = result[0];
      
      if (!tag) return undefined;
      
      return {
        ...tag,
        isActive: Boolean(tag.isActive),
        createdAt: new Date(tag.createdAt),
        updatedAt: new Date(tag.updatedAt),
      };
    } catch (error) {
      console.error('获取标签详情失败:', error);
      return undefined;
    }
  }

  async updateTag(tagId: string, data: Partial<Tag>): Promise<Tag | undefined> {
    try {
      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };

      if (data.name) updateData.name = data.name.trim();
      if (data.slug) updateData.slug = data.slug.trim();
      if (data.color !== undefined) updateData.color = data.color?.trim();
      if (data.description !== undefined) updateData.description = data.description?.trim();
      if (data.isActive !== undefined) updateData.isActive = data.isActive ? 1 : 0;

      await this.db.update(tags).set(updateData).where(eq(tags.id, tagId));
      
      return this.getTagById(tagId);
    } catch (error) {
      console.error('更新标签失败:', error);
      throw new Error('更新标签时发生错误');
    }
  }

  async deleteTag(tagId: string): Promise<void> {
    try {
      await this.db.delete(tags).where(eq(tags.id, tagId));
    } catch (error) {
      console.error('删除标签失败:', error);
      throw new Error('删除标签时发生错误');
    }
  }

  // === 漫画分类/标签关联 ===

  async assignCategoriesToComic(comicId: string, categoryIds: string[]): Promise<void> {
    try {
      // 先删除现有关联
      await this.db.delete(comicCategories).where(eq(comicCategories.comicId, comicId));
      
      // 添加新关联
      if (categoryIds.length > 0) {
        const insertData = categoryIds.map(categoryId => ({
          comicId,
          categoryId,
          createdAt: new Date().toISOString(),
        }));
        
        await this.db.insert(comicCategories).values(insertData);
      }
    } catch (error) {
      console.error('分配漫画分类失败:', error);
      throw new Error('分配漫画分类时发生错误');
    }
  }

  async assignTagsToComic(comicId: string, tagIds: string[]): Promise<void> {
    try {
      // 先删除现有关联
      await this.db.delete(comicTags).where(eq(comicTags.comicId, comicId));
      
      // 添加新关联
      if (tagIds.length > 0) {
        const insertData = tagIds.map(tagId => ({
          comicId,
          tagId,
          createdAt: new Date().toISOString(),
        }));
        
        await this.db.insert(comicTags).values(insertData);
        
        // 更新标签使用计数
        for (const tagId of tagIds) {
          await this.db.update(tags)
            .set({ usageCount: sql`${tags.usageCount} + 1` })
            .where(eq(tags.id, tagId));
        }
      }
    } catch (error) {
      console.error('分配漫画标签失败:', error);
      throw new Error('分配漫画标签时发生错误');
    }
  }

  async getComicCategories(comicId: string): Promise<Category[]> {
    try {
      const result = await this.db
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description,
          coverImageUrl: categories.coverImageUrl,
          parentId: categories.parentId,
          sortOrder: categories.sortOrder,
          isActive: categories.isActive,
          createdAt: categories.createdAt,
          updatedAt: categories.updatedAt,
        })
        .from(comicCategories)
        .innerJoin(categories, eq(comicCategories.categoryId, categories.id))
        .where(eq(comicCategories.comicId, comicId))
        .all();
      
      return result.map(cat => ({
        ...cat,
        isActive: Boolean(cat.isActive),
        createdAt: new Date(cat.createdAt),
        updatedAt: new Date(cat.updatedAt),
      }));
    } catch (error) {
      console.error('获取漫画分类失败:', error);
      return [];
    }
  }

  async getComicTags(comicId: string): Promise<Tag[]> {
    try {
      const result = await this.db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
          color: tags.color,
          description: tags.description,
          usageCount: tags.usageCount,
          isActive: tags.isActive,
          createdAt: tags.createdAt,
          updatedAt: tags.updatedAt,
        })
        .from(comicTags)
        .innerJoin(tags, eq(comicTags.tagId, tags.id))
        .where(eq(comicTags.comicId, comicId))
        .all();
      
      return result.map(tag => ({
        ...tag,
        isActive: Boolean(tag.isActive),
        createdAt: new Date(tag.createdAt),
        updatedAt: new Date(tag.updatedAt),
      }));
    } catch (error) {
      console.error('获取漫画标签失败:', error);
      return [];
    }
  }
}
