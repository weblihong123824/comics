import { getDatabase } from '../../db/dev';
import { users, comics, orders, userComics } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export async function action({ request, context }: any) {
  const db = getDatabase(context);
  
  if (request.method === 'POST') {
    const { userId, comicId, type, chapterId } = await request.json();
    
    try {
      // 验证用户存在
      const user = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .get();
      
      if (!user) {
        return Response.json({
          success: false,
          message: '用户不存在'
        }, { status: 404 });
      }
      
      // 验证漫画存在
      const comic = await db.select()
        .from(comics)
        .where(eq(comics.id, comicId))
        .get();
      
      if (!comic) {
        return Response.json({
          success: false,
          message: '漫画不存在'
        }, { status: 404 });
      }
      
      // 检查是否已购买
      const existingPurchase = await db.select()
        .from(userComics)
        .where(and(
          eq(userComics.userId, userId),
          eq(userComics.comicId, comicId)
        ))
        .get();
      
      if (existingPurchase && existingPurchase.purchasedAt) {
        return Response.json({
          success: false,
          message: '您已购买过此漫画'
        }, { status: 400 });
      }
      
      // 计算价格
      let price: number;
      if (type === 'comic') {
        price = comic.price; // 整部漫画价格
      } else if (type === 'chapter') {
        price = 299; // 单章节价格（应该从配置获取）
      } else {
        return Response.json({
          success: false,
          message: '无效的购买类型'
        }, { status: 400 });
      }
      
      // 检查用户余额
      if (user.balance < price) {
        return Response.json({
          success: false,
          message: '积分余额不足'
        }, { status: 400 });
      }
      
      // 创建订单
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const order = {
        id: orderId,
        userId,
        comicId,
        amount: price,
        status: 'completed' as const, // 积分支付直接完成
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
      
      await db.insert(orders).values(order);
      
      // 扣除用户积分
      await db.update(users)
        .set({ 
          balance: user.balance - price,
          updatedAt: new Date().toISOString()
        })
        .where(eq(users.id, userId));
      
      // 更新用户漫画关系
      if (existingPurchase) {
        await db.update(userComics)
          .set({ 
            purchasedAt: new Date().toISOString()
          })
          .where(and(
            eq(userComics.userId, userId),
            eq(userComics.comicId, comicId)
          ));
      } else {
        await db.insert(userComics).values({
          userId,
          comicId,
          isFavorited: false,
          purchasedAt: new Date().toISOString(),
        });
      }
      
      return Response.json({
        success: true,
        data: {
          orderId,
          remainingBalance: user.balance - price
        },
        message: type === 'comic' ? '漫画购买成功' : '章节解锁成功'
      });
      
    } catch (error) {
      console.error('Purchase error:', error);
      return Response.json({
        success: false,
        message: '购买失败',
        error: error.message
      }, { status: 500 });
    }
  }
  
  return Response.json({
    success: false,
    message: '方法不允许'
  }, { status: 405 });
}
