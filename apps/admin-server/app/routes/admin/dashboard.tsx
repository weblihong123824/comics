import { json, useLoaderData } from 'react-router';
import { BookOpen, Users, TrendingUp, Eye } from 'lucide-react';
import { createDatabase } from '../../db';
import { ComicService } from '../../services/comic.service';
import AdminLayout from '../../components/admin/AdminLayout';
// import type { Route } from './+types/dashboard';

interface Env {
  DB: any;
}

export async function loader({ context }: any) {
  const env = context.cloudflare.env as Env;
  const db = createDatabase(env);
  const comicService = new ComicService(db);
  
  const stats = await comicService.getComicStats();
  const { comics: recentComics } = await comicService.getComics({ limit: 5 });
  
  return json({ stats, recentComics });
}

export default function Dashboard() {
  const { stats, recentComics } = useLoaderData<typeof loader>();

  const statCards = [
    {
      title: '总漫画数',
      value: stats.totalComics,
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      title: '连载中',
      value: stats.ongoingComics,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: '总章节数',
      value: stats.totalChapters,
      icon: BookOpen,
      color: 'bg-purple-500',
    },
    {
      title: '总阅读量',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'bg-orange-500',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          管理仪表板
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          欢迎回来！这里是您的漫画管理概览
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 text-opacity-80 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 最近更新的漫画 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            最近更新的漫画
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  漫画
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  作者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  阅读量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  更新时间
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {recentComics.map((comic) => (
                <tr key={comic.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-lg object-cover"
                        src={comic.coverImageUrl}
                        alt={comic.title}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {comic.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {comic.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        comic.status === 'ongoing'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {comic.status === 'ongoing' ? '连载中' : '已完结'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {comic.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(comic.updatedAt).toLocaleDateString('zh-CN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
}
