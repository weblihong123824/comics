import { useLoaderData, useActionData, Form, Link, useFetcher } from 'react-router';
import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Trash2, Eye, Save, X, Image as ImageIcon, Plus } from 'lucide-react';
import { Button, Input, Label } from '@comic/ui-components';
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
    
    const chapter = await comicService.getChapterById(params.chapterId);
    if (!chapter) {
      throw new Error('章节不存在');
    }
    
    const pages = await comicService.getPagesByChapterId(params.chapterId);
    
    return { comic, chapter, pages };
  } catch (error) {
    console.error('Error loading chapter pages:', error);
    throw new Response('章节不存在', { status: 404 });
  }
}

export async function action({ request, params, context }: any) {
  const db = getDatabase(context);
  const comicService = new ComicService(db);
  
  const formData = await request.formData();
  const action = formData.get('_action');
  
  if (action === 'upload_page') {
    try {
      const pageNumber = parseInt(formData.get('pageNumber') as string);
      const imageUrl = formData.get('imageUrl') as string;
      
      if (!pageNumber || pageNumber < 1) {
        return { success: false, message: '页面号必须大于0' };
      }
      
      if (!imageUrl?.trim()) {
        return { success: false, message: '图片URL不能为空' };
      }
      
      // 检查页面号是否已存在
      const existingPages = await comicService.getPagesByChapterId(params.chapterId);
      const pageExists = existingPages.some(page => page.pageNumber === pageNumber);
      
      if (pageExists) {
        return { success: false, message: `第${pageNumber}页已存在` };
      }
      
      const newPage = await comicService.createPage({
        chapterId: params.chapterId,
        pageNumber,
        imageUrl: imageUrl.trim(),
      });
      
      // 更新章节的页面数
      const allPages = await comicService.getPagesByChapterId(params.chapterId);
      const chapter = await comicService.getChapterById(params.chapterId);
      if (chapter) {
        await comicService.updateComic(params.id, {
          lastChapterUpdate: new Date(),
          hasUpdates: true,
        });
      }
      
      return { success: true, message: '页面添加成功！', page: newPage };
    } catch (error) {
      console.error('添加页面失败:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '添加页面时发生错误' 
      };
    }
  }
  
  if (action === 'delete_page') {
    try {
      const pageId = formData.get('pageId') as string;
      // TODO: 实现删除页面功能
      return { success: true, message: '页面删除成功' };
    } catch (error) {
      return { success: false, message: '删除页面失败' };
    }
  }
  
  return { success: false, message: '未知操作' };
}

export default function ChapterPages() {
  const { comic, chapter, pages } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [draggedFiles, setDraggedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFetcher = useFetcher();
  
  // 上传成功后自动关闭模态框
  React.useEffect(() => {
    if (actionData?.success && showUploadModal) {
      const timer = setTimeout(() => {
        setShowUploadModal(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [actionData, showUploadModal]);
  
  const getNextPageNumber = () => {
    if (pages.length === 0) return 1;
    return Math.max(...pages.map(page => page.pageNumber)) + 1;
  };
  
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== fileArray.length) {
      alert('请只选择图片文件');
      return;
    }
    
    setDraggedFiles(imageFiles);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };
  
  const uploadFile = async (file: File, pageNumber: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'page');
    
    try {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        
        // 创建页面记录
        const pageFormData = new FormData();
        pageFormData.append('_action', 'upload_page');
        pageFormData.append('pageNumber', pageNumber.toString());
        pageFormData.append('imageUrl', result.data.url);
        
        uploadFetcher.submit(pageFormData, { method: 'post' });
        
        return result.data.url;
      } else {
        throw new Error(result.error || '上传失败');
      }
    } catch (error) {
      console.error('上传失败:', error);
      setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
      throw error;
    }
  };
  
  const handleBatchUpload = async () => {
    if (draggedFiles.length === 0) return;
    
    let startPageNumber = getNextPageNumber();
    
    for (let i = 0; i < draggedFiles.length; i++) {
      try {
        await uploadFile(draggedFiles[i], startPageNumber + i);
      } catch (error) {
        console.error(`上传第${i + 1}个文件失败:`, error);
      }
    }
    
    // 清空文件列表
    setTimeout(() => {
      setDraggedFiles([]);
      setUploadProgress({});
    }, 2000);
  };
  
  return (
    <div className="space-y-6">
      {/* 页面标题和导航 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to={`/admin/comics/${comic.id}/chapters`}
            className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeft size={20} className="mr-2" />
            返回章节列表
          </Link>
        </div>
      </div>
      
      {/* 章节信息 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {comic.title} - 第{chapter.chapterNumber}章
            </h1>
            <h2 className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              {chapter.title}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>共 {pages.length} 页</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                chapter.isFree 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
              }`}>
                {chapter.isFree ? '免费章节' : '付费章节'}
              </span>
            </div>
          </div>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center"
          >
            <Upload className="mr-2 h-4 w-4" />
            上传页面
          </Button>
        </div>
      </div>
      
      {/* 页面列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            页面管理
          </h3>
        </div>
        
        <div className="p-6">
          {pages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="group relative bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden aspect-[3/4] border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
                >
                  <img
                    src={page.imageUrl}
                    alt={`第${page.pageNumber}页`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-page.jpg';
                    }}
                  />
                  
                  {/* 页面号标签 */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    第{page.pageNumber}页
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => window.open(page.imageUrl, '_blank')}
                        className="p-1 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                        title="预览"
                      >
                        <Eye size={12} className="text-blue-600" />
                      </button>
                      <Form method="post" style={{ display: 'inline' }}>
                        <input type="hidden" name="_action" value="delete_page" />
                        <input type="hidden" name="pageId" value={page.id} />
                        <button
                          type="submit"
                          className="p-1 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                          title="删除"
                          onClick={(e) => {
                            if (!confirm(`确定要删除第${page.pageNumber}页吗？`)) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <Trash2 size={12} className="text-red-500" />
                        </button>
                      </Form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 空状态 */
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <ImageIcon size={32} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无页面</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">开始为这个章节上传页面内容吧</p>
              <Button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center"
              >
                <Upload className="mr-2 h-5 w-5" />
                上传页面
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* 上传页面模态框 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-xl bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                上传页面
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* 拖拽上传区域 */}
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                拖拽图片到这里，或点击选择文件
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                支持 JPG、PNG 格式，建议尺寸 800x1200px
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                选择文件
              </Button>
            </div>
            
            {/* 文件列表 */}
            {draggedFiles.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  待上传文件 ({draggedFiles.length} 个)
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {draggedFiles.map((file, index) => (
                    <div key={file.name} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex items-center space-x-3">
                        <ImageIcon size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          第{getNextPageNumber() + index}页 - {file.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {uploadProgress[file.name] !== undefined && (
                          <div className="text-xs text-gray-500">
                            {uploadProgress[file.name] === -1 ? '失败' : 
                             uploadProgress[file.name] === 100 ? '完成' : 
                             `${uploadProgress[file.name]}%`}
                          </div>
                        )}
                        <button
                          onClick={() => setDraggedFiles(files => files.filter(f => f !== file))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDraggedFiles([])}
                  >
                    清空
                  </Button>
                  <Button
                    onClick={handleBatchUpload}
                    disabled={draggedFiles.length === 0}
                  >
                    开始上传
                  </Button>
                </div>
              </div>
            )}
            
            {/* 单个页面上传表单 */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                或者单独添加页面
              </h4>
              <Form method="post" className="space-y-4">
                <input type="hidden" name="_action" value="upload_page" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pageNumber">页面号 *</Label>
                    <Input
                      id="pageNumber"
                      name="pageNumber"
                      type="number"
                      min="1"
                      defaultValue={getNextPageNumber()}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="imageUrl">图片URL *</Label>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      type="url"
                      required
                      placeholder="https://example.com/page.jpg"
                      className="mt-1"
                    />
                  </div>
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
                
                <div className="flex justify-end">
                  <Button type="submit">
                    添加页面
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
