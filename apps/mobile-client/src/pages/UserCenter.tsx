import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Crown, Coins, Heart, Clock, HelpCircle, LogOut } from 'lucide-react';

export const UserCenter: React.FC = () => {
  // Mock user data
  const user = {
    id: '1',
    username: '漫画爱好者',
    email: 'user@example.com',
    avatar: 'https://picsum.photos/64/64?random=user',
    coinBalance: 1580,
    vipLevel: 2,
    vipExpiredAt: new Date('2024-12-31'),
  };

  const menuItems = [
    { icon: Heart, label: '我的收藏', href: '/favorites', count: 23 },
    { icon: Clock, label: '阅读历史', href: '/history', count: 156 },
    { icon: Crown, label: 'VIP特权', href: '/vip' },
    { icon: Coins, label: '充值中心', href: '/recharge' },
    { icon: Settings, label: '设置', href: '/settings' },
    { icon: HelpCircle, label: '帮助中心', href: '/help' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 用户信息卡片 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 safe-area-top">
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-16 h-16 rounded-full border-4 border-white/20"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{user.username}</h2>
            <p className="text-blue-100">{user.email}</p>
            <div className="flex items-center mt-2">
              <Crown className="w-4 h-4 text-yellow-300 mr-1" />
              <span className="text-white text-sm">VIP{user.vipLevel}</span>
              <span className="text-blue-100 text-xs ml-2">
                至 {user.vipExpiredAt.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* 积分余额 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Coins className="w-5 h-5 text-yellow-300 mr-2" />
              <span className="text-white">积分余额</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white">{user.coinBalance}</span>
              <span className="text-blue-100 text-sm ml-1">积分</span>
            </div>
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="bg-white dark:bg-gray-800 -mt-6 mx-4 rounded-xl shadow-lg p-4 relative z-10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">23</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">收藏</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">156</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">历史</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">8</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">本月已读</div>
          </div>
        </div>
      </div>

      {/* 菜单列表 */}
      <div className="mt-6 space-y-2 px-4">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.href}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{item.label}</span>
            </div>
            <div className="flex items-center space-x-2">
              {item.count && (
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.count}</span>
              )}
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* 最近阅读 */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">最近阅读</h3>
          <Link to="/history" className="text-sm text-blue-600 dark:text-blue-400">
            查看全部
          </Link>
        </div>
        
        <div className="space-y-3">
          {[
            { title: '恋爱日常', chapter: '第5话', cover: 'https://picsum.photos/60/80?random=1' },
            { title: '英雄传说', chapter: '第12话', cover: 'https://picsum.photos/60/80?random=2' },
          ].map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-xl">
              <img
                src={item.cover}
                alt={item.title}
                className="w-12 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">读到 {item.chapter}</p>
              </div>
              <button className="text-blue-600 dark:text-blue-400 text-sm">继续阅读</button>
            </div>
          ))}
        </div>
      </div>

      {/* 退出登录 */}
      <div className="mt-8 px-4 pb-8">
        <button className="flex items-center justify-center w-full p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
          <LogOut className="w-5 h-5 mr-2" />
          退出登录
        </button>
      </div>
    </div>
  );
};
