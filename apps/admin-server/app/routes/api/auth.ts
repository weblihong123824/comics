import { getDatabase } from '../../db/dev';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

// 简化的JWT实现（生产环境应使用真正的JWT库）
function createToken(userId: string) {
  const payload = { userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }; // 7天过期
  return btoa(JSON.stringify(payload));
}

function verifyToken(token: string) {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) {
      return null; // Token过期
    }
    return payload;
  } catch {
    return null; // Token无效
  }
}

export async function action({ request, context }: any) {
  const db = getDatabase(context);
  
  if (request.method === 'POST') {
    const { action, ...data } = await request.json();
    
    try {
      // 用户登录
      if (action === 'login') {
        const { email, password } = data;
        
        const user = await db.select()
          .from(users)
          .where(eq(users.email, email))
          .get();
        
        if (!user) {
          return Response.json({
            success: false,
            message: '用户不存在'
          }, { status: 401 });
        }
        
        // 简化的密码验证（生产环境应使用bcrypt）
        if (user.passwordHash !== password) {
          return Response.json({
            success: false,
            message: '密码错误'
          }, { status: 401 });
        }
        
        const token = createToken(user.id);
        
        return Response.json({
          success: true,
          data: {
            token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              isVip: user.isVip,
              vipExpiresAt: user.vipExpiresAt,
              balance: user.balance,
            }
          },
          message: '登录成功'
        });
      }
      
      // 用户注册
      if (action === 'register') {
        const { username, email, password } = data;
        
        // 检查用户是否已存在
        const existingUser = await db.select()
          .from(users)
          .where(eq(users.email, email))
          .get();
        
        if (existingUser) {
          return Response.json({
            success: false,
            message: '邮箱已被注册'
          }, { status: 400 });
        }
        
        // 创建新用户
        const newUser = {
          id: `user_${Date.now()}_${Math.random().toString(36).substring(2)}`,
          username,
          email,
          passwordHash: password, // 生产环境应加密
          balance: 1000, // 新用户赠送1000积分
          isVip: false,
          vipExpiresAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await db.insert(users).values(newUser);
        
        const token = createToken(newUser.id);
        
        return Response.json({
          success: true,
          data: {
            token,
            user: {
              id: newUser.id,
              username: newUser.username,
              email: newUser.email,
              isVip: newUser.isVip,
              vipExpiresAt: newUser.vipExpiresAt,
              balance: newUser.balance,
            }
          },
          message: '注册成功'
        });
      }
      
      // 验证Token
      if (action === 'verify') {
        const { token } = data;
        const payload = verifyToken(token);
        
        if (!payload) {
          return Response.json({
            success: false,
            message: 'Token无效或已过期'
          }, { status: 401 });
        }
        
        const user = await db.select()
          .from(users)
          .where(eq(users.id, payload.userId))
          .get();
        
        if (!user) {
          return Response.json({
            success: false,
            message: '用户不存在'
          }, { status: 401 });
        }
        
        return Response.json({
          success: true,
          data: {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              isVip: user.isVip,
              vipExpiresAt: user.vipExpiresAt,
              balance: user.balance,
            }
          }
        });
      }
      
      return Response.json({
        success: false,
        message: '未知操作'
      }, { status: 400 });
      
    } catch (error) {
      console.error('Auth error:', error);
      return Response.json({
        success: false,
        message: '服务器错误',
        error: error.message
      }, { status: 500 });
    }
  }
  
  return Response.json({
    success: false,
    message: '方法不允许'
  }, { status: 405 });
}
