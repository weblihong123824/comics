import { useLoaderData, Form, useActionData, useNavigation } from 'react-router';
import { ShoppingCart, DollarSign, TrendingUp, Calendar, Eye, Check, X, RefreshCw } from 'lucide-react';
import { Button } from '@comic/ui-components';
import { getDatabase } from '../../db/dev';
import { orders, users, comics } from '../../db/schema';
import { eq, desc, and } from 'drizzle-orm';

interface OrderWithDetails {
  id: string;
  userId: string;
  comicId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt: string | null;
  user: {
    username: string;
    email: string;
  };
  comic: {
    title: string;
    author: string;
  };
}

interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  todayRevenue: number;
}

export async function loader({ context, request }: any) {
  const db = getDatabase(context);
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'all';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 20;

  try {
    // 获取订单统计
    const allOrders = await db.select().from(orders).all();
    const today = new Date().toISOString().split('T')[0];
    
    const stats: OrderStats = {
      totalOrders: allOrders.length,
      completedOrders: allOrders.filter(o => o.status === 'completed').length,
      pendingOrders: allOrders.filter(o => o.status === 'pending').length,
      totalRevenue: allOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.amount, 0),
      todayRevenue: allOrders
        .filter(o => o.status === 'completed' && o.createdAt.startsWith(today))
        .reduce((sum, o) => sum + o.amount, 0),
    };

    // 获取订单列表（简化版，实际应该用JOIN）
    let filteredOrders = allOrders;
    if (status !== 'all') {
      filteredOrders = allOrders.filter(o => o.status === status);
    }

    const paginatedOrders = filteredOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice((page - 1) * limit, page * limit);

    // 获取用户和漫画信息（模拟数据）
    const ordersWithDetails: OrderWithDetails[] = paginatedOrders.map(order => ({
      ...order,
      user: {
        username: `用户${order.userId.slice(-4)}`,
        email: `user${order.userId.slice(-4)}@example.com`,
      },
      comic: {
        title: `漫画标题${order.comicId.slice(-4)}`,
        author: `作者${order.comicId.slice(-4)}`,
      },
    }));

    return {
      orders: ordersWithDetails,
      stats,
      pagination: {
        page,
        limit,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / limit),
      },
      currentStatus: status,
    };
  } catch (error) {
    console.error('Error loading orders:', error);
    return {
      orders: [],
      stats: { totalOrders: 0, completedOrders: 0, pendingOrders: 0, totalRevenue: 0, todayRevenue: 0 },
      pagination: { page: 1, limit, total: 0, totalPages: 0 },
      currentStatus: status,
    };
  }
}

export async function action({ request, context }: any) {
  const db = getDatabase(context);
  const formData = await request.formData();
  const action = formData.get('_action');
  const orderId = formData.get('orderId') as string;

  try {
    if (action === 'approve_order') {
      await db.update(orders)
        .set({ 
          status: 'completed',
          completedAt: new Date().toISOString(),
        })
        .where(eq(orders.id, orderId));
      
      return {
        success: true,
        message: '订单已批准完成',
      };
    }

    if (action === 'reject_order') {
      await db.update(orders)
        .set({ 
          status: 'failed',
          completedAt: new Date().toISOString(),
        })
        .where(eq(orders.id, orderId));
      
      return {
        success: true,
        message: '订单已拒绝',
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

export default function OrderManagement() {
  const { orders: orderList, stats, pagination, currentStatus } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const statusOptions = [
    { value: 'all', label: '全部订单', count: stats.totalOrders },
    { value: 'pending', label: '待处理', count: stats.pendingOrders },
    { value: 'completed', label: '已完成', count: stats.completedOrders },
    { value: 'failed', label: '已失败', count: stats.totalOrders - stats.completedOrders - stats.pendingOrders },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <ShoppingCart className="mr-3" size={28} />
          订单管理
        </h1>
        <p className="text-gray-600 dark:text-gray-400">管理用户购买订单和收入统计</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总订单数</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已完成订单</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedOrders}</p>
            </div>
            <Check className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总收入</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(stats.totalRevenue / 100).toFixed(2)}元
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">今日收入</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(stats.todayRevenue / 100).toFixed(2)}元
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* 筛选标签 */}
      <div className="flex space-x-2 overflow-x-auto">
        {statusOptions.map((option) => (
          <a
            key={option.value}
            href={`?status=${option.value}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              currentStatus === option.value
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {option.label} ({option.count})
          </a>
        ))}
      </div>

      {/* 订单列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">订单列表</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  订单信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  用户
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  漫画
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {orderList.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        #{order.id.slice(-8)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.user.username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {order.user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.comic.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {order.comic.author}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.amount} 积分
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ¥{(order.amount / 100).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {order.status === 'completed' ? '已完成' : 
                       order.status === 'pending' ? '待处理' : '已失败'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {order.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Form method="post" className="inline">
                          <input type="hidden" name="_action" value="approve_order" />
                          <input type="hidden" name="orderId" value={order.id} />
                          <Button
                            type="submit"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={isSubmitting}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            批准
                          </Button>
                        </Form>
                        <Form method="post" className="inline">
                          <input type="hidden" name="_action" value="reject_order" />
                          <input type="hidden" name="orderId" value={order.id} />
                          <Button
                            type="submit"
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            disabled={isSubmitting}
                          >
                            <X className="h-3 w-3 mr-1" />
                            拒绝
                          </Button>
                        </Form>
                      </div>
                    )}
                    {order.status === 'completed' && (
                      <span className="text-green-600 text-sm">已处理</span>
                    )}
                    {order.status === 'failed' && (
                      <span className="text-red-600 text-sm">已拒绝</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                显示 {((pagination.page - 1) * pagination.limit) + 1} 到{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} 条，
                共 {pagination.total} 条记录
              </div>
              <div className="flex space-x-2">
                {pagination.page > 1 && (
                  <a
                    href={`?status=${currentStatus}&page=${pagination.page - 1}`}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    上一页
                  </a>
                )}
                {pagination.page < pagination.totalPages && (
                  <a
                    href={`?status=${currentStatus}&page=${pagination.page + 1}`}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    下一页
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
