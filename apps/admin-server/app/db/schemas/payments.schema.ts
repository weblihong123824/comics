import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

// 订单表
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull(),
  orderNumber: text('order_number').unique().notNull(), // 订单号
  type: text('type', { enum: ['comic', 'chapter', 'vip', 'credits'] }).notNull(),
  itemId: text('item_id'), // 商品ID (漫画ID或章节ID)
  itemTitle: text('item_title'), // 商品标题
  amount: integer('amount').notNull(), // 支付金额 (积分)
  originalAmount: integer('original_amount'), // 原价
  discountAmount: integer('discount_amount').default(0).notNull(), // 折扣金额
  status: text('status', { enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'] }).default('pending').notNull(),
  paymentMethod: text('payment_method', { enum: ['credits', 'alipay', 'wechat', 'apple_pay'] }),
  transactionId: text('transaction_id'), // 第三方交易ID
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  completedAt: text('completed_at'), // 完成时间
  cancelledAt: text('cancelled_at'), // 取消时间
  refundedAt: text('refunded_at'), // 退款时间
  metadata: text('metadata'), // JSON格式的额外信息
}, (table) => {
  return {
    orderNumberIdx: uniqueIndex('idx_orders_order_number').on(table.orderNumber),
    userIdIdx: index('idx_orders_user_id').on(table.userId),
    statusIdx: index('idx_orders_status').on(table.status),
    typeIdx: index('idx_orders_type').on(table.type),
    createdAtIdx: index('idx_orders_created_at').on(table.createdAt),
  };
});

// 支付记录表
export const payments = sqliteTable('payments', {
  id: text('id').primaryKey().notNull(),
  orderId: text('order_id').notNull(),
  userId: text('user_id').notNull(),
  amount: integer('amount').notNull(), // 支付金额
  currency: text('currency').default('CNY').notNull(),
  method: text('method', { enum: ['alipay', 'wechat', 'apple_pay', 'credits'] }).notNull(),
  status: text('status', { enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'] }).default('pending').notNull(),
  gatewayOrderId: text('gateway_order_id'), // 支付网关订单ID
  gatewayTransactionId: text('gateway_transaction_id'), // 支付网关交易ID
  failureReason: text('failure_reason'), // 失败原因
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  completedAt: text('completed_at'),
  metadata: text('metadata'), // JSON格式的支付网关返回信息
}, (table) => {
  return {
    orderIdIdx: index('idx_payments_order_id').on(table.orderId),
    userIdIdx: index('idx_payments_user_id').on(table.userId),
    statusIdx: index('idx_payments_status').on(table.status),
    methodIdx: index('idx_payments_method').on(table.method),
    createdAtIdx: index('idx_payments_created_at').on(table.createdAt),
  };
});

// 退款记录表
export const refunds = sqliteTable('refunds', {
  id: text('id').primaryKey().notNull(),
  orderId: text('order_id').notNull(),
  paymentId: text('payment_id'),
  userId: text('user_id').notNull(),
  amount: integer('amount').notNull(), // 退款金额
  reason: text('reason').notNull(), // 退款原因
  status: text('status', { enum: ['pending', 'processing', 'completed', 'failed'] }).default('pending').notNull(),
  gatewayRefundId: text('gateway_refund_id'), // 支付网关退款ID
  processedBy: text('processed_by'), // 处理人员ID
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  processedAt: text('processed_at'),
  completedAt: text('completed_at'),
  metadata: text('metadata'), // JSON格式的额外信息
}, (table) => {
  return {
    orderIdIdx: index('idx_refunds_order_id').on(table.orderId),
    paymentIdIdx: index('idx_refunds_payment_id').on(table.paymentId),
    userIdIdx: index('idx_refunds_user_id').on(table.userId),
    statusIdx: index('idx_refunds_status').on(table.status),
    createdAtIdx: index('idx_refunds_created_at').on(table.createdAt),
  };
});
