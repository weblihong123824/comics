import type { Database } from './index';
import { users, comics, chapters, pages, userComics, orders } from './schema';
import { createId } from '../utils/id';

export async function seed(db: Database) {
  console.log('开始数据库种子数据填充...');

  // 清除现有数据（注意外键约束的顺序）
  await db.delete(orders);
  await db.delete(userComics);
  await db.delete(pages);
  await db.delete(chapters);
  await db.delete(comics);
  await db.delete(users);

  console.log('已清除现有数据');

  // 创建测试用户
  const user1Id = createId('user');
  const user2Id = createId('user');
  const adminId = createId('user');

  await db.insert(users).values([
    {
      id: user1Id,
      username: 'testuser1',
      email: 'user1@example.com',
      passwordHash: '$2a$10$hashedpassword1', // 实际应用中需要正确的哈希
      balance: 1000,
      isVip: true,
      vipExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: user2Id,
      username: 'testuser2',
      email: 'user2@example.com',
      passwordHash: '$2a$10$hashedpassword2',
      balance: 500,
      isVip: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: adminId,
      username: 'admin',
      email: 'admin@comic.com',
      passwordHash: '$2a$10$hashedpasswordadmin',
      balance: 10000,
      isVip: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  console.log('已创建测试用户');

  // 创建测试漫画
  const comic1Id = createId('comic');
  const comic2Id = createId('comic');
  const comic3Id = createId('comic');

  // 创建漫画1
  await db.insert(comics).values({
    id: comic1Id,
    title: '英雄联盟：源计划',
    author: 'Riot Games',
    description: '探索源计划宇宙的起源和英雄们的命运。在这个充满科幻色彩的世界中，机械与魔法交融，英雄们为了保护世界而战。',
    coverImageUrl: '/covers/project_lol.jpg',
    status: 'ongoing',
    genre: JSON.stringify(['科幻', '动作', '冒险']),
    tags: JSON.stringify(['英雄联盟', '机甲', '热血']),
    views: 15420,
    likes: 1203,
    freeChapters: 3,
    price: 150,
    lastChapterUpdate: new Date().toISOString(),
    hasUpdates: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // 创建漫画2
  await db.insert(comics).values({
    id: comic2Id,
    title: '星际争霸：虫群之心',
    author: 'Blizzard Entertainment',
    description: '凯瑞甘的复仇之路，虫群的崛起。一个关于背叛、救赎和复仇的史诗故事。',
    coverImageUrl: '/covers/starcraft_swarm.jpg',
    status: 'completed',
    genre: JSON.stringify(['科幻', '战争', '史诗']),
    tags: JSON.stringify(['星际争霸', '虫族', '史诗']),
    views: 28350,
    likes: 2156,
    freeChapters: 2,
    price: 200,
    hasUpdates: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // 创建漫画3
  await db.insert(comics).values({
    id: comic3Id,
    title: '赛博朋克2077：夜之城传说',
    author: 'CD Projekt RED',
    description: '在赛博朋克的世界中，探索夜之城的黑暗秘密，体验科技与人性的冲突。',
    coverImageUrl: '/covers/cyberpunk_2077.jpg',
    status: 'ongoing',
    genre: JSON.stringify(['赛博朋克', '科幻', '动作']),
    tags: JSON.stringify(['赛博朋克', '未来', '黑暗']),
    views: 8750,
    likes: 654,
    freeChapters: 1,
    price: 120,
    lastChapterUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    hasUpdates: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  });

  console.log('已创建测试漫画');

  // 为漫画1创建章节
  const chapter1_1Id = createId('chapter');
  const chapter1_2Id = createId('chapter');
  const chapter1_3Id = createId('chapter');
  const chapter1_4Id = createId('chapter');

  await db.insert(chapters).values([
    {
      id: chapter1_1Id,
      comicId: comic1Id,
      chapterNumber: 1,
      title: '第一章：觉醒',
      pageCount: 15,
      isFree: true,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: chapter1_2Id,
      comicId: comic1Id,
      chapterNumber: 2,
      title: '第二章：集结',
      pageCount: 18,
      isFree: true,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: chapter1_3Id,
      comicId: comic1Id,
      chapterNumber: 3,
      title: '第三章：冲突',
      pageCount: 22,
      isFree: true,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: chapter1_4Id,
      comicId: comic1Id,
      chapterNumber: 4,
      title: '第四章：反击',
      pageCount: 20,
      isFree: false,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  console.log('已创建章节');

  // 为第一章创建示例页面
  const pages1 = Array.from({ length: 5 }, (_, i) => ({
    id: createId('page'),
    chapterId: chapter1_1Id,
    pageNumber: i + 1,
    imageUrl: `/pages/comic1/chapter1/page${i + 1}.jpg`,
    createdAt: new Date().toISOString(),
  }));

  await db.insert(pages).values(pages1);

  console.log('已创建示例页面');

  // 创建用户漫画关系
  await db.insert(userComics).values([
    {
      userId: user1Id,
      comicId: comic1Id,
      isFavorited: true,
      lastReadChapterId: chapter1_3Id,
      lastReadPageNumber: 15,
      lastReadAt: new Date().toISOString(),
    },
    {
      userId: user2Id,
      comicId: comic2Id,
      purchasedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      isFavorited: true,
    },
    {
      userId: user1Id,
      comicId: comic3Id,
      isFavorited: false,
      lastReadChapterId: null,
      lastReadPageNumber: null,
      lastReadAt: null,
    },
  ]);

  console.log('已创建用户漫画关系');

  // 创建测试订单
  await db.insert(orders).values([
    {
      id: createId('order'),
      userId: user2Id,
      comicId: comic2Id,
      amount: 200,
      status: 'completed',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: createId('order'),
      userId: user1Id,
      comicId: comic1Id,
      amount: 150,
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null,
    },
  ]);

  console.log('已创建测试订单');
  console.log('数据库种子数据填充完成！');
}
