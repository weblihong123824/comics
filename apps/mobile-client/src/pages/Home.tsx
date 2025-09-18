import React from 'react';
import { Link } from 'react-router-dom';
import { Files, Upload, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@fun-box/ui-components';

export const Home: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      {/* 欢迎区域 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">欢迎使用 Fun Box</h1>
        <p className="text-blue-100 mb-4">管理您的文件，随时随地访问</p>
        <Link to="/upload">
          <Button className="bg-white text-blue-600 hover:bg-blue-50">
            立即上传文件
          </Button>
        </Link>
      </div>

      {/* 快速操作 */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/files" className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Files className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">我的文件</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">浏览管理</p>
            </div>
          </div>
        </Link>

        <Link to="/upload" className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">上传文件</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">添加新文件</p>
            </div>
          </div>
        </Link>
      </div>

      {/* 最近活动 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">最近活动</h2>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {[
            { name: 'presentation.pdf', action: '上传', time: '2分钟前' },
            { name: 'vacation-photo.jpg', action: '查看', time: '1小时前' },
            { name: 'project-demo.mp4', action: '分享', time: '3小时前' },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.action}</p>
              </div>
              <span className="text-xs text-gray-400">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 存储统计 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">存储空间</h2>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">已使用</span>
            <span className="font-medium text-gray-900 dark:text-white">2.5 GB / 10 GB</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
