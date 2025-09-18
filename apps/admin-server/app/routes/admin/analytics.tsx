import { json, useLoaderData } from 'react-router';
import { TrendingUp, Eye, BookOpen, Users, DollarSign } from 'lucide-react';
import { createDatabase } from '../../db';
import { sql } from 'drizzle-orm';
import { comics, users, orders, userComics } from '../../db/schema';
// import type { Route } from './+types/analytics';

interface Env {
  DB: any;
}

export async function loader({ context }: any) {
  const env = context.cloudflare.env as Env;
  const db = createDatabase(env);
  
  // 获取基础统计数据
  const [totalRevenue] = await db.select({ sum: sql<number>`sum(amount)` })
    .from(orders)
    .where(sql`status = 'completed'`);
  
  const [totalViews] = await db.select({ sum: sql<number>`sum(views)` }).from(comics);
  const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [totalComics] = await db.select({ count: sql<number>`count(*)` }).from(comics);
  
  // 热门漫画 (按阅读量排序)
  const popularComics = await db.select({
    id: comics.id,
    title: comics.title,
    author: comics.author,
    views: comics.views,
    likes: comics.likes,
    coverImageUrl: comics.coverImageUrl,
  })
  .from(comics)
  .orderBy(sql`views DESC`)
  .limit(10)
  .all();
  
  // 收入统计 (按月)
  const monthlyRevenue = await db.select({
    month: sql<string>`strftime('%Y-%m', created_at)`,
    revenue: sql<number>`sum(amount)`,
    orderCount: sql<number>`count(*)`,
  })
  .from(orders)
  .where(sql`status = 'completed' AND created_at >= date('now', '-12 months')`)
  .groupBy(sql`strftime('%Y-%m', created_at)`)
  .orderBy(sql`month`)
  .all();
  
  // 用户增长统计
  const userGrowth = await db.select({
    month: sql<string>`strftime('%Y-%m', created_at)`,
    newUsers: sql<number>`count(*)`,
  })
  .from(users)
  .where(sql`created_at >= date('now', '-12 months')`)
  .groupBy(sql`strftime('%Y-%m', created_at)`)
  .orderBy(sql`month`)
  .all();
  
  const stats = {
    totalRevenue: totalRevenue.sum || 0,
    totalViews: totalViews.sum || 0,
    totalUsers: totalUsers.count,
    totalComics: totalComics.count,
  };
  
  return json({
    stats,
    popularComics,
    monthlyRevenue,
    userGrowth,
  });
}

export default function Analytics() {
  const { stats, popularComics, monthlyRevenue, userGrowth } = useLoaderData<typeof loader>();

  const statCards = [
    {
      title: '总收入',
      value: `${stats.totalRevenue.toLocaleString()} 积分`,
      icon: DollarSign,
      color: 'bg-green-500',
      trend: '+12.5%',
    },
    {
      title: '总阅读量',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'bg-blue-500',
      trend: '+8.2%',
    },
    {
      title: '用户总数',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-purple-500',
      trend: '+15.3%',
    },
    {
      title: '漫画总数',
      value: stats.totalComics.toLocaleString(),
      icon: BookOpen,
      color: 'bg-orange-500',
      trend: '+5.8%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          数据分析
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          监控平台表现，分析用户行为和收入趋势
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`h-6 w-6 text-opacity-80 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{stat.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 热门漫画排行 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              热门漫画排行
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {popularComics.map((comic, index) => (
                <div key={comic.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                      {index + 1}
                    </span>
                  </div>
                  <img
                    className="w-10 h-12 rounded object-cover"
                    src={comic.coverImageUrl}
                    alt={comic.title}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {comic.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {comic.author}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {comic.views.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      阅读量
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 月度收入趋势 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              月度收入趋势
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {monthlyRevenue.map((item) => (
                <div key={item.month} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.month}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.orderCount} 笔订单
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">
                      {item.revenue.toLocaleString()} 积分
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 用户增长趋势 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            用户增长趋势
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {userGrowth.map((item) => (
              <div key={item.month} className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {item.month}
                </p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  +{item.newUsers}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
