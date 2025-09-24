import { redirect } from 'react-router';

// 简化的JWT验证函数
export function verifyToken(token: string) {
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

// 从请求中获取认证token
export function getAuthToken(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return cookies['auth-token'] || null;
}

// 认证中间件 - 检查用户是否已登录
export async function requireAuth(request: Request) {
  const token = getAuthToken(request);
  
  if (!token) {
    throw redirect('/admin/login');
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    // Token无效，清除cookie并重定向到登录页
    throw redirect('/admin/login', {
      headers: {
        'Set-Cookie': 'auth-token=; Path=/; HttpOnly; Max-Age=0',
      },
    });
  }
  
  return payload;
}

// 检查用户是否已登录（用于登录页面重定向）
export async function checkAuth(request: Request) {
  const token = getAuthToken(request);
  
  if (!token) {
    return null;
  }
  
  const payload = verifyToken(token);
  return payload;
}
