import { useLoaderData, Form, useActionData, useNavigation } from 'react-router';
import { Settings, Save, RefreshCw, Database, Key, Upload, Globe } from 'lucide-react';
import { Button, Input, Label, Textarea } from '@comic/ui-components';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  adminEmail: string;
  enableRegistration: boolean;
  defaultVipDuration: number;
  freeChapterLimit: number;
  chapterPrice: number;
  comicPrice: number;
  uploadMaxSize: number;
  allowedImageTypes: string[];
}

export async function loader({ context }: any) {
  // 从数据库或KV存储加载系统设置
  const defaultSettings: SystemSettings = {
    siteName: 'Comic 漫画系统',
    siteDescription: '现代化的漫画阅读平台',
    adminEmail: 'admin@comic.com',
    enableRegistration: true,
    defaultVipDuration: 30, // 天数
    freeChapterLimit: 3,
    chapterPrice: 299, // 积分
    comicPrice: 1999, // 积分
    uploadMaxSize: 10, // MB
    allowedImageTypes: ['jpg', 'jpeg', 'png', 'webp'],
  };

  return { settings: defaultSettings };
}

export async function action({ request, context }: any) {
  const formData = await request.formData();
  const settings = Object.fromEntries(formData);

  try {
    // 这里应该保存设置到数据库或KV存储
    console.log('保存系统设置:', settings);
    
    return {
      success: true,
      message: '系统设置已保存',
    };
  } catch (error) {
    return {
      success: false,
      message: '保存设置失败',
      error: error.message,
    };
  }
}

export default function SystemSettings() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Settings className="mr-3" size={28} />
            系统设置
          </h1>
          <p className="text-gray-600 dark:text-gray-400">管理系统配置和参数</p>
        </div>
      </div>

      {/* 操作结果提示 */}
      {actionData && (
        <div className={`p-4 rounded-lg ${
          actionData.success 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {actionData.message}
        </div>
      )}

      <Form method="post" className="space-y-8">
        {/* 基本设置 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <Globe className="mr-3 text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">基本设置</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="siteName">网站名称</Label>
              <Input
                id="siteName"
                name="siteName"
                defaultValue={settings.siteName}
                placeholder="输入网站名称"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="adminEmail">管理员邮箱</Label>
              <Input
                id="adminEmail"
                name="adminEmail"
                type="email"
                defaultValue={settings.adminEmail}
                placeholder="admin@example.com"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="siteDescription">网站描述</Label>
              <Textarea
                id="siteDescription"
                name="siteDescription"
                defaultValue={settings.siteDescription}
                placeholder="输入网站描述"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* 用户设置 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <Key className="mr-3 text-green-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">用户设置</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableRegistration"
                name="enableRegistration"
                defaultChecked={settings.enableRegistration}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="enableRegistration" className="mb-0">允许用户注册</Label>
            </div>
            
            <div>
              <Label htmlFor="defaultVipDuration">默认VIP时长（天）</Label>
              <Input
                id="defaultVipDuration"
                name="defaultVipDuration"
                type="number"
                defaultValue={settings.defaultVipDuration}
                min="1"
                max="365"
              />
            </div>
          </div>
        </div>

        {/* 系统配置 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <Database className="mr-3 text-purple-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">系统配置</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="defaultChapterPrice">默认章节价格（积分）</Label>
              <Input
                id="defaultChapterPrice"
                name="defaultChapterPrice"
                type="number"
                defaultValue={299}
                min="1"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                新漫画的默认单章节价格
              </p>
            </div>
            
            <div>
              <Label htmlFor="defaultFreeChapters">默认免费章节数</Label>
              <Input
                id="defaultFreeChapters"
                name="defaultFreeChapters"
                type="number"
                defaultValue={3}
                min="0"
                max="10"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                新漫画的默认免费章节数
              </p>
            </div>
          </div>
        </div>

        {/* 文件上传设置 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <Upload className="mr-3 text-orange-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">文件上传设置</h2>
          </div>
          
          <div>
            <Label htmlFor="allowedImageTypes">允许的图片格式</Label>
            <Input
              id="allowedImageTypes"
              name="allowedImageTypes"
              defaultValue={settings.allowedImageTypes.join(', ')}
              placeholder="jpg, jpeg, png, webp"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              用逗号分隔多个格式
            </p>
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存设置
              </>
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
}
