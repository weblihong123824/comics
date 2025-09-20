import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Play } from 'lucide-react';
import type { ReadingHistory as ReadingHistoryType, Comic, Chapter } from '@comic/shared-types';

interface HistoryItem extends ReadingHistoryType {
  comic: Pick<Comic, 'id' | 'title' | 'cover' | 'author'>;
  chapter: Pick<Chapter, 'id' | 'title' | 'chapterNumber'>;
}

export const ReadingHistory: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    const mockHistory: HistoryItem[] = [
      {
        id: '1',
        userId: '1',
        comicId: '1',
        chapterId: '5',
        lastPageNumber: 15,
        readAt: new Date('2024-01-15T14:30:00'),
        comic: {
          id: '1',
          title: '恋爱日常',
          cover: 'https://picsum.photos/200/280?random=1',
          author: '作者A',
        },
        chapter: {
          id: '5',
          title: '第五话：甜蜜的约会',
          chapterNumber: 5,
        },
      },
      {
        id: '2',
        userId: '1',
        comicId: '2',
        chapterId: '12',
        lastPageNumber: 8,
        readAt: new Date('2024-01-14T20:15:00'),
        comic: {
          id: '2',
          title: '英雄传说',
          cover: 'https://picsum.photos/200/280?random=2',
          author: '作者B',
        },
        chapter: {
          id: '12',
          title: '第十二话：最终决战',
          chapterNumber: 12,
        },
      },
      {
        id: '3',
        userId: '1',
        comicId: '3',
        chapterId: '3',
        lastPageNumber: 20,
        readAt: new Date('2024-01-13T16:45:00'),
        comic: {
          id: '3',
          title: '都市异能',
          cover: 'https://picsum.photos/200/280?random=3',
          author: '作者C',
        },
        chapter: {
          id: '3',
          title: '第三话：觉醒的力量',
          chapterNumber: 3,
        },
      },
    ];

    setTimeout(() => {
      setHistory(mockHistory);
      setLoading(false);
    }, 800);
  }, []);

  const formatReadTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays === 0) {
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return diffInMinutes < 1 ? '刚刚' : `${diffInMinutes}分钟前`;
      }
      return `${diffInHours}小时前`;
    } else if (diffInDays === 1) {
      return '昨天';
    } else if (diffInDays < 7) {
      return `${diffInDays}天前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <div className="bg-white dark:bg-gray-800 p-4 safe-area-top">
        <div className="flex items-center justify-between">
          <Link to="/user" className="p-2 text-gray-500 dark:text-gray-400">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">阅读历史</h1>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-sm text-red-600 dark:text-red-400"
            >
              清空
            </button>
          )}
        </div>
      </div>

      {/* 历史列表 */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
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
        ) : history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <div className="flex space-x-4">
                  <Link to={`/comic/${item.comic.id}`}>
                    <img
                      src={item.comic.cover}
                      alt={item.comic.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <Link to={`/comic/${item.comic.id}`}>
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {item.comic.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {item.comic.author}
                        </p>
                        
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <p>读到：{item.chapter.title}</p>
                          <p>第 {item.lastPageNumber} 页</p>
                        </div>

                        <div className="flex items-center mt-3 text-xs text-gray-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatReadTime(item.readAt)}
                        </div>
                      </div>
                      
                      <Link
                        to={`/comic/${item.comic.id}/chapter/${item.chapter.chapterNumber}`}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        继续
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无阅读历史</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              开始阅读漫画，这里会记录您的阅读进度
            </p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              开始阅读
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
