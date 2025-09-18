import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, Eye, Heart, Clock } from 'lucide-react';
import { Comic, ComicFilters } from '@fun-box/shared-types';

export const ComicList: React.FC = () => {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ComicFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'hot' | 'new' | 'updated'>('all');

  // Mock data - 实际中会从API获取
  useEffect(() => {
    const mockComics: Comic[] = [
      {
        id: '1',
        title: '恋爱日常',
        description: '青春校园恋爱故事，讲述高中生的纯真爱情',
        cover: 'https://picsum.photos/200/280?random=1',
        author: '作者A',
        status: 'ongoing',
        category: ['恋爱', '校园'],
        rating: 9.2,
        viewCount: 125800,
        favoriteCount: 12560,
        freeChapters: 3,
        price: 1999, // 19.99元
        isHot: true,
        isNew: false,
        hasUpdates: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        publishedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        title: '英雄传说',
        description: '奇幻冒险，勇者拯救世界的史诗故事',
        cover: 'https://picsum.photos/200/280?random=2',
        author: '作者B',
        status: 'completed',
        category: ['奇幻', '动作'],
        rating: 8.8,
        viewCount: 89600,
        favoriteCount: 8900,
        freeChapters: 5,
        price: 2999,
        isHot: false,
        isNew: true,
        hasUpdates: false,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        publishedAt: new Date('2024-01-10'),
      },
      {
        id: '3',
        title: '都市异能',
        description: '现代都市背景下的超能力战斗故事',
        cover: 'https://picsum.photos/200/280?random=3',
        author: '作者C',
        status: 'ongoing',
        category: ['都市', '异能'],
        rating: 8.5,
        viewCount: 76400,
        favoriteCount: 7200,
        freeChapters: 2,
        price: 1599,
        isHot: true,
        isNew: false,
        hasUpdates: true,
        createdAt: new Date('2023-12-01'),
        updatedAt: new Date('2024-01-14'),
        publishedAt: new Date('2023-12-01'),
      },
    ];
    
    setTimeout(() => {
      setComics(mockComics);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredComics = comics.filter(comic => {
    if (searchQuery && !comic.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    switch (activeTab) {
      case 'hot':
        return comic.isHot;
      case 'new':
        return comic.isNew;
      case 'updated':
        return comic.hasUpdates;
      default:
        return true;
    }
  });

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'hot', label: '热门' },
    { key: 'new', label: '新作' },
    { key: 'updated', label: '更新' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部搜索 */}
      <div className="bg-white dark:bg-gray-800 p-4 safe-area-top">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="搜索漫画..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* 分类标签 */}
      <div className="bg-white dark:bg-gray-800 px-4 pb-4">
        <div className="flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 漫画列表 */}
      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3 animate-pulse">
                <div className="bg-gray-300 dark:bg-gray-600 rounded-lg aspect-[3/4] mb-3" />
                <div className="bg-gray-300 dark:bg-gray-600 h-4 rounded mb-2" />
                <div className="bg-gray-300 dark:bg-gray-600 h-3 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredComics.map((comic) => (
              <Link
                key={comic.id}
                to={`/comic/${comic.id}`}
                className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* 封面 */}
                <div className="relative mb-3">
                  <img
                    src={comic.cover}
                    alt={comic.title}
                    className="w-full aspect-[3/4] object-cover rounded-lg"
                  />
                  
                  {/* 状态标签 */}
                  <div className="absolute top-2 left-2 flex flex-col space-y-1">
                    {comic.isHot && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        热门
                      </span>
                    )}
                    {comic.isNew && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        新作
                      </span>
                    )}
                    {comic.hasUpdates && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        更新
                      </span>
                    )}
                  </div>

                  {/* 价格 */}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {comic.freeChapters > 0 ? `前${comic.freeChapters}章免费` : '付费'}
                  </div>
                </div>

                {/* 信息 */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate mb-1">
                    {comic.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <Star className="w-3 h-3 mr-1 text-yellow-400" />
                      {comic.rating}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {comic.viewCount > 10000 ? `${(comic.viewCount / 10000).toFixed(1)}万` : comic.viewCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {comic.author}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      comic.status === 'completed' 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                        : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    }`}>
                      {comic.status === 'completed' ? '完结' : '连载'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredComics.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无漫画</h3>
            <p className="text-gray-500 dark:text-gray-400">没有找到符合条件的漫画</p>
          </div>
        )}
      </div>
    </div>
  );
};
