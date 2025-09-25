import { useLoaderData } from 'react-router';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Eye, 
  Heart, 
  DollarSign, 
  Calendar,
  Activity,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { getDatabase } from '../../db/dev';
import { users, comics, chapters, orders, userComics } from '../../db/schema';
import { sql, count, sum, avg, desc } from 'drizzle-orm';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalComics: number;
    totalChapters: number;
    totalRevenue: number;
    vipUsers: number;
    activeUsers: number;
  };
  trends: {
    userGrowth: number;
    comicGrowth: number;
    revenueGrowth: number;
  };
  topComics: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    revenue: number;
  }>;
  userStats: {
    totalBalance: number;
    avgBalance: number;
    vipRate: number;
  };
  recentActivity: Array<{
    type: string;
    description: string;
    time: string;
    value?: number;
  }>;
}

export async function loader({ context }: any): Promise<AnalyticsData> {
  const db = getDatabase(context);
  
  try {
    // 获取基础统计数据 - 使用简化的查询
    const allUsers = await db.select().from(users).all();
    const allComics = await db.select().from(comics).all();
    const allChapters = await db.select().from(chapters).all();
    const allOrders = await db.select().from(orders).all();

    // 计算统计数据
    const totalUsers = allUsers.length;
    const vipUsers = allUsers.filter(u => u.isVip).length;
    const totalBalance = allUsers.reduce((sum, u) => sum + u.balance, 0);
    const avgBalance = totalUsers > 0 ? Math.round(totalBalance / totalUsers) : 0;
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.amount, 0);
    
    // 计算活跃用户（最近30天注册的用户）
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = allUsers.filter(u => new Date(u.createdAt) > thirtyDaysAgo).length;

    // 获取热门漫画（按浏览量排序）
    const topComics = allComics
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(comic => {
        // 计算每个漫画的收入
        const comicRevenue = allOrders
          .filter(o => o.itemId === comic.id && o.type === 'comic')
          .reduce((sum, o) => sum + o.amount, 0);
        
        return {
          id: comic.id,
          title: comic.title,
          views: comic.views,
          likes: comic.likes,
          revenue: comicRevenue
        };
      });

    // 模拟趋势数据（在实际应用中应该从历史数据计算）
    const trends = {
      userGrowth: 12.5, // +12.5%
      comicGrowth: 8.3,  // +8.3%
      revenueGrowth: 15.7 // +15.7%
    };

    // 模拟最近活动
    const recentActivity = [
      {
        type: 'user_register',
        description: '新用户注册',
        time: '2分钟前',
        value: 1
      },
      {
        type: 'comic_purchase',
        description: '漫画购买',
        time: '5分钟前',
        value: 999
      },
      {
        type: 'chapter_read',
        description: '章节阅读',
        time: '8分钟前'
      },
      {
        type: 'user_vip',
        description: 'VIP升级',
        time: '15分钟前',
        value: 2999
      },
      {
        type: 'comic_like',
        description: '漫画点赞',
        time: '20分钟前'
      }
    ];

    return {
      overview: {
        totalUsers,
        totalComics: allComics.length,
        totalChapters: allChapters.length,
        totalRevenue,
        vipUsers,
        activeUsers
      },
      trends,
      topComics,
      userStats: {
        totalBalance,
        avgBalance,
        vipRate: totalUsers > 0 ? Math.round((vipUsers / totalUsers) * 100) : 0
      },
      recentActivity
    };
  } catch (error) {
    console.error('Analytics data loading error:', error);
    
    // 返回默认数据
    return {
      overview: {
        totalUsers: 0,
        totalComics: 0,
        totalChapters: 0,
        totalRevenue: 0,
        vipUsers: 0,
        activeUsers: 0
      },
      trends: {
        userGrowth: 0,
        comicGrowth: 0,
        revenueGrowth: 0
      },
      topComics: [],
      userStats: {
        totalBalance: 0,
        avgBalance: 0,
        vipRate: 0
      },
      recentActivity: []
    };
  }
}

export default function Analytics() {
  const data = useLoaderData<typeof loader>();

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue, 
    color = "blue" 
  }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: "up" | "down";
    trendValue?: number;
    color?: "blue" | "green" | "purple" | "orange" | "red";
  }) => {
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500", 
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      red: "bg-red-500"
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {trend && trendValue && (
              <div className={`flex items-center mt-2 text-sm ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {trendValue}%
              </div>
            )}
          </div>
          <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <BarChart3 className="mr-3" size={28} />
            数据分析
          </h1>
          <p className="text-gray-600 dark:text-gray-400">漫画平台运营数据概览</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>最后更新: {new Date().toLocaleString('zh-CN')}</span>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          title="总用户数"
          value={data.overview.totalUsers}
          icon={Users}
          trend="up"
          trendValue={data.trends.userGrowth}
          color="blue"
        />
        <StatCard
          title="VIP用户"
          value={data.overview.vipUsers}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="漫画总数"
          value={data.overview.totalComics}
          icon={BookOpen}
          trend="up"
          trendValue={data.trends.comicGrowth}
          color="green"
        />
        <StatCard
          title="章节总数"
          value={data.overview.totalChapters}
          icon={Activity}
          color="orange"
        />
        <StatCard
          title="总收入"
          value={`¥${(data.overview.totalRevenue / 100).toFixed(2)}`}
          icon={DollarSign}
          trend="up"
          trendValue={data.trends.revenueGrowth}
          color="green"
        />
        <StatCard
          title="活跃用户"
          value={data.overview.activeUsers}
          icon={Eye}
          color="blue"
        />
      </div>

      {/* 用户统计和热门漫画 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 用户统计 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">用户统计</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">总积分余额</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {data.userStats.totalBalance.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">平均余额</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {data.userStats.avgBalance}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">VIP转化率</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {data.userStats.vipRate}%
                </p>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-purple-200 dark:text-purple-800"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-purple-600 dark:text-purple-400"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${data.userStats.vipRate}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 热门漫画 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">热门漫画</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {data.topComics.map((comic, index) => (
              <div key={comic.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{comic.title}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {comic.views.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <Heart className="w-3 h-3 mr-1" />
                        {comic.likes.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ¥{(comic.revenue / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">收入</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">实时活动</h3>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          {data.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'user_register' ? 'bg-blue-500' :
                  activity.type === 'comic_purchase' ? 'bg-green-500' :
                  activity.type === 'user_vip' ? 'bg-purple-500' :
                  activity.type === 'comic_like' ? 'bg-red-500' :
                  'bg-gray-500'
                }`} />
                <span className="text-gray-900 dark:text-white">{activity.description}</span>
                {activity.value && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    +¥{(activity.value / 100).toFixed(2)}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}