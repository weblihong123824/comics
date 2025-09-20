import { Link, useLocation } from 'react-router';
import { 
  Home, 
  BookOpen, 
  Users, 
  BarChart3,
  User,
  Shield,
  ShoppingCart,
  Settings
} from 'lucide-react';

interface NavigationProps {
  isCollapsed: boolean;
}

export default function Navigation({ isCollapsed }: NavigationProps) {
  const location = useLocation();

  const navigation = [
    { name: '仪表板', href: '/admin/dashboard', icon: Home },
    { name: '漫画管理', href: '/admin/comics', icon: BookOpen },
    { name: '用户管理', href: '/admin/users', icon: Users },
    { name: '认证管理', href: '/admin/auth', icon: Shield },
    { name: '订单管理', href: '/admin/orders', icon: ShoppingCart },
    { name: '数据分析', href: '/admin/analytics', icon: BarChart3 },
    { name: '系统设置', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col h-full`}>
      {/* Logo区域 */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-sm">C</span>
        </div>
        {!isCollapsed && (
          <span className="ml-3 text-xl font-semibold text-gray-800 dark:text-white">
            Comic
          </span>
        )}
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 mt-6 px-3">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                {!isCollapsed && (
                  <>
                    <span className="ml-3">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 底部用户信息 */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center">
            <User size={16} className="text-gray-600 dark:text-gray-300" />
          </div>
          {!isCollapsed && (
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                管理员
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                admin@funbox.com
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}