import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Page, Chapter } from '@comic/shared-types';

export const ComicReader: React.FC = () => {
  const { id, chapterNumber } = useParams<{ id: string; chapterNumber: string }>();
  const navigate = useNavigate();
  
  const [pages, setPages] = useState<Page[]>([]);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [readingMode, setReadingMode] = useState<'vertical' | 'horizontal'>('vertical');
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [targetChapter, setTargetChapter] = useState<Chapter | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Mock data - 实际中会从API获取
    const mockChapter: Chapter = {
      id: chapterNumber!,
      comicId: id!,
      chapterNumber: parseInt(chapterNumber!),
      title: `第${chapterNumber}话：初次相遇`,
      pageCount: 15,
      isFree: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockPages: Page[] = Array.from({ length: 15 }, (_, i) => ({
      id: `page-${i + 1}`,
      chapterId: chapterNumber!,
      pageNumber: i + 1,
      imageUrl: `https://picsum.photos/800/1200?random=${i + 1}`,
      createdAt: new Date(),
    }));

    // Mock 所有章节数据
    const mockAllChapters: Chapter[] = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      comicId: id!,
      chapterNumber: i + 1,
      title: `第${i + 1}话：故事继续`,
      pageCount: 15,
      isFree: i < 3, // 前3章免费
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    setTimeout(() => {
      setChapter(mockChapter);
      setPages(mockPages);
      setAllChapters(mockAllChapters);
      setLoading(false);
    }, 500);
  }, [id, chapterNumber]);

  // 自动隐藏控制栏
  useEffect(() => {
    const resetTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const handleUserActivity = () => {
      resetTimeout();
    };

    document.addEventListener('touchstart', handleUserActivity);
    document.addEventListener('click', handleUserActivity);
    resetTimeout();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      document.removeEventListener('touchstart', handleUserActivity);
      document.removeEventListener('click', handleUserActivity);
    };
  }, []);

  // 监听滚动位置更新当前页
  useEffect(() => {
    if (readingMode !== 'vertical') return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const windowHeight = container.clientHeight;
      
      // 计算当前显示的页面
      let currentPageIndex = 1;
      const pageElements = container.querySelectorAll('.comic-page');
      
      pageElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        if (rect.top <= containerRect.top + windowHeight / 2 && 
            rect.bottom >= containerRect.top + windowHeight / 2) {
          currentPageIndex = index + 1;
        }
      });
      
      setCurrentPage(currentPageIndex);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [readingMode]);

  const goToPage = (pageNumber: number) => {
    if (readingMode === 'vertical' && containerRef.current) {
      const pageElement = containerRef.current.querySelector(`[data-page="${pageNumber}"]`);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setCurrentPage(pageNumber);
    }
  };

  const nextPage = () => {
    if (currentPage < pages.length) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // 章节导航
  const currentChapterIndex = allChapters.findIndex(ch => ch.chapterNumber === parseInt(chapterNumber!));
  const prevChapter = currentChapterIndex > 0 ? allChapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < allChapters.length - 1 ? allChapters[currentChapterIndex + 1] : null;

  const goToPrevChapter = () => {
    if (prevChapter) {
      navigate(`/comic/${id}/chapter/${prevChapter.chapterNumber}`);
    }
  };

  const goToNextChapter = () => {
    if (nextChapter) {
      // 检查下一章是否需要付费
      const canRead = nextChapter.isFree; // 这里应该检查用户是否已购买
      if (canRead) {
        navigate(`/comic/${id}/chapter/${nextChapter.chapterNumber}`);
      } else {
        // 显示付费弹窗
        setTargetChapter(nextChapter);
        setShowPaymentModal(true);
      }
    }
  };

  const handlePurchaseChapter = () => {
    // 处理章节购买逻辑
    if (targetChapter) {
      // 这里应该调用购买API
      console.log('购买章节:', targetChapter.title);
      // 购买成功后跳转
      navigate(`/comic/${id}/chapter/${targetChapter.chapterNumber}`);
      setShowPaymentModal(false);
      setTargetChapter(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* 顶部控制栏 */}
      <div className={`fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 z-20 transition-transform duration-300 safe-area-top ${
        showControls ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/comic/${id}`)}
            className="p-2 text-white hover:text-gray-300"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="text-center flex-1">
            <h1 className="text-sm font-medium">{chapter?.title}</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-white hover:text-gray-300">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 阅读内容 */}
      <div
        ref={containerRef}
        className={`${
          readingMode === 'vertical' 
            ? 'overflow-y-auto h-screen' 
            : 'flex items-center justify-center h-screen overflow-hidden'
        }`}
        style={{ paddingTop: showControls ? '80px' : '0' }}
      >
        {readingMode === 'vertical' ? (
          // 垂直滚动模式
          <div className="space-y-0">
            {pages.map((page) => (
              <div
                key={page.id}
                data-page={page.pageNumber}
                className="comic-page flex justify-center"
              >
                <img
                  src={page.imageUrl}
                  alt={`Page ${page.pageNumber}`}
                  className="max-w-full h-auto"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          // 水平翻页模式
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={pages[currentPage - 1]?.imageUrl}
              alt={`Page ${currentPage}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* 翻页区域 */}
            <div className="absolute inset-0 flex">
              <button
                onClick={prevPage}
                className="flex-1 opacity-0 hover:opacity-20 hover:bg-white/10 transition-opacity"
                disabled={currentPage <= 1}
              />
              <button
                onClick={nextPage}
                className="flex-1 opacity-0 hover:opacity-20 hover:bg-white/10 transition-opacity"
                disabled={currentPage >= pages.length}
              />
            </div>
          </div>
        )}
      </div>

      {/* 底部控制栏 - 简化版 */}
      <div className={`fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 z-20 transition-transform duration-300 safe-area-bottom ${
        showControls ? 'translate-y-0' : 'translate-y-full'
      }`}>
        {/* 章节导航 */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrevChapter}
            disabled={!prevChapter}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
            <span className="text-sm">
              {prevChapter ? `上一章` : '已是第一章'}
            </span>
          </button>
          
          <div className="text-center">
            <div className="text-sm font-medium text-white">{chapter?.title}</div>
          </div>
          
          <button
            onClick={goToNextChapter}
            disabled={!nextChapter}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm">
              {nextChapter ? `下一章` : '已是最后章'}
            </span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* 章节付费弹窗 */}
      {showPaymentModal && targetChapter && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-30">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-2">解锁章节</h3>
              <p className="text-gray-300 mb-4">
                《{targetChapter.title}》需要付费解锁
              </p>
              <div className="text-2xl font-bold text-blue-400 mb-6">
                ¥2.99
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setTargetChapter(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handlePurchaseChapter}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  立即购买
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 章节完成导航 */}
      {(currentPage >= pages.length) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-30">
          <div className="bg-gray-800 rounded-xl p-6 text-center max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-2 text-white">本章节已读完</h3>
            <p className="text-gray-400 text-sm mb-6">
              {nextChapter ? `下一章：${nextChapter.title}` : '已是最后一章'}
            </p>
            {nextChapter && !nextChapter.isFree && (
              <div className="text-blue-400 text-sm mb-4">
                下一章需要付费解锁 ¥2.99
              </div>
            )}
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/comic/${id}`)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
              >
                返回详情
              </button>
              {nextChapter ? (
                <button
                  onClick={goToNextChapter}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    nextChapter.isFree 
                      ? 'bg-blue-600 hover:bg-blue-500' 
                      : 'bg-orange-600 hover:bg-orange-500'
                  }`}
                >
                  {nextChapter.isFree ? '下一章' : '购买下一章'}
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/comic/${id}`)}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                >
                  完结撒花
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
