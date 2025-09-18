import { json, useLoaderData, useActionData, Form, useSearchParams } from 'react-router';
import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Upload, Eye } from 'lucide-react';
import { createDatabase } from '../../db';
import { ComicService } from '../../services/comic.service';
import AdminLayout from '../../components/admin/AdminLayout';
// import type { Route } from './+types/comics';

interface Env {
  DB: any;
}

export async function loader({ request, context }: any) {
  const env = context.cloudflare.env as Env;
  const db = createDatabase(env);
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
  
  return json({ comics, total, currentPage: page });
}

export async function action({ request, context }: any) {
  const env = context.cloudflare.env as Env;
  const db = createDatabase(env);
  const comicService = new ComicService(db);
  
  const formData = await request.formData();
  const action = formData.get('_action');
  
  if (action === 'delete') {
    const comicId = formData.get('comicId') as string;
    await comicService.deleteComic(comicId);
    return json({ success: true, message: '漫画删除成功' });
  }
  
  if (action === 'create') {
    const comicData = {
      title: formData.get('title') as string,
      author: formData.get('author') as string,
      description: formData.get('description') as string,
      coverImageUrl: formData.get('coverImageUrl') as string,
      status: formData.get('status') as 'ongoing' | 'completed',
      genre: JSON.parse(formData.get('genre') as string || '[]'),
      tags: JSON.parse(formData.get('tags') as string || '[]'),
      freeChapters: parseInt(formData.get('freeChapters') as string || '0'),
      price: parseInt(formData.get('price') as string || '0'),
    };
    
    const newComic = await comicService.createComic(comicData);
    return json({ success: true, message: '漫画创建成功', comic: newComic });
  }
  
  return json({ success: false, message: '未知操作' }, { status: 400 });
}

export default function Comics() {
  const { comics, total, currentPage } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
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
    <AdminLayout>
      <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            漫画管理
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            管理您的漫画库，添加新漫画或编辑现有内容
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          添加漫画
        </button>
      </div>

      {/* 搜索和过滤 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索漫画标题或作者..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                defaultValue={searchParams.get('search') || ''}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            defaultValue={searchParams.get('status') || 'all'}
            onChange={(e) => handleStatusFilter(e.target.value)}
          >
            <option value="all">所有状态</option>
            <option value="ongoing">连载中</option>
            <option value="completed">已完结</option>
          </select>
        </div>
      </div>

      {/* 漫画列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  漫画信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  定价
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  数据
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {comics.map((comic) => (
                <tr key={comic.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        className="h-16 w-12 rounded-lg object-cover"
                        src={comic.coverImageUrl}
                        alt={comic.title}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {comic.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          作者: {comic.author}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {comic.genre.join(', ')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          comic.status === 'ongoing'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {comic.status === 'ongoing' ? '连载中' : '已完结'}
                      </span>
                      {comic.hasUpdates && (
                        <div className="text-xs text-orange-600 dark:text-orange-400">
                          有更新
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="space-y-1">
                      <div>前{comic.freeChapters}章免费</div>
                      <div className="text-blue-600 dark:text-blue-400">{comic.price}积分</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {comic.views.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        更新: {new Date(comic.updatedAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {/* TODO: 打开编辑模态框 */}}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {/* TODO: 跳转到章节管理 */}}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        <Upload className="h-4 w-4" />
                      </button>
                      <Form method="post" style={{ display: 'inline' }}>
                        <input type="hidden" name="_action" value="delete" />
                        <input type="hidden" name="comicId" value={comic.id} />
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          onClick={(e) => {
                            if (!confirm('确定要删除这部漫画吗？')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </Form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* TODO: 创建漫画模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                添加新漫画
              </h3>
              <Form method="post" className="space-y-4">
                <input type="hidden" name="_action" value="create" />
                {/* TODO: 完整的表单字段 */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    创建
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
}
