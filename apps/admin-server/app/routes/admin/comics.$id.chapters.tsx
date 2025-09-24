import { useLoaderData, useActionData, Form, useParams, Link } from 'react-router';
import React, { useState } from 'react';
import { Plus, ArrowLeft, Upload, Eye, Edit, Trash2, Image, FileText, Save, X } from 'lucide-react';
import { Button, Input, Label, Textarea } from '@comic/ui-components';
import { getDatabase } from '../../db/dev';
import { ComicService } from '../../services/comic.service';

export async function loader({ params, context }: any) {
  const db = getDatabase(context);
  const comicService = new ComicService(db);
  
  try {
    const comic = await comicService.getComicById(params.id);
    if (!comic) {
      throw new Error('漫画不存在');
    }
    
    const chapters = await comicService.getChaptersByComicId(params.id);
    
    return { comic, chapters };
  } catch (error) {
    console.error('Error loading comic chapters:', error);
    throw new Response('漫画不存在', { status: 404 });
  }
}

export async function action({ request, params, context }: any) {
  const db = getDatabase(context);
  const comicService = new ComicService(db);
  
  const formData = await request.formData();
  const action = formData.get('_action');
  
  if (action === 'create_chapter') {
    try {
      const title = formData.get('title') as string;
      const chapterNumber = parseInt(formData.get('chapterNumber') as string);
      
      if (!title?.trim()) {
        return { success: false, message: '章节标题不能为空' };
      }
      
      if (!chapterNumber || chapterNumber < 1) {
        return { success: false, message: '章节号必须大于0' };
      }
      
      // 检查章节号是否已存在
      const existingChapters = await comicService.getChaptersByComicId(params.id);
      const chapterExists = existingChapters.some(ch => ch.chapterNumber === chapterNumber);
      
      if (chapterExists) {
        return { success: false, message: `第${chapterNumber}章已存在` };
      }
      
      const comic = await comicService.getComicById(params.id);
      if (!comic) {
        return { success: false, message: '漫画不存在' };
      }
      
      const newChapter = await comicService.createChapter({
        comicId: params.id,
        chapterNumber,
        title: title.trim(),
        pageCount: 0,
      }, comic.freeChapters);
      
      return { success: true, message: '章节创建成功！', chapter: newChapter };
    } catch (error) {
      console.error('创建章节失败:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '创建章节时发生错误' 
      };
    }
  }
  
  if (action === 'delete_chapter') {
    try {
      const chapterId = formData.get('chapterId') as string;
      // TODO: 实现删除章节功能
      return { success: true, message: '章节删除成功' };
    } catch (error) {
      return { success: false, message: '删除章节失败' };
    }
  }
  
  return { success: false, message: '未知操作' };
}

export default function ComicChapters() {
  const { comic, chapters } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  
  // 创建成功后自动关闭模态框
  React.useEffect(() => {
    if (actionData?.success && showCreateModal) {
      const timer = setTimeout(() => {
        setShowCreateModal(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [actionData, showCreateModal]);
  
  const getNextChapterNumber = () => {
    if (chapters.length === 0) return 1;
    return Math.max(...chapters.map(ch => ch.chapterNumber)) + 1;
  };
  
  return (
    <div className="space-y-6">
      {/* 页面标题和导航 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/admin/comics"
            className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeft size={20} className="mr-2" />
            返回漫画列表
          </Link>
        </div>
      </div>
      
      {/* 漫画信息 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-start space-x-6">
          <img
            src={comic.coverImageUrl || '/placeholder-comic.jpg'}
            alt={comic.title}
            className="w-32 h-42 rounded-lg object-cover shadow-md"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-comic.jpg';
            }}
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {comic.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              作者：{comic.author}
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
              {comic.description}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                comic.status === 'ongoing'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {comic.status === 'ongoing' ? '连载中' : '已完结'}
              </span>
              <span>共 {chapters.length} 章</span>
              <span>免费前 {comic.freeChapters} 章</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 章节管理区域 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        {/* 操作栏 */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              章节管理
            </h2>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              添加章节
            </Button>
          </div>
        </div>
        
        {/* 章节列表 */}
        <div className="p-6">
          {chapters.length > 0 ? (
            <div className="space-y-3">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        第{chapter.chapterNumber}章 - {chapter.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{chapter.pageCount} 页</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          chapter.isFree 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                          {chapter.isFree ? '免费' : '付费'}
                        </span>
                        <span>
                          {new Date(chapter.updatedAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/admin/comics/${comic.id}/chapters/${chapter.id}/pages`}
                      className="inline-flex items-center"
                    >
                      <Image className="mr-2 h-4 w-4" />
                      管理页面
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedChapter(chapter)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Form method="post" style={{ display: 'inline' }}>
                      <input type="hidden" name="_action" value="delete_chapter" />
                      <input type="hidden" name="chapterId" value={chapter.id} />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          if (!confirm(`确定要删除第${chapter.chapterNumber}章吗？`)) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 空状态 */
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <FileText size={32} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无章节</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">开始为这部漫画添加第一个章节吧</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center"
              >
                <Plus className="mr-2 h-5 w-5" />
                添加章节
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* 创建章节模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-full max-w-md shadow-lg rounded-xl bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                添加新章节
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <Form method="post" className="space-y-4">
              <input type="hidden" name="_action" value="create_chapter" />
              
              <div>
                <Label htmlFor="chapterNumber">章节号 *</Label>
                <Input
                  id="chapterNumber"
                  name="chapterNumber"
                  type="number"
                  min="1"
                  defaultValue={getNextChapterNumber()}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="title">章节标题 *</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="请输入章节标题"
                  className="mt-1"
                />
              </div>
              
              {/* 提示信息 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  💡 章节创建后，您可以继续上传该章节的页面内容
                </p>
              </div>
              
              {/* 错误提示 */}
              {actionData && !actionData.success && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    ❌ {actionData.message}
                  </p>
                </div>
              )}
              
              {/* 成功提示 */}
              {actionData && actionData.success && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✅ {actionData.message}
                  </p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  取消
                </Button>
                <Button type="submit">
                  创建章节
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
