import { useLoaderData, Form, useActionData, useNavigation, Link } from 'react-router';
import { Shield, Users, Key, Eye, EyeOff, Plus, Edit, Trash2, Crown } from 'lucide-react';
import { useState } from 'react';
import { Button, Input, Label } from '@comic/ui-components';
import { getDatabase } from '../../db/dev';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

interface User {
  id: string;
  username: string;
  email: string;
  isVip: boolean;
  vipExpiresAt: string | null;
  balance: number;
  createdAt: string;
}

export async function loader({ context }: any) {
  const db = getDatabase(context);
  
  try {
    const allUsers = await db.select().from(users).all();
    
    return {
      users: allUsers,
      stats: {
        totalUsers: allUsers.length,
        vipUsers: allUsers.filter(u => u.isVip).length,
        activeUsers: allUsers.filter(u => 
          new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length,
      }
    };
  } catch (error) {
    console.error('Error loading users:', error);
    return { users: [], stats: { totalUsers: 0, vipUsers: 0, activeUsers: 0 } };
  }
}

export async function action({ request, context }: any) {
  const db = getDatabase(context);
  const formData = await request.formData();
  const action = formData.get('_action');

  try {
    if (action === 'create_user') {
      const userData = {
        id: `user_${Date.now()}`,
        username: formData.get('username') as string,
        email: formData.get('email') as string,
        passwordHash: 'temp_hash', // 实际应该加密
        balance: parseInt(formData.get('balance') as string) || 0,
        isVip: formData.get('isVip') === 'on',
        vipExpiresAt: formData.get('vipExpiresAt') as string || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.insert(users).values(userData);
      
      return {
        success: true,
        message: '用户创建成功',
      };
    }

    if (action === 'update_balance') {
      const userId = formData.get('userId') as string;
      const newBalance = parseInt(formData.get('balance') as string);
      
      await db.update(users)
        .set({ balance: newBalance, updatedAt: new Date().toISOString() })
        .where(eq(users.id, userId));
      
      return {
        success: true,
        message: '积分余额已更新',
      };
    }

    if (action === 'toggle_vip') {
      const userId = formData.get('userId') as string;
      const isVip = formData.get('isVip') === 'true';
      const vipExpiresAt = formData.get('vipExpiresAt') as string;
      
      await db.update(users)
        .set({ 
          isVip,
          vipExpiresAt: isVip ? vipExpiresAt : null,
          updatedAt: new Date().toISOString() 
        })
        .where(eq(users.id, userId));
      
      return {
        success: true,
        message: `VIP状态已${isVip ? '开启' : '关闭'}`,
      };
    }

    return {
      success: false,
      message: '未知操作',
    };
  } catch (error) {
    console.error('Action error:', error);
    return {
      success: false,
      message: '操作失败',
      error: error.message,
    };
  }
}

export default function AuthManagement() {
  const { users: userList, stats } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Shield className="mr-3" size={28} />
            用户认证管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400">管理用户账户、权限和VIP状态</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          添加用户
        </Button>
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

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总用户数</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">VIP用户</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.vipUsers}</p>
            </div>
            <Crown className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">活跃用户</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}</p>
            </div>
            <Eye className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">用户列表</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  用户信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  VIP状态
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
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {userList.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isVip
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {user.isVip ? 'VIP' : '普通'}
                    </span>
                    {user.isVip && user.vipExpiresAt && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        到期: {new Date(user.vipExpiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.balance.toLocaleString()} 积分
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      编辑
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 创建用户弹窗 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              创建新用户
            </h3>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="_action" value="create_user" />
              
              <div>
                <Label htmlFor="username">用户名</Label>
                <Input id="username" name="username" required />
              </div>
              
              <div>
                <Label htmlFor="email">邮箱</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              
              <div>
                <Label htmlFor="balance">初始积分</Label>
                <Input id="balance" name="balance" type="number" defaultValue="0" />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isVip"
                  name="isVip"
                  className="w-4 h-4 text-blue-600"
                />
                <Label htmlFor="isVip" className="mb-0">设为VIP用户</Label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  取消
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  创建用户
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* 编辑用户弹窗 */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              编辑用户: {editingUser.username}
            </h3>
            
            <div className="space-y-4">
              {/* 更新积分 */}
              <Form method="post" className="border-b pb-4">
                <input type="hidden" name="_action" value="update_balance" />
                <input type="hidden" name="userId" value={editingUser.id} />
                
                <Label htmlFor="balance">积分余额</Label>
                <div className="flex space-x-2">
                  <Input
                    id="balance"
                    name="balance"
                    type="number"
                    defaultValue={editingUser.balance}
                  />
                  <Button type="submit" size="sm">更新</Button>
                </div>
              </Form>
              
              {/* 更新VIP状态 */}
              <Form method="post">
                <input type="hidden" name="_action" value="toggle_vip" />
                <input type="hidden" name="userId" value={editingUser.id} />
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="editIsVip"
                      name="isVip"
                      value="true"
                      defaultChecked={editingUser.isVip}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Label htmlFor="editIsVip" className="mb-0">VIP用户</Label>
                  </div>
                  
                  <div>
                    <Label htmlFor="vipExpiresAt">VIP到期时间</Label>
                    <Input
                      id="vipExpiresAt"
                      name="vipExpiresAt"
                      type="date"
                      defaultValue={editingUser.vipExpiresAt?.split('T')[0]}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    更新VIP状态
                  </Button>
                </div>
              </Form>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setEditingUser(null)}
              >
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
