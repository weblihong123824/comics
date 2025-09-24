-- 模块化 Schema 迁移
-- 基于图片中的命名规范重构数据库结构

-- 删除旧的索引（如果存在）
DROP INDEX IF EXISTS idx_comics_status;
DROP INDEX IF EXISTS idx_comics_updated_at;
DROP INDEX IF EXISTS idx_chapters_comic_id;
DROP INDEX IF EXISTS idx_pages_chapter_id;
DROP INDEX IF EXISTS idx_user_comics_user_id;
DROP INDEX IF EXISTS idx_user_comics_comic_id;
DROP INDEX IF EXISTS idx_reading_history_user_comic;
DROP INDEX IF EXISTS idx_comments_comic_id;
DROP INDEX IF EXISTS idx_orders_user_id;

-- 1. 分类表
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    is_active INTEGER DEFAULT 1 NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. 标签表
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    color TEXT,
    description TEXT,
    usage_count INTEGER DEFAULT 0 NOT NULL,
    is_active INTEGER DEFAULT 1 NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. 漫画分类关系表
CREATE TABLE IF NOT EXISTS comic_categories (
    comic_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (comic_id, category_id)
);

-- 4. 漫画标签关系表
CREATE TABLE IF NOT EXISTS comic_tags (
    comic_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (comic_id, tag_id)
);

-- 5. 更新漫画表结构
ALTER TABLE comics ADD COLUMN is_recommended INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE comics ADD COLUMN sort_order INTEGER DEFAULT 0 NOT NULL;

-- 6. 更新章节表结构
ALTER TABLE chapters ADD COLUMN is_published INTEGER DEFAULT 1 NOT NULL;

-- 7. 更新页面表结构
ALTER TABLE pages ADD COLUMN thumbnail_url TEXT;

-- 8. 更新用户漫画关系表
ALTER TABLE user_comics ADD COLUMN rating INTEGER;
ALTER TABLE user_comics ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE user_comics ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- 9. 用户配额交易记录表
CREATE TABLE IF NOT EXISTS user_quota_transactions (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'consume', 'refund', 'reward')),
    amount INTEGER NOT NULL,
    balance INTEGER NOT NULL,
    description TEXT NOT NULL,
    related_order_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 10. 用户解锁资源表
CREATE TABLE IF NOT EXISTS user_unlock_resources (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('comic', 'chapter')),
    resource_id TEXT NOT NULL,
    unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TEXT,
    method TEXT NOT NULL CHECK (method IN ('purchase', 'vip', 'free', 'gift'))
);

-- 11. 支付记录表
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY NOT NULL,
    order_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'CNY' NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('alipay', 'wechat', 'apple_pay', 'credits')),
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    gateway_order_id TEXT,
    gateway_transaction_id TEXT,
    failure_reason TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TEXT,
    metadata TEXT
);

-- 12. 退款记录表
CREATE TABLE IF NOT EXISTS refunds (
    id TEXT PRIMARY KEY NOT NULL,
    order_id TEXT NOT NULL,
    payment_id TEXT,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    gateway_refund_id TEXT,
    processed_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    processed_at TEXT,
    completed_at TEXT,
    metadata TEXT
);

-- 13. 评论点赞表
CREATE TABLE IF NOT EXISTS comment_likes (
    user_id TEXT NOT NULL,
    comment_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('like', 'dislike')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, comment_id)
);

-- 14. 用户反馈表
CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT,
    type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'complaint', 'suggestion', 'other')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    email TEXT,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to TEXT,
    response TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    resolved_at TEXT
);

-- 15. 举报表
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY NOT NULL,
    reporter_id TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('comic', 'comment', 'user')),
    target_id TEXT NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'copyright', 'harassment', 'other')),
    description TEXT,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
    reviewed_by TEXT,
    review_note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reviewed_at TEXT
);

-- 16. 用户统计表
CREATE TABLE IF NOT EXISTS user_stats (
    user_id TEXT PRIMARY KEY NOT NULL,
    total_read_time INTEGER DEFAULT 0 NOT NULL,
    total_comics_read INTEGER DEFAULT 0 NOT NULL,
    total_chapters_read INTEGER DEFAULT 0 NOT NULL,
    total_pages_read INTEGER DEFAULT 0 NOT NULL,
    total_spent INTEGER DEFAULT 0 NOT NULL,
    favorite_genres TEXT,
    last_active_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 17. 漫画统计表
CREATE TABLE IF NOT EXISTS comic_stats (
    comic_id TEXT PRIMARY KEY NOT NULL,
    total_views INTEGER DEFAULT 0 NOT NULL,
    unique_readers INTEGER DEFAULT 0 NOT NULL,
    total_read_time INTEGER DEFAULT 0 NOT NULL,
    average_rating REAL DEFAULT 0 NOT NULL,
    total_ratings INTEGER DEFAULT 0 NOT NULL,
    total_comments INTEGER DEFAULT 0 NOT NULL,
    total_favorites INTEGER DEFAULT 0 NOT NULL,
    total_revenue INTEGER DEFAULT 0 NOT NULL,
    conversion_rate REAL DEFAULT 0 NOT NULL,
    last_view_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 18. 日统计表
CREATE TABLE IF NOT EXISTS daily_stats (
    id TEXT PRIMARY KEY NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('users', 'comics', 'revenue', 'views')),
    new_users INTEGER DEFAULT 0 NOT NULL,
    active_users INTEGER DEFAULT 0 NOT NULL,
    new_comics INTEGER DEFAULT 0 NOT NULL,
    total_views INTEGER DEFAULT 0 NOT NULL,
    total_revenue INTEGER DEFAULT 0 NOT NULL,
    total_orders INTEGER DEFAULT 0 NOT NULL,
    average_session_time INTEGER DEFAULT 0 NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 19. 管理员表
CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'editor' NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator', 'editor')),
    permissions TEXT,
    is_active INTEGER DEFAULT 1 NOT NULL,
    last_login_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by TEXT
);

-- 20. 管理员操作日志表
CREATE TABLE IF NOT EXISTS admin_logs (
    id TEXT PRIMARY KEY NOT NULL,
    admin_id TEXT NOT NULL,
    action TEXT NOT NULL,
    resource TEXT,
    resource_id TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 21. 通知表
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT,
    type TEXT NOT NULL CHECK (type IN ('system', 'comic_update', 'payment', 'comment', 'promotion')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    data TEXT,
    is_read INTEGER DEFAULT 0 NOT NULL,
    read_at TEXT,
    expires_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 22. 文件上传记录表
CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('comic_cover', 'comic_page', 'avatar', 'system')),
    metadata TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 23. 更新订单表结构
ALTER TABLE orders ADD COLUMN order_number TEXT;
ALTER TABLE orders ADD COLUMN item_id TEXT;
ALTER TABLE orders ADD COLUMN item_title TEXT;
ALTER TABLE orders ADD COLUMN original_amount INTEGER;
ALTER TABLE orders ADD COLUMN discount_amount INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE orders ADD COLUMN payment_method TEXT;
ALTER TABLE orders ADD COLUMN transaction_id TEXT;
ALTER TABLE orders ADD COLUMN cancelled_at TEXT;
ALTER TABLE orders ADD COLUMN refunded_at TEXT;
ALTER TABLE orders ADD COLUMN metadata TEXT;

-- 24. 更新评论表结构
ALTER TABLE comments ADD COLUMN parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE;
ALTER TABLE comments ADD COLUMN rating INTEGER;
ALTER TABLE comments ADD COLUMN likes INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE comments ADD COLUMN dislikes INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE comments ADD COLUMN is_hidden INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE comments ADD COLUMN is_reported INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE comments ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- 25. 更新阅读历史表结构
ALTER TABLE reading_history ADD COLUMN read_duration INTEGER;
ALTER TABLE reading_history ADD COLUMN device_type TEXT;

-- 26. 更新系统设置表结构
ALTER TABLE system_settings ADD COLUMN category TEXT DEFAULT 'general' NOT NULL;
ALTER TABLE system_settings ADD COLUMN is_public INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE system_settings ADD COLUMN updated_by TEXT;

-- 创建新的索引
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_active ON tags(is_active);
CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON tags(usage_count);

CREATE INDEX IF NOT EXISTS idx_comic_categories_comic_id ON comic_categories(comic_id);
CREATE INDEX IF NOT EXISTS idx_comic_categories_category_id ON comic_categories(category_id);

CREATE INDEX IF NOT EXISTS idx_comic_tags_comic_id ON comic_tags(comic_id);
CREATE INDEX IF NOT EXISTS idx_comic_tags_tag_id ON comic_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_comics_status ON comics(status);
CREATE INDEX IF NOT EXISTS idx_comics_updated_at ON comics(updated_at);
CREATE INDEX IF NOT EXISTS idx_comics_views ON comics(views);
CREATE INDEX IF NOT EXISTS idx_comics_recommended ON comics(is_recommended);

CREATE INDEX IF NOT EXISTS idx_chapters_comic_id ON chapters(comic_id);
CREATE INDEX IF NOT EXISTS idx_chapters_published ON chapters(is_published);

CREATE INDEX IF NOT EXISTS idx_pages_chapter_id ON pages(chapter_id);

CREATE INDEX IF NOT EXISTS idx_user_comics_user_id ON user_comics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_comics_comic_id ON user_comics(comic_id);
CREATE INDEX IF NOT EXISTS idx_user_comics_favorited ON user_comics(is_favorited);

CREATE INDEX IF NOT EXISTS idx_user_quota_transactions_user_id ON user_quota_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quota_transactions_type ON user_quota_transactions(type);
CREATE INDEX IF NOT EXISTS idx_user_quota_transactions_created_at ON user_quota_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_user_unlock_resources_user_resource ON user_unlock_resources(user_id, resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_user_unlock_resources_user_id ON user_unlock_resources(user_id);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_priority ON feedback(priority);

CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_target ON reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

CREATE INDEX IF NOT EXISTS idx_user_stats_last_active_at ON user_stats(last_active_at);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_read_time ON user_stats(total_read_time);

CREATE INDEX IF NOT EXISTS idx_comic_stats_total_views ON comic_stats(total_views);
CREATE INDEX IF NOT EXISTS idx_comic_stats_average_rating ON comic_stats(average_rating);

CREATE INDEX IF NOT EXISTS idx_daily_stats_date_type ON daily_stats(date, type);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_category ON uploads(category);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at);

-- 插入初始数据
INSERT OR IGNORE INTO categories (id, name, slug, description) VALUES
('cat_action', '动作', 'action', '充满动作和冒险的漫画'),
('cat_romance', '恋爱', 'romance', '浪漫爱情故事'),
('cat_comedy', '搞笑', 'comedy', '轻松幽默的漫画'),
('cat_drama', '剧情', 'drama', '情节丰富的故事'),
('cat_fantasy', '奇幻', 'fantasy', '魔法和奇幻世界'),
('cat_scifi', '科幻', 'sci-fi', '科学幻想题材'),
('cat_horror', '恐怖', 'horror', '恐怖惊悚题材'),
('cat_slice_of_life', '日常', 'slice-of-life', '日常生活题材');

INSERT OR IGNORE INTO tags (id, name, slug, color) VALUES
('tag_hot', '热门', 'hot', '#ff4757'),
('tag_new', '新作', 'new', '#2ed573'),
('tag_completed', '完结', 'completed', '#5352ed'),
('tag_exclusive', '独家', 'exclusive', '#ffa502'),
('tag_free', '免费', 'free', '#70a1ff'),
('tag_vip', 'VIP', 'vip', '#ffd700');

-- 插入系统设置
INSERT OR IGNORE INTO system_settings (key, value, type, category, description, is_public) VALUES
('site_name', '漫画管理系统', 'string', 'general', '网站名称', 1),
('site_description', '专业的漫画阅读平台', 'string', 'general', '网站描述', 1),
('chapter_price', '299', 'number', 'payment', '单章节价格（积分）', 0),
('max_free_chapters', '5', 'number', 'payment', '最大免费章节数', 0),
('upload_max_size', '10485760', 'number', 'upload', '上传文件最大大小（字节）', 0),
('allowed_image_types', '["jpg", "jpeg", "png", "webp"]', 'json', 'upload', '允许的图片类型', 0),
('vip_monthly_price', '1999', 'number', 'payment', 'VIP月费价格（积分）', 0),
('new_user_credits', '1000', 'number', 'user', '新用户赠送积分', 0);
