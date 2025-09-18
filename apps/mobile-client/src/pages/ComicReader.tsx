import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Menu } from 'lucide-react';
import { Page, Chapter } from '@fun-box/shared-types';

export const ComicReader: React.FC = () => {
  const { id, chapterNumber } = useParams<{ id: string; chapterNumber: string }>();
  const navigate = useNavigate();
  
  const [pages, setPages] = useState<Page[]>([]);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [readingMode, setReadingMode] = useState<'vertical' | 'horizontal'>('vertical');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Mock data - 实际中会从API获取
    const mockChapter: Chapter = {
      id: '1',
      comicId: id!,
      chapterNumber: parseInt(chapterNumber!),
      title: `第${chapterNumber}话：初次相遇`,
      pageCount: 15,
      isFree: true,
      isPublished: true,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockPages: Page[] = Array.from({ length: 15 }, (_, i) => ({
      id: `page-${i + 1}`,
      chapterId: '1',
      pageNumber: i + 1,
      imageUrl: `https://picsum.photos/800/1200?random=${i + 1}`,
      width: 800,
      height: 1200,
    }));

    setTimeout(() => {
      setChapter(mockChapter);
      setPages(mockPages);
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
            onClick={() => navigate(-1)}
            className="p-2 text-white hover:text-gray-300"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="text-center">
            <h1 className="text-sm font-medium">{chapter?.title}</h1>
            <p className="text-xs text-gray-400">
              {currentPage} / {pages.length}
            </p>
          </div>
          
          <button className="p-2 text-white hover:text-gray-300">
            <Settings size={20} />
          </button>
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

      {/* 底部控制栏 */}
      <div className={`fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 z-20 transition-transform duration-300 safe-area-bottom ${
        showControls ? 'translate-y-0' : 'translate-y-full'
      }`}>
        {/* 进度条 */}
        <div className="mb-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentPage / pages.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>第 {currentPage} 页</span>
            <span>共 {pages.length} 页</span>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setReadingMode(readingMode === 'vertical' ? 'horizontal' : 'vertical')}
              className="p-2 bg-gray-700 rounded-lg"
            >
              <Menu size={16} />
            </button>
            
            <select
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value))}
              className="bg-gray-700 text-white border-none rounded-lg px-3 py-2 text-sm"
            >
              {pages.map((page) => (
                <option key={page.id} value={page.pageNumber}>
                  第 {page.pageNumber} 页
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={nextPage}
            disabled={currentPage >= pages.length}
            className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>

      {/* 章节导航 */}
      {(currentPage >= pages.length) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-30">
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <h3 className="text-lg font-bold mb-4">本章节已读完</h3>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-600 rounded-lg"
              >
                返回详情
              </button>
              <button
                onClick={() => {
                  const nextChapter = parseInt(chapterNumber!) + 1;
                  navigate(`/comic/${id}/chapter/${nextChapter}`);
                }}
                className="px-4 py-2 bg-blue-600 rounded-lg"
              >
                下一章
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
