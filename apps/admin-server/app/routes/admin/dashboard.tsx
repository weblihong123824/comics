import { useLoaderData, Link } from 'react-router';
import { BookOpen, Users, TrendingUp, Eye } from 'lucide-react';
import { getDatabase } from '../../db/dev';
import { ComicService } from '../../services/comic.service';
// import type { Route } from './+types/dashboard';

export async function loader({ context }: any) {
  const db = getDatabase(context);
  const comicService = new ComicService(db);
  
  const stats = await comicService.getComicStats();
  const { comics: recentComics } = await comicService.getComics({ limit: 5 });
  
  return { stats, recentComics };
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
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">仪表板</h1>
        <p className="text-gray-600 dark:text-gray-400">欢迎回到 Comic 管理后台</p>
      </div>

      {/* 欢迎信息 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">欢迎回来！</h2>
            <p className="text-blue-100">这里是您的漫画管理概览</p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <BookOpen size={32} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp size={16} className="text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">较上月</span>
            </div>
          </div>
        ))}
      </div>

      {/* 最近更新的漫画 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              最近更新的漫画
            </h3>
            <Link 
              to="/admin/comics"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              查看全部
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentComics.length > 0 ? (
            <div className="space-y-4">
              {recentComics.map((comic) => (
                <div key={comic.id} className="flex items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <img
                    className="h-12 w-12 rounded-lg object-cover shadow-sm"
                    src={comic.coverImageUrl || '/placeholder-comic.jpg'}
                    alt={comic.title}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-comic.jpg';
                    }}
                  />
                  <div className="ml-4 flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {comic.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {comic.author}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        comic.status === 'ongoing'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {comic.status === 'ongoing' ? '连载中' : '已完结'}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {comic.views.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        阅读量
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(comic.updatedAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无漫画</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">开始添加您的第一部漫画吧</p>
              <Link
                to="/admin/comics"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                添加漫画
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}