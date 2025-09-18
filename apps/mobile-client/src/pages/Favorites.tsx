import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Eye, Trash2 } from 'lucide-react';
import { Comic } from '@fun-box/shared-types';

export const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    const mockFavorites: Comic[] = [
      {
        id: '1',
        title: '恋爱日常',
        description: '青春校园恋爱故事',
        cover: 'https://picsum.photos/200/280?random=1',
        author: '作者A',
        status: 'ongoing',
        category: ['恋爱', '校园'],
        rating: 9.2,
        viewCount: 125800,
        favoriteCount: 12560,
        freeChapters: 3,
        price: 1999,
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
        description: '奇幻冒险史诗',
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
        isNew: false,
        hasUpdates: false,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        publishedAt: new Date('2024-01-10'),
      },
    ];

    setTimeout(() => {
      setFavorites(mockFavorites);
      setLoading(false);
    }, 800);
  }, []);

  const removeFavorite = (comicId: string) => {
    setFavorites(prev => prev.filter(comic => comic.id !== comicId));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <div className="bg-white dark:bg-gray-800 p-4 safe-area-top">
        <div className="flex items-center justify-between">
          <Link to="/user" className="p-2 text-gray-500 dark:text-gray-400">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">我的收藏</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* 收藏列表 */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
                <div className="flex space-x-4">
                  <div className="bg-gray-300 dark:bg-gray-600 w-16 h-20 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="bg-gray-300 dark:bg-gray-600 h-4 rounded" />
                    <div className="bg-gray-300 dark:bg-gray-600 h-3 rounded w-2/3" />
                    <div className="bg-gray-300 dark:bg-gray-600 h-3 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="space-y-4">
            {favorites.map((comic) => (
              <div key={comic.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <div className="flex space-x-4">
                  <Link to={`/comic/${comic.id}`}>
                    <img
                      src={comic.cover}
                      alt={comic.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <Link to={`/comic/${comic.id}`}>
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {comic.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {comic.author}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
                          <span className="flex items-center">
                            <Star className="w-3 h-3 mr-1 text-yellow-400" />
                            {comic.rating}
                          </span>
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {comic.viewCount > 10000 ? `${(comic.viewCount / 10000).toFixed(1)}万` : comic.viewCount}
                          </span>
                          <span className={`px-2 py-1 rounded-full ${
                            comic.status === 'completed' 
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                              : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          }`}>
                            {comic.status === 'completed' ? '完结' : '连载'}
                          </span>
                        </div>

                        {comic.hasUpdates && (
                          <div className="mt-2">
                            <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
                              有更新
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => removeFavorite(comic.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💝</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无收藏</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              收藏喜欢的漫画，方便随时阅读
            </p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              去发现漫画
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
