import { json } from 'react-router';
import { createDatabase } from '../../db';
import { eq, sql } from 'drizzle-orm';
import { users } from '../../db/schema';

interface Env {
  DB: any;
}

export async function loader({ request, context }: any) {
  const env = context.cloudflare.env as Env;
  const db = createDatabase(env);
  
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const search = url.searchParams.get('search') || '';
  
  try {
    // 简化查询以避免类型问题
    const allUsers = await db.select().from(users).all();
    let filteredUsers = allUsers;
    
    // 应用搜索过滤
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    const total = filteredUsers.length;
    const offset = (page - 1) * limit;
    const paginatedUsers = filteredUsers
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit);
    
    return json({ 
      success: true, 
      data: { users: paginatedUsers, total, page, limit } 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function action({ request, context }: any) {
  const env = context.cloudflare.env as Env;
  const db = createDatabase(env);
  
  if (request.method === 'POST') {
    try {
      const data = await request.json();
      
      // 这里应该包含用户创建逻辑
      // 暂时返回成功响应
      return json({ 
        success: true, 
        message: '用户创建功能待实现' 
      }, { status: 501 });
    } catch (error) {
      console.error('Error creating user:', error);
      return json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      );
    }
  }
  
  return json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
