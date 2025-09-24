import { Outlet, useLoaderData, Form } from 'react-router';
import Navigation from './Navigation';
import ThemeToggle from './ThemeToggle';
import { useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { requireAuth } from '../../utils/auth';
import { getDatabase } from '../../db/dev';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

// 添加loader函数进行认证检查
export async function loader({ request, context }: any) {
  const payload = await requireAuth(request);
  const db = getDatabase(context);
  
  // 获取用户信息
  const user = await db.select()
    .from(users)
    .where(eq(users.id, payload.userId))
    .get();
  
  if (!user) {
    throw new Response('用户不存在', { status: 404 });
  }
  
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    }
  };
}

// 添加action函数处理登出
export async function action({ request }: any) {
  const formData = await request.formData();
  const action = formData.get('_action');
  
  if (action === 'logout') {
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/admin/login',
        'Set-Cookie': 'auth-token=; Path=/; HttpOnly; Max-Age=0',
      },
    });
  }
  
  return null;
}

export default function Layout() {
  const { user } = useLoaderData<typeof loader>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      <Navigation isCollapsed={isSidebarCollapsed} />
      <div className="flex flex-col flex-1 transition-all duration-300 ease-in-out">
        <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center px-4 sticky top-0 z-20">
          <div className="flex-1 flex items-center">
            <button 
              onClick={toggleSidebar}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
              title={isSidebarCollapsed ? "展开菜单" : "收起菜单"}
            >
              {isSidebarCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {/* 用户菜单 */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">{user.username}</span>
              </button>
              
              {/* 下拉菜单 */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <Form method="post">
                      <input type="hidden" name="_action" value="logout" />
                      <button
                        type="submit"
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        退出登录
                      </button>
                    </Form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="p-6 overflow-y-auto h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}