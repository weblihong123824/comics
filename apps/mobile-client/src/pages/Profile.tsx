import React from 'react';
import { Settings, Moon, Bell, Shield, HelpCircle, LogOut } from 'lucide-react';

export const Profile: React.FC = () => {
  const menuItems = [
    { icon: Settings, label: '账户设置', href: '/settings' },
    { icon: Moon, label: '深色模式', href: null, toggle: true },
    { icon: Bell, label: '通知设置', href: '/notifications' },
    { icon: Shield, label: '隐私安全', href: '/privacy' },
    { icon: HelpCircle, label: '帮助中心', href: '/help' },
    { icon: LogOut, label: '退出登录', href: null, action: 'logout' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* 用户信息 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">张</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">张三</h2>
            <p className="text-gray-500 dark:text-gray-400">zhangsan@example.com</p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">免费用户</p>
          </div>
        </div>
      </div>

      {/* 存储统计 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">存储使用情况</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">已使用</span>
            <span className="font-medium text-gray-900 dark:text-white">2.5 GB / 10 GB</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div className="bg-blue-600 h-3 rounded-full" style={{ width: '25%' }}></div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">图片</p>
              <p className="font-medium text-gray-900 dark:text-white">1.2 GB</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">视频</p>
              <p className="font-medium text-gray-900 dark:text-white">0.8 GB</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">文档</p>
              <p className="font-medium text-gray-900 dark:text-white">0.5 GB</p>
            </div>
          </div>
        </div>
      </div>

      {/* 菜单列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {menuItems.map((item, index) => (
          <div key={index}>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
              </div>
              {item.toggle ? (
                <div className="w-12 h-6 bg-gray-200 dark:bg-gray-600 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                </div>
              ) : (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
            {index < menuItems.length - 1 && (
              <div className="border-b border-gray-200 dark:border-gray-700 mx-4"></div>
            )}
          </div>
        ))}
      </div>

      {/* 版本信息 */}
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Fun Box Mobile v1.0.0</p>
      </div>
    </div>
  );
};
