// Comic System Types

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  isVip: boolean;
  vipExpiresAt?: Date;
  balance: number; // 用户积分余额
}

export interface Comic {
  id: string;
  title: string;
  author: string;
  description: string;
  cover: string; // 封面图片URL
  coverImageUrl?: string; // 兼容旧字段
  status: 'ongoing' | 'completed'; // 连载中 | 完结
  genre: string[];
  tags: string[];
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  lastChapterUpdate?: Date; // 最新章节更新时间
  hasUpdates: boolean; // 是否有更新
  freeChapters: number; // 前几章免费
  price: number; // 解锁整部漫画的价格 (积分)
}

export interface Chapter {
  id: string;
  comicId: string;
  chapterNumber: number;
  title: string;
  pageCount: number;
  createdAt: Date;
  updatedAt: Date;
  isFree: boolean; // 是否免费章节
}

export interface Page {
  id: string;
  chapterId: string;
  pageNumber: number;
  imageUrl: string;
  createdAt: Date;
}

export interface UserComic {
  userId: string;
  comicId: string;
  isFavorited: boolean; // 是否收藏
  lastReadChapterId?: string;
  lastReadPageNumber?: number;
  lastReadAt?: Date;
  purchasedAt?: Date; // 购买整部漫画的时间
}

export interface Comment {
  id: string;
  userId: string;
  comicId: string;
  chapterId?: string;
  content: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  comicId: string;
  amount: number; // 支付金额 (积分)
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

// 漫画筛选条件
export interface ComicFilters {
  genre?: string[];
  status?: 'ongoing' | 'completed';
  sortBy?: 'latest' | 'popular' | 'rating';
  search?: string;
}

// 阅读历史
export interface ReadingHistory {
  id: string;
  userId: string;
  comicId: string;
  comic: Comic;
  chapterId: string;
  chapter: Chapter;
  pageNumber: number;
  readAt: Date;
}

// 文件上传进度
export interface UploadProgress {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedSize: number;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

// 文件项
export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  mimeType?: string;
  createdAt: Date;
  updatedAt: Date;
  parentId?: string;
  url?: string;
  thumbnailUrl?: string;
}

// 视图模式
export type ViewMode = 'grid' | 'list';