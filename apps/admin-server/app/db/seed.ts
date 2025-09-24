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
  const testUsers = [
    {
      id: createId('user'),
      username: 'admin',
      email: 'admin@comic.com',
      passwordHash: 'admin123', // 简化的密码，生产环境应该加密
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isVip: true,
      vipExpiresAt: null, // 永久VIP
      balance: 10000,
    },
    {
      id: createId('user'),
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: '$2b$10$K8BQC8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8', // password: test123
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isVip: true,
      vipExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后过期
      balance: 1000,
    },
    {
      id: createId('user'),
      username: 'reader',
      email: 'reader@example.com',
      passwordHash: '$2b$10$K8BQC8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8W8', // password: reader123
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isVip: false,
      vipExpiresAt: null,
      balance: 500,
    },
  ];

  await db.insert(users).values(testUsers);
  console.log('已创建测试用户');

  // 创建测试漫画
  const testComics = [
    {
      id: createId('comic'),
      title: '进击的巨人',
      author: '谏山创',
      description: '在一个被巨人威胁的世界里，人类为了生存而战斗的故事。',
      coverImageUrl: '/uploads/cover/attack-on-titan.jpg',
      status: 'completed' as const,
      genre: JSON.stringify(['动作', '剧情', '奇幻']),
      tags: JSON.stringify(['热血', '战斗', '悬疑']),
      views: 15420,
      likes: 2341,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastChapterUpdate: new Date().toISOString(),
      hasUpdates: false,
      freeChapters: 3,
      price: 999,
      isRecommended: true,
      sortOrder: 1,
    },
    {
      id: createId('comic'),
      title: '鬼灭之刃',
      author: '吾峠呼世晴',
      description: '少年炭治郎为了拯救变成鬼的妹妹而踏上斩鬼之路。',
      coverImageUrl: '/uploads/cover/demon-slayer.jpg',
      status: 'completed' as const,
      genre: JSON.stringify(['动作', '超自然', '历史']),
      tags: JSON.stringify(['热血', '兄妹情', '成长']),
      views: 18750,
      likes: 3102,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastChapterUpdate: new Date().toISOString(),
      hasUpdates: false,
      freeChapters: 5,
      price: 1299,
      isRecommended: true,
      sortOrder: 2,
    },
    {
      id: createId('comic'),
      title: '我的英雄学院',
      author: '堀越耕平',
      description: '在一个超能力普及的世界里，少年绿谷出久追求成为英雄的故事。',
      coverImageUrl: '/uploads/cover/my-hero-academia.jpg',
      status: 'ongoing' as const,
      genre: JSON.stringify(['动作', '超级英雄', '学园']),
      tags: JSON.stringify(['热血', '友情', '成长', '超能力']),
      views: 12890,
      likes: 1876,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastChapterUpdate: new Date().toISOString(),
      hasUpdates: true,
      freeChapters: 2,
      price: 899,
      isRecommended: false,
      sortOrder: 3,
    },
    {
      id: createId('comic'),
      title: '一拳超人',
      author: 'ONE',
      description: '埼玉是一个能够一拳击败任何敌人的超级英雄，但他对此感到无聊。',
      coverImageUrl: '/uploads/cover/one-punch-man.jpg',
      status: 'ongoing' as const,
      genre: JSON.stringify(['动作', '喜剧', '超级英雄']),
      tags: JSON.stringify(['搞笑', '无敌', '英雄']),
      views: 9876,
      likes: 1543,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastChapterUpdate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天前
      hasUpdates: false,
      freeChapters: 1,
      price: 699,
      isRecommended: false,
      sortOrder: 4,
    },
  ];

  await db.insert(comics).values(testComics);
  console.log('已创建测试漫画');

  // 为每个漫画创建章节
  for (const comic of testComics) {
    const chapterCount = comic.title === '进击的巨人' ? 139 : 
                       comic.title === '鬼灭之刃' ? 205 : 
                       comic.title === '我的英雄学院' ? 380 : 150;
    
    const chapters = [];
    for (let i = 1; i <= Math.min(chapterCount, 10); i++) { // 只创建前10章作为示例
      chapters.push({
        id: createId('chapter'),
        comicId: comic.id,
        chapterNumber: i,
        title: `第${i}话`,
        pageCount: Math.floor(Math.random() * 20) + 15, // 15-35页
        createdAt: new Date(Date.now() - (chapterCount - i) * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - (chapterCount - i) * 24 * 60 * 60 * 1000).toISOString(),
        isFree: i <= comic.freeChapters,
        isPublished: true,
      });
    }
    
    await db.insert(chapters).values(chapters);
  }
  console.log('已创建章节');

  // 为每个章节创建示例页面
  const allChapters = await db.select().from(chapters).all();
  for (const chapter of allChapters.slice(0, 5)) { // 只为前5个章节创建页面
    const pages = [];
    for (let i = 1; i <= chapter.pageCount; i++) {
      pages.push({
        id: createId('page'),
        chapterId: chapter.id,
        pageNumber: i,
        imageUrl: `/uploads/page/chapter-${chapter.chapterNumber}-page-${i}.jpg`,
        thumbnailUrl: `/uploads/page/thumb-chapter-${chapter.chapterNumber}-page-${i}.jpg`,
        createdAt: new Date().toISOString(),
      });
    }
    await db.insert(pages).values(pages);
  }
  console.log('已创建示例页面');

  // 创建用户漫画关系
  const userComicRelations = [
    {
      userId: testUsers[0].id, // admin
      comicId: testComics[0].id, // 进击的巨人
      isFavorited: true,
      lastReadChapterId: null,
      lastReadPageNumber: null,
      lastReadAt: null,
      purchasedAt: new Date().toISOString(),
      rating: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      userId: testUsers[1].id, // testuser
      comicId: testComics[1].id, // 鬼灭之刃
      isFavorited: true,
      lastReadChapterId: null,
      lastReadPageNumber: 10,
      lastReadAt: new Date().toISOString(),
      purchasedAt: new Date().toISOString(),
      rating: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      userId: testUsers[2].id, // reader
      comicId: testComics[2].id, // 我的英雄学院
      isFavorited: false,
      lastReadChapterId: null,
      lastReadPageNumber: 5,
      lastReadAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2天前
      purchasedAt: null,
      rating: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  await db.insert(userComics).values(userComicRelations);
  console.log('已创建用户漫画关系');

  // 创建测试订单
  const testOrders = [
    {
      id: createId('order'),
      userId: testUsers[0].id,
      comicId: testComics[0].id,
      chapterId: null,
      amount: 999,
      type: 'comic' as const,
      status: 'completed' as const,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      orderNumber: 'ORD-' + Date.now(),
      itemId: testComics[0].id,
      itemTitle: testComics[0].title,
      originalAmount: 999,
      discountAmount: 0,
      paymentMethod: 'credits',
      transactionId: 'TXN-' + Date.now(),
      cancelledAt: null,
      refundedAt: null,
      metadata: JSON.stringify({ source: 'web' }),
    },
  ];

  await db.insert(orders).values(testOrders);
  console.log('已创建测试订单');
  console.log('数据库种子数据填充完成！');
}


