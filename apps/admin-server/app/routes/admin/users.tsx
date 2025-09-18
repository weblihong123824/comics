import { json, useLoaderData } from 'react-router';
import { Users, Star, Coins, Calendar } from 'lucide-react';
import { createDatabase } from '../../db';
import { eq, sql } from 'drizzle-orm';
import { users } from '../../db/schema';
// import type { Route } from './+types/users';

interface Env {
  DB: any;
}

export async function loader({ context }: any) {
  const env = context.cloudflare.env as Env;
  const db = createDatabase(env);
  
  // 获取用户列表
  const userList = await db.select().from(users).orderBy(sql`created_at DESC`).limit(50).all();
  
  // 获取用户统计
  const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [vipUsers] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.isVip, true));
  const [totalBalance] = await db.select({ sum: sql<number>`sum(balance)` }).from(users);
  
  const stats = {
    totalUsers: totalUsers.count,
    vipUsers: vipUsers.count,
    totalBalance: totalBalance.sum || 0,
    regularUsers: totalUsers.count - vipUsers.count,
  };
  
  return json({ users: userList, stats });
}

export default function Users() {
  const { users: userList, stats } = useLoaderData<typeof loader>();

  const statCards = [
    {
      title: '总用户数',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'VIP用户',
      value: stats.vipUsers,
      icon: Star,
      color: 'bg-yellow-500',
    },
    {
      title: '普通用户',
      value: stats.regularUsers,
      icon: Users,
      color: 'bg-gray-500',
    },
    {
      title: '总积分余额',
      value: stats.totalBalance.toLocaleString(),
      icon: Coins,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          用户管理
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          管理和查看用户信息，监控用户活动
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 text-opacity-80 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 用户列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            最近注册用户
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  用户信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  会员状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  积分余额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  注册时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {userList.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatarUrl ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.avatarUrl}
                            alt={user.username}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isVip ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                          <Star className="h-3 w-3 mr-1" />
                          VIP会员
                        </span>
                        {user.vipExpiresAt && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            到期: {new Date(user.vipExpiresAt).toLocaleDateString('zh-CN')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        普通用户
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900 dark:text-white">
                      <Coins className="h-4 w-4 mr-1 text-yellow-500" />
                      {user.balance.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        查看详情
                      </button>
                      <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                        充值积分
                      </button>
                      {!user.isVip && (
                        <button className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300">
                          升级VIP
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
