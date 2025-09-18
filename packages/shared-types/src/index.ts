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
  coverImageUrl: string;
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