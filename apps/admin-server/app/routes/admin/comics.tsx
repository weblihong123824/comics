import { useLoaderData, useActionData, Form, useSearchParams } from 'react-router';
import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Upload, Eye, Grid, List, Filter, MoreVertical, Calendar, BookOpen, Settings, DollarSign } from 'lucide-react';
import { Button, Input, Label, Textarea } from '@comic/ui-components';
import { getDatabase } from '../../db/dev';
import { ComicService } from '../../services/comic.service';
// import type { Route } from './+types/comics';

export async function loader({ request, context }: any) {
  const db = getDatabase(context);
  const comicService = new ComicService(db);
  
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const search = url.searchParams.get('search') || '';
  const status = url.searchParams.get('status') as 'ongoing' | 'completed' | undefined;
  
  const { comics, total } = await comicService.getComics({
    page,
    limit: 10,
    search: search || undefined,
    status,
  });
  
  return { comics, total, currentPage: page };
}

export async function action({ request, context }: any) {
  const db = getDatabase(context);
  const comicService = new ComicService(db);
  
  const formData = await request.formData();
  const action = formData.get('_action');
  
  if (action === 'delete') {
    const comicId = formData.get('comicId') as string;
    await comicService.deleteComic(comicId);
    return { success: true, message: '漫画删除成功' };
  }
  
  if (action === 'create') {
    try {
      // 获取表单数据
      const title = formData.get('title') as string;
      const author = formData.get('author') as string;
      const description = formData.get('description') as string;
      const coverImageUrl = formData.get('coverImageUrl') as string;
      const status = formData.get('status') as 'ongoing' | 'completed';
      const genreStr = formData.get('genre') as string;
      const tagsStr = formData.get('tags') as string;
      const freeChapters = parseInt(formData.get('freeChapters') as string || '0');
      const price = parseInt(formData.get('price') as string || '0');

      // 基本验证
      if (!title?.trim()) {
        return { success: false, message: '漫画标题不能为空' };
      }
      if (!author?.trim()) {
        return { success: false, message: '作者名称不能为空' };
      }
      if (!description?.trim()) {
        return { success: false, message: '漫画简介不能为空' };
      }
      if (!coverImageUrl?.trim()) {
        return { success: false, message: '封面图片URL不能为空' };
      }

      // 处理分类和标签
      const genre = genreStr ? genreStr.split(',').map(g => g.trim()).filter(g => g) : [];
      const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];

      const comicData = {
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        coverImageUrl: coverImageUrl.trim(),
        status,
        genre,
        tags,
        freeChapters: Math.max(0, freeChapters),
        price: Math.max(0, price),
      };
      
      const newComic = await comicService.createComic(comicData);
      return { success: true, message: '漫画创建成功！', comic: newComic };
    } catch (error) {
      console.error('创建漫画失败:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '创建漫画时发生未知错误，请稍后重试' 
      };
    }
  }
  
  if (action === 'update_settings') {
    const comicId = formData.get('comicId') as string;
    const updateData = {
      freeChapters: parseInt(formData.get('freeChapters') as string),
      price: parseInt(formData.get('price') as string),
      status: formData.get('status') as 'ongoing' | 'completed',
    };
    
    await comicService.updateComic(comicId, updateData);
    return { success: true, message: '漫画设置更新成功' };
  }
  
  return Response.json({ success: false, message: '未知操作' }, { status: 400 });
}

export default function Comics() {
  const { comics, total, currentPage } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedComic, setSelectedComic] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 创建成功后自动关闭模态框
  React.useEffect(() => {
    if (actionData?.success && showCreateModal) {
      const timer = setTimeout(() => {
        setShowCreateModal(false);
      }, 2000); // 2秒后自动关闭
      return () => clearTimeout(timer);
    }
  }, [actionData, showCreateModal]);
  
  const totalPages = Math.ceil(total / 10);

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const handleSearch = (search: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (search) {
      newParams.set('search', search);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleStatusFilter = (status: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (status && status !== 'all') {
      newParams.set('status', status);
    } else {
      newParams.delete('status');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">漫画管理</h1>
        <p className="text-gray-600 dark:text-gray-400">管理您的漫画作品集</p>
      </div>

      {/* 顶部操作栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="搜索漫画..."
              defaultValue={searchParams.get('search') || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          {/* 状态筛选 */}
          <select
            value={searchParams.get('status') || 'all'}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">全部状态</option>
            <option value="ongoing">连载中</option>
            <option value="completed">已完结</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* 视图切换 */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <List size={16} />
            </button>
          </div>
          
          {/* 添加漫画按钮 */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            上传漫画
          </button>
        </div>
      </div>

      {/* 漫画内容区域 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[600px]">
        <div className="p-6">
          {comics.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                /* 网格视图 - 类似文件管理器 */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {comics.map((comic) => (
                    <div
                      key={comic.id}
                      className="group relative bg-white dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <div className="aspect-[3/4] relative overflow-hidden rounded-t-xl">
                        <img
                          src={comic.coverImageUrl || '/placeholder-comic.jpg'}
                          alt={comic.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-comic.jpg';
                          }}
                        />
                        {/* 状态标签 */}
                        <div className="absolute top-2 left-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              comic.status === 'ongoing'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {comic.status === 'ongoing' ? '连载' : '完结'}
                          </span>
                        </div>
                        {/* 操作按钮 */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex space-x-1">
                            <button 
                              onClick={() => {
                                setSelectedComic(comic);
                                setShowSettingsModal(true);
                              }}
                              className="p-1.5 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                              title="漫画设置"
                            >
                              <Settings size={14} className="text-blue-600" />
                            </button>
                            <button 
                              onClick={() => window.location.href = `/admin/comics/${comic.id}/chapters`}
                              className="p-1.5 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                              title="管理章节"
                            >
                              <BookOpen size={14} className="text-green-600" />
                            </button>
                            <Form method="post" style={{ display: 'inline' }}>
                              <input type="hidden" name="_action" value="delete" />
                              <input type="hidden" name="comicId" value={comic.id} />
                              <button
                                type="submit"
                                className="p-1.5 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                                onClick={(e) => {
                                  if (!confirm('确定要删除这部漫画吗？')) {
                                    e.preventDefault();
                                  }
                                }}
                              >
                                <Trash2 size={14} className="text-red-500" />
                              </button>
                            </Form>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate mb-1">
                          {comic.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
                          {comic.author}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                          <span className="flex items-center">
                            <Eye size={12} className="mr-1" />
                            {comic.views.toLocaleString()}
                          </span>
                          <span>
                            {new Date(comic.updatedAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* 列表视图 */
                <div className="space-y-3">
                  {comics.map((comic) => (
                    <div
                      key={comic.id}
                      className="flex items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-100 dark:border-gray-600"
                    >
                      <img
                        src={comic.coverImageUrl || '/placeholder-comic.jpg'}
                        alt={comic.title}
                        className="w-12 h-16 rounded-lg object-cover shadow-sm"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-comic.jpg';
                        }}
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                              {comic.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {comic.author}
                            </p>
                          </div>
                          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full ${
                                comic.status === 'ongoing'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {comic.status === 'ongoing' ? '连载中' : '已完结'}
                            </span>
                            <span className="flex items-center">
                              <Eye size={14} className="mr-1" />
                              {comic.views.toLocaleString()}
                            </span>
                            <span>
                              {new Date(comic.updatedAt).toLocaleDateString('zh-CN')}
                            </span>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => {
                                  setSelectedComic(comic);
                                  setShowSettingsModal(true);
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="漫画设置"
                              >
                                <Settings size={16} />
                              </button>
                              <button 
                                onClick={() => window.location.href = `/admin/comics/${comic.id}/chapters`}
                                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                title="管理章节"
                              >
                                <BookOpen size={16} />
                              </button>
                              <Form method="post" style={{ display: 'inline' }}>
                                <input type="hidden" name="_action" value="delete" />
                                <input type="hidden" name="comicId" value={comic.id} />
                                <button
                                  type="submit"
                                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                  onClick={(e) => {
                                    if (!confirm('确定要删除这部漫画吗？')) {
                                      e.preventDefault();
                                    }
                                  }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </Form>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* 空状态 */
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <BookOpen size={32} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无漫画</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">开始上传您的第一部漫画作品吧</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="mr-2 h-5 w-5" />
                上传漫画
              </button>
            </div>
          )}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                显示第 {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, total)} 条，
                共 {total} 条记录
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
                >
                  上一页
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 创建漫画模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-xl bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  添加新漫画
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              
              <Form method="post" className="space-y-6">
                <input type="hidden" name="_action" value="create" />
                
                {/* 基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">漫画标题 *</Label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      required
                      placeholder="请输入漫画标题"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="author">作者 *</Label>
                    <Input
                      id="author"
                      name="author"
                      type="text"
                      required
                      placeholder="请输入作者名称"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">漫画简介 *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    placeholder="请输入漫画简介..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="coverImageUrl">封面图片URL *</Label>
                  <Input
                    id="coverImageUrl"
                    name="coverImageUrl"
                    type="url"
                    required
                    placeholder="https://example.com/cover.jpg"
                    className="mt-1"
                  />
                </div>

                {/* 分类和标签 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="genre">分类</Label>
                    <Input
                      id="genre"
                      name="genre"
                      type="text"
                      placeholder="热血,冒险,搞笑 (用逗号分隔)"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">多个分类请用逗号分隔</p>
                  </div>
                  <div>
                    <Label htmlFor="tags">标签</Label>
                    <Input
                      id="tags"
                      name="tags"
                      type="text"
                      placeholder="校园,青春,治愈 (用逗号分隔)"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">多个标签请用逗号分隔</p>
                  </div>
                </div>

                {/* 状态和定价 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="status">连载状态</Label>
                    <select
                      id="status"
                      name="status"
                      className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="ongoing">连载中</option>
                      <option value="completed">已完结</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="freeChapters">免费章节数</Label>
                    <Input
                      id="freeChapters"
                      name="freeChapters"
                      type="number"
                      min="0"
                      max="20"
                      defaultValue="3"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">整部价格（积分）</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      defaultValue="2999"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* 提示信息 */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    💡 创建提示
                  </h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• 封面图片建议尺寸：300x400px，格式：JPG/PNG</li>
                    <li>• 免费章节数决定用户可免费阅读的章节数量</li>
                    <li>• 整部价格为用户一次性解锁所有章节的价格</li>
                    <li>• 单章节价格固定为299积分</li>
                  </ul>
                </div>

                {/* 错误提示 */}
                {actionData && !actionData.success && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      ❌ {actionData.message || '创建失败，请检查输入信息'}
                    </p>
                  </div>
                )}

                {/* 成功提示 */}
                {actionData && actionData.success && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✅ {actionData.message}
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    取消
                  </Button>
                  <Button type="submit">
                    创建漫画
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      )}

      {/* 漫画设置弹窗 */}
      {showSettingsModal && selectedComic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <DollarSign className="mr-3 text-green-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  漫画设置
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  setSelectedComic(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {selectedComic.title}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                作者：{selectedComic.author}
              </p>
            </div>

            <Form method="post" className="space-y-4">
              <input type="hidden" name="_action" value="update_settings" />
              <input type="hidden" name="comicId" value={selectedComic.id} />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="freeChapters">免费章节数</Label>
                  <Input
                    id="freeChapters"
                    name="freeChapters"
                    type="number"
                    defaultValue={selectedComic.freeChapters}
                    min="0"
                    max="20"
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">整部价格（积分）</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    defaultValue={selectedComic.price}
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status">连载状态</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={selectedComic.status}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="ongoing">连载中</option>
                  <option value="completed">已完结</option>
                </select>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  价格说明
                </h5>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• 免费章节：用户可免费阅读</li>
                  <li>• 付费章节：单章 299 积分</li>
                  <li>• 整部购买：一次性解锁所有章节</li>
                </ul>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowSettingsModal(false);
                    setSelectedComic(null);
                  }}
                >
                  取消
                </Button>
                <Button type="submit">
                  保存设置
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}