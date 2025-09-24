import { useLoaderData, useActionData, Form } from 'react-router';
import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Tag, Folder, Grid, List, Filter } from 'lucide-react';
import { Button, Input, Label, Textarea } from '@comic/ui-components';
import { getDatabase } from '../../db/dev';
import { CategoryService } from '../../services/category.service';

export async function loader({ request, context }: any) {
  const db = getDatabase(context);
  const categoryService = new CategoryService(db);
  
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'categories'; // categories | tags
  
  if (type === 'tags') {
    const tags = await categoryService.getTags({ isActive: true, orderBy: 'usageCount' });
    return { type, items: tags };
  } else {
    const categories = await categoryService.getCategories({ isActive: true });
    return { type, items: categories };
  }
}

export async function action({ request, context }: any) {
  const db = getDatabase(context);
  const categoryService = new CategoryService(db);
  
  const formData = await request.formData();
  const intent = formData.get('intent');
  const type = formData.get('type') || 'categories';
  
  try {
    if (intent === 'create') {
      if (type === 'tags') {
        const tagData = {
          name: formData.get('name') as string,
          slug: formData.get('slug') as string,
          color: formData.get('color') as string,
          description: formData.get('description') as string,
          isActive: true,
        };
        
        await categoryService.createTag(tagData);
        return { success: true, message: '标签创建成功！' };
      } else {
        const categoryData = {
          name: formData.get('name') as string,
          slug: formData.get('slug') as string,
          description: formData.get('description') as string,
          parentId: formData.get('parentId') as string || undefined,
          sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
          isActive: true,
        };
        
        await categoryService.createCategory(categoryData);
        return { success: true, message: '分类创建成功！' };
      }
    }
    
    if (intent === 'delete') {
      const itemId = formData.get('itemId') as string;
      
      if (type === 'tags') {
        await categoryService.deleteTag(itemId);
        return { success: true, message: '标签删除成功！' };
      } else {
        await categoryService.deleteCategory(itemId);
        return { success: true, message: '分类删除成功！' };
      }
    }
    
    return { success: false, message: '未知操作' };
  } catch (error) {
    console.error('操作失败:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : '操作失败，请重试' 
    };
  }
}

export default function CategoriesPage() {
  const { type, items } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredItems = items.filter((item: any) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 创建成功后自动关闭模态框
  React.useEffect(() => {
    if (actionData?.success && showCreateModal) {
      const timer = setTimeout(() => {
        setShowCreateModal(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [actionData, showCreateModal]);

  return (
    <div className="p-6">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {type === 'tags' ? '标签管理' : '分类管理'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {type === 'tags' ? '管理漫画标签，提升内容发现' : '管理漫画分类，组织内容结构'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* 类型切换 */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <a
              href="/admin/categories?type=categories"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                type === 'categories'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Folder size={16} className="inline mr-1" />
              分类
            </a>
            <a
              href="/admin/categories?type=tags"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                type === 'tags'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Tag size={16} className="inline mr-1" />
              标签
            </a>
          </div>
          
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={16} className="mr-2" />
            新建{type === 'tags' ? '标签' : '分类'}
          </Button>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder={`搜索${type === 'tags' ? '标签' : '分类'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 状态消息 */}
      {actionData?.message && (
        <div className={`mb-4 p-4 rounded-lg ${
          actionData.success 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          {actionData.message}
        </div>
      )}

      {/* 内容区域 */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item: any) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  {type === 'tags' ? (
                    <div 
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: item.color || '#6b7280' }}
                    />
                  ) : (
                    <Folder size={16} className="text-blue-500 mr-2" />
                  )}
                  <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                </div>
                <Form method="post" className="inline">
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="type" value={type} />
                  <input type="hidden" name="itemId" value={item.id} />
                  <button
                    type="submit"
                    className="text-red-500 hover:text-red-700 p-1"
                    onClick={(e) => {
                      if (!confirm(`确定要删除这个${type === 'tags' ? '标签' : '分类'}吗？`)) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </Form>
              </div>
              
              {item.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {item.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>#{item.slug}</span>
                {type === 'tags' && (
                  <span>使用 {item.usageCount} 次</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    标识符
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    描述
                  </th>
                  {type === 'tags' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      使用次数
                    </th>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {type === 'tags' ? (
                          <div 
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: item.color || '#6b7280' }}
                          />
                        ) : (
                          <Folder size={16} className="text-blue-500 mr-3" />
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      #{item.slug}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {item.description || '-'}
                    </td>
                    {type === 'tags' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {item.usageCount}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="type" value={type} />
                        <input type="hidden" name="itemId" value={item.id} />
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          onClick={(e) => {
                            if (!confirm(`确定要删除这个${type === 'tags' ? '标签' : '分类'}吗？`)) {
                              e.preventDefault();
                            }
                          }}
                        >
                          删除
                        </button>
                      </Form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 创建模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              新建{type === 'tags' ? '标签' : '分类'}
            </h2>
            
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="create" />
              <input type="hidden" name="type" value={type} />
              
              <div>
                <Label htmlFor="name">名称</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder={`输入${type === 'tags' ? '标签' : '分类'}名称`}
                />
              </div>
              
              <div>
                <Label htmlFor="slug">标识符</Label>
                <Input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  placeholder="英文标识符，如: action"
                />
              </div>
              
              {type === 'tags' && (
                <div>
                  <Label htmlFor="color">颜色</Label>
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    defaultValue="#6b7280"
                  />
                </div>
              )}
              
              {type === 'categories' && (
                <div>
                  <Label htmlFor="sortOrder">排序</Label>
                  <Input
                    id="sortOrder"
                    name="sortOrder"
                    type="number"
                    defaultValue="0"
                    placeholder="数字越小排序越靠前"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder={`${type === 'tags' ? '标签' : '分类'}描述（可选）`}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  取消
                </Button>
                <Button type="submit">
                  创建
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
