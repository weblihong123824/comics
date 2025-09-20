import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Eye, Heart, Share, Lock, Play } from 'lucide-react';
import type { Comic, Chapter, User } from '@comic/shared-types';
import { Button } from '@comic/ui-components';

export const ComicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [comic, setComic] = useState<Comic | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [purchasedChapters, setPurchasedChapters] = useState<Set<string>>(new Set());
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'full' | 'chapter'>('full');
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  useEffect(() => {
    // Mock data - 实际中会从API获取
    const mockComic: Comic = {
      id: id!,
      title: '恋爱日常',
      description: '这是一个关于高中生纯真爱情的故事。男主角是一个普通的高中生，偶然间遇到了转学生女主角，从此开始了一段青春甜蜜的恋爱之旅。故事充满了校园生活的温馨和青春期的懵懂情感，让人回忆起那些美好的学生时代。',
      cover: 'https://picsum.photos/300/400?random=1',
      author: '知名作者',
      status: 'ongoing',
      category: ['恋爱', '校园', '日常'],
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
    };

    const mockChapters: Chapter[] = [
      {
        id: '1',
        comicId: id!,
        chapterNumber: 1,
        title: '第一话：初次相遇',
        pageCount: 20,
        isFree: true,
        isPublished: true,
        publishedAt: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        comicId: id!,
        chapterNumber: 2,
        title: '第二话：意外的邂逅',
        pageCount: 18,
        isFree: true,
        isPublished: true,
        publishedAt: new Date('2024-01-03'),
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      },
      {
        id: '3',
        comicId: id!,
        chapterNumber: 3,
        title: '第三话：心动的感觉',
        pageCount: 22,
        isFree: true,
        isPublished: true,
        publishedAt: new Date('2024-01-05'),
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
      },
      {
        id: '4',
        comicId: id!,
        chapterNumber: 4,
        title: '第四话：告白的勇气',
        pageCount: 19,
        isFree: false,
        isPublished: true,
        publishedAt: new Date('2024-01-08'),
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-08'),
      },
      {
        id: '5',
        comicId: id!,
        chapterNumber: 5,
        title: '第五话：甜蜜的约会',
        pageCount: 21,
        isFree: false,
        isPublished: true,
        publishedAt: new Date('2024-01-12'),
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12'),
      },
    ];

    setTimeout(() => {
      setComic(mockComic);
      setChapters(mockChapters);
      setLoading(false);
      // 模拟用户状态
      setIsFavorited(Math.random() > 0.5);
      setIsPurchased(Math.random() > 0.7);
    }, 800);
  }, [id]);

  const handlePurchase = (type: 'full' | 'chapter' = 'full', chapter?: Chapter) => {
    setPurchaseType(type);
    setSelectedChapter(chapter || null);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = () => {
    if (purchaseType === 'full') {
      // 购买整部漫画
      setIsPurchased(true);
    } else if (selectedChapter) {
      // 购买单章节
      setPurchasedChapters(prev => new Set([...prev, selectedChapter.id]));
    }
    setShowPurchaseModal(false);
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
        <div className="bg-white dark:bg-gray-800 p-4">
          <div className="bg-gray-300 dark:bg-gray-600 h-6 w-6 rounded mb-4" />
          <div className="flex space-x-4">
            <div className="bg-gray-300 dark:bg-gray-600 w-24 h-32 rounded-lg" />
            <div className="flex-1 space-y-3">
              <div className="bg-gray-300 dark:bg-gray-600 h-6 rounded" />
              <div className="bg-gray-300 dark:bg-gray-600 h-4 rounded w-3/4" />
              <div className="bg-gray-300 dark:bg-gray-600 h-4 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!comic) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">漫画不存在</h3>
          <Button onClick={() => navigate('/')}>返回首页</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <div className="bg-white dark:bg-gray-800 p-4 safe-area-top">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-lg ${
                isFavorited 
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <Share size={20} />
            </button>
          </div>
        </div>

        {/* 漫画信息 */}
        <div className="flex space-x-4">
          <img
            src={comic.cover}
            alt={comic.title}
            className="w-24 h-32 object-cover rounded-lg shadow-md"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {comic.title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              作者：{comic.author}
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <span className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-400" />
                {comic.rating}
              </span>
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {comic.viewCount > 10000 ? `${(comic.viewCount / 10000).toFixed(1)}万` : comic.viewCount}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                comic.status === 'completed' 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              }`}>
                {comic.status === 'completed' ? '完结' : '连载中'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {comic.category.map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 简介 */}
      <div className="bg-white dark:bg-gray-800 mt-2 p-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">简介</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {comic.description}
        </p>
      </div>

      {/* 购买信息 */}
      {!isPurchased && comic.price > 0 && (
        <div className="bg-white dark:bg-gray-800 mt-2 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                前 {comic.freeChapters} 章免费试读
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ¥{(comic.price / 100).toFixed(2)} 解锁全部章节
              </p>
            </div>
            <Button onClick={handlePurchase} className="bg-orange-500 hover:bg-orange-600">
              立即购买
            </Button>
          </div>
        </div>
      )}

      {/* 章节列表 */}
      <div className="bg-white dark:bg-gray-800 mt-2 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900 dark:text-white">
            章节列表 ({chapters.length})
          </h3>
          <button className="text-sm text-blue-600 dark:text-blue-400">
            排序
          </button>
        </div>

        <div className="space-y-2">
          {chapters.map((chapter) => {
            const canRead = chapter.isFree || isPurchased || purchasedChapters.has(chapter.id);
            const chapterPrice = 299; // 单章节价格，实际应该从API获取
            
            return (
              <div
                key={chapter.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  canRead
                    ? 'border-gray-200 dark:border-gray-700'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <Link
                  to={canRead ? `/comic/${comic.id}/chapter/${chapter.chapterNumber}` : '#'}
                  onClick={!canRead ? (e) => e.preventDefault() : undefined}
                  className={`flex items-center space-x-3 flex-1 ${
                    canRead ? 'hover:bg-gray-50 dark:hover:bg-gray-700 -m-3 p-3 rounded-lg' : ''
                  }`}
                >
                  {!canRead && <Lock size={16} className="text-gray-400" />}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {chapter.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {chapter.pageCount}页 • {chapter.publishedAt?.toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                
                <div className="flex items-center space-x-2">
                  {chapter.isFree && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                      免费
                    </span>
                  )}
                  {!canRead && !chapter.isFree && (
                    <button
                      onClick={() => handlePurchase('chapter', chapter)}
                      className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      ¥{(chapterPrice / 100).toFixed(2)}
                    </button>
                  )}
                  {canRead && <Play size={16} className="text-gray-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 购买确认弹窗 */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              购买确认
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {purchaseType === 'full' ? (
                `确定要花费 ¥${(comic.price / 100).toFixed(2)} 购买《${comic.title}》的全部章节吗？`
              ) : (
                `确定要花费 ¥2.99 购买《${selectedChapter?.title}》吗？`
              )}
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                onClick={confirmPurchase}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                确认购买
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
