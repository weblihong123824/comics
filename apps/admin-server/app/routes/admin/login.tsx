import { Form, useActionData, useNavigation, redirect } from 'react-router';
import { useState } from 'react';
import { Eye, EyeOff, Shield, User, Lock } from 'lucide-react';
import { Button, Input, Label } from '@comic/ui-components';
import { checkAuth } from '../../utils/auth';

// 添加loader函数检查是否已登录
export async function loader({ request }: any) {
  const payload = await checkAuth(request);
  
  // 如果已登录，重定向到仪表板
  if (payload) {
    return redirect('/admin/dashboard');
  }
  
  return null;
}

export async function action({ request }: any) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    // 获取当前请求的完整URL来构建API端点
    const url = new URL(request.url);
    const apiUrl = `${url.protocol}//${url.host}/api/auth`;
    
    console.log('🔗 调用API端点:', apiUrl);
    console.log('📧 登录邮箱:', email);
    
    // 调用API进行登录验证
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        email,
        password,
      }),
    });

    console.log('📡 API响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API响应错误:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json() as {
      success: boolean;
      message?: string;
      data?: {
        token: string;
        user: any;
      };
    };

    console.log('✅ API响应结果:', { success: result.success, message: result.message });

    if (result.success && result.data) {
      // 登录成功，设置cookie并重定向到仪表板
      const headers = new Headers();
      headers.append('Set-Cookie', `auth-token=${result.data.token}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}`);
      
      console.log('🍪 设置Cookie并重定向到仪表板');
      return redirect('/admin/dashboard', {
        headers,
      });
    } else {
      return {
        success: false,
        message: result.message || '登录失败',
      };
    }
  } catch (error) {
    console.error('🚨 登录错误:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      success: false,
      message: `网络错误: ${errorMessage}`,
    };
  }
}

export default function AdminLogin() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            后台管理系统
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            请登录您的管理员账户 (API版本)
          </p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <Form method="post" className="space-y-6">
            {/* 错误提示 */}
            {actionData && !actionData.success && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {actionData.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 邮箱输入 */}
            <div>
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                邮箱地址
              </Label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10"
                  placeholder="请输入邮箱地址"
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div>
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                密码
              </Label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="pl-10 pr-10"
                  placeholder="请输入密码"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* 记住我选项 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="remember-me" className="ml-2 text-sm text-gray-700 dark:text-gray-300 mb-0">
                  记住我
                </Label>
              </div>
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  忘记密码？
                </a>
              </div>
            </div>

            {/* 登录按钮 */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  登录中...
                </div>
              ) : (
                '登录'
              )}
            </Button>
          </Form>

          {/* 底部信息 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Comic 后台管理系统 v1.0.0 (API版本)
            </p>
          </div>
        </div>

        {/* 测试账户提示 */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                测试账户
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>邮箱: admin@comic.com</p>
                <p>密码: admin123</p>
                <p className="mt-1 text-xs">✨ 此版本使用API接口进行登录验证</p>
                <p className="text-xs">🔍 请查看浏览器控制台获取详细日志</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
