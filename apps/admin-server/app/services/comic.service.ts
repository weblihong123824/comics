import { eq, and, gte, sql, desc, asc } from 'drizzle-orm';
import type { Database } from '../db';
import { comics, chapters, users, userComics, orders, pages } from '../db/schema';
import { createId } from '../utils/id';
import type { Comic, Chapter, Page } from '@comic/shared-types';

export class ComicService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // --- Comic Management ---

  async createComic(data: Omit<Comic, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'hasUpdates'>): Promise<Comic> {
    try {
      // 数据验证
      if (!data.title?.trim()) {
        throw new Error('漫画标题不能为空');
      }
      if (!data.author?.trim()) {
        throw new Error('作者名称不能为空');
      }
      if (!data.description?.trim()) {
        throw new Error('漫画简介不能为空');
      }
      if (!data.coverImageUrl?.trim()) {
        throw new Error('封面图片URL不能为空');
      }

      // 检查标题是否已存在
      const existingComic = await this.db.select()
        .from(comics)
        .where(eq(comics.title, data.title.trim()))
        .all();
      
      if (existingComic.length > 0) {
        throw new Error('该漫画标题已存在，请使用不同的标题');
      }

      const newComicId = createId('comic');
      
      const insertData = {
        id: newComicId,
        title: data.title.trim(),
        author: data.author.trim(),
        description: data.description.trim(),
        coverImageUrl: data.coverImageUrl.trim(),
        status: data.status || 'ongoing',
        genre: JSON.stringify(data.genre || []),
        tags: JSON.stringify(data.tags || []),
        freeChapters: Math.max(0, data.freeChapters || 0),
        price: Math.max(0, data.price || 0),
        views: 0,
        likes: 0,
        hasUpdates: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastChapterUpdate: data.lastChapterUpdate?.toISOString() || null,
      };

      await this.db.insert(comics).values(insertData);
      
      return {
        id: newComicId,
        title: insertData.title,
        author: insertData.author,
        description: insertData.description,
        coverImageUrl: insertData.coverImageUrl,
        status: insertData.status as 'ongoing' | 'completed',
        genre: data.genre || [],
        tags: data.tags || [],
        views: 0,
        likes: 0,
        hasUpdates: false,
        freeChapters: insertData.freeChapters,
        price: insertData.price,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastChapterUpdate: data.lastChapterUpdate,
      };
    } catch (error) {
      // 只在非开发环境或严重错误时输出日志
      if (process.env.NODE_ENV !== 'development' || error instanceof Error && error.message.includes('UNIQUE constraint')) {
        console.error('创建漫画失败:', error);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('创建漫画时发生数据库错误');
    }
  }

  async getComics(filters?: { 
    status?: 'ongoing' | 'completed'; 
    isHot?: boolean; 
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{comics: Comic[], total: number}> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    // 简化查询以避免类型问题
    const allComics = await this.db.select().from(comics).all();
    let filteredComics = allComics;

    // 应用过滤器
    if (filters?.status) {
      filteredComics = filteredComics.filter(comic => comic.status === filters.status);
    }
    if (filters?.isHot) {
      filteredComics = filteredComics.filter(comic => comic.views >= 1000);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredComics = filteredComics.filter(comic => 
        comic.title.toLowerCase().includes(searchLower) ||
        comic.author.toLowerCase().includes(searchLower)
      );
    }

    const total = filteredComics.length;
    const paginatedComics = filteredComics
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(offset, offset + limit);

    const formattedComics = paginatedComics.map(c => ({
      ...c,
      genre: c.genre ? JSON.parse(c.genre) : [],
      tags: c.tags ? JSON.parse(c.tags) : [],
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      lastChapterUpdate: c.lastChapterUpdate ? new Date(c.lastChapterUpdate) : undefined,
    }));

    return { comics: formattedComics, total };
  }

  async getComicById(comicId: string): Promise<Comic | undefined> {
    const result = await this.db.select().from(comics).where(eq(comics.id, comicId)).all();
    const comic = result[0];
    if (!comic) return undefined;
    
    return {
      ...comic,
      genre: comic.genre ? JSON.parse(comic.genre) : [],
      tags: comic.tags ? JSON.parse(comic.tags) : [],
      createdAt: new Date(comic.createdAt),
      updatedAt: new Date(comic.updatedAt),
      lastChapterUpdate: comic.lastChapterUpdate ? new Date(comic.lastChapterUpdate) : undefined,
    };
  }

  async updateComic(comicId: string, data: Partial<Comic>): Promise<Comic | undefined> {
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (data.title) updateData.title = data.title;
    if (data.author) updateData.author = data.author;
    if (data.description) updateData.description = data.description;
    if (data.coverImageUrl) updateData.coverImageUrl = data.coverImageUrl;
    if (data.status) updateData.status = data.status;
    if (data.genre) updateData.genre = JSON.stringify(data.genre);
    if (data.tags) updateData.tags = JSON.stringify(data.tags);
    if (data.freeChapters !== undefined) updateData.freeChapters = data.freeChapters;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.hasUpdates !== undefined) updateData.hasUpdates = data.hasUpdates;
    if (data.lastChapterUpdate) updateData.lastChapterUpdate = data.lastChapterUpdate.toISOString();

    await this.db.update(comics).set(updateData).where(eq(comics.id, comicId));
    
    return this.getComicById(comicId);
  }

  async deleteComic(comicId: string): Promise<void> {
    await this.db.delete(comics).where(eq(comics.id, comicId));
  }

  // --- Chapter Management ---

  async createChapter(data: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'isFree'>, comicFreeChapters: number): Promise<Chapter> {
    const newChapterId = createId('chapter');
    const isFree = data.chapterNumber <= comicFreeChapters;
    
    const insertData = {
      id: newChapterId,
      comicId: data.comicId,
      chapterNumber: data.chapterNumber,
      title: data.title,
      pageCount: data.pageCount,
      isFree,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.db.insert(chapters).values(insertData);
    
    return {
      id: newChapterId,
      comicId: data.comicId,
      chapterNumber: data.chapterNumber,
      title: data.title,
      pageCount: data.pageCount,
      isFree,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getChaptersByComicId(comicId: string): Promise<Chapter[]> {
    const result = await this.db.select()
      .from(chapters)
      .where(eq(chapters.comicId, comicId))
      .all();

    return result
      .map(c => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      }))
      .sort((a, b) => a.chapterNumber - b.chapterNumber);
  }

  async getChapterById(chapterId: string): Promise<Chapter | undefined> {
    const result = await this.db.select().from(chapters).where(eq(chapters.id, chapterId)).all();
    const chapter = result[0];
    if (!chapter) return undefined;
    
    return {
      ...chapter,
      createdAt: new Date(chapter.createdAt),
      updatedAt: new Date(chapter.updatedAt),
    };
  }

  // --- Page Management ---

  async createPage(data: Omit<Page, 'id' | 'createdAt'>): Promise<Page> {
    const newPageId = createId('page');
    
    const insertData = {
      id: newPageId,
      chapterId: data.chapterId,
      pageNumber: data.pageNumber,
      imageUrl: data.imageUrl,
      createdAt: new Date().toISOString(),
    };

    await this.db.insert(pages).values(insertData);
    
    return {
      id: newPageId,
      chapterId: data.chapterId,
      pageNumber: data.pageNumber,
      imageUrl: data.imageUrl,
      createdAt: new Date(),
    };
  }

  async getPagesByChapterId(chapterId: string): Promise<Page[]> {
    const result = await this.db.select()
      .from(pages)
      .where(eq(pages.chapterId, chapterId))
      .all();

    return result
      .map(p => ({
        ...p,
        createdAt: new Date(p.createdAt),
      }))
      .sort((a, b) => a.pageNumber - b.pageNumber);
  }

  // --- Statistics ---

  async getComicStats(): Promise<{
    totalComics: number;
    ongoingComics: number;
    completedComics: number;
    totalChapters: number;
    totalViews: number;
  }> {
    const allComics = await this.db.select().from(comics).all();
    const allChapters = await this.db.select().from(chapters).all();

    const totalComics = allComics.length;
    const ongoingComics = allComics.filter(c => c.status === 'ongoing').length;
    const completedComics = allComics.filter(c => c.status === 'completed').length;
    const totalChapters = allChapters.length;
    const totalViews = allComics.reduce((sum, comic) => sum + (comic.views || 0), 0);

    return {
      totalComics,
      ongoingComics,
      completedComics,
      totalChapters,
      totalViews,
    };
  }
}