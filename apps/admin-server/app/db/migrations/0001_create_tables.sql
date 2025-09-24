-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_vip INTEGER DEFAULT 0 NOT NULL,
    vip_expires_at TEXT,
    balance INTEGER DEFAULT 0 NOT NULL
);

-- 创建漫画表
CREATE TABLE IF NOT EXISTS comics (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT NOT NULL,
    cover_image_url TEXT NOT NULL,
    status TEXT DEFAULT 'ongoing' NOT NULL CHECK (status IN ('ongoing', 'completed')),
    genre TEXT,
    tags TEXT,
    views INTEGER DEFAULT 0 NOT NULL,
    likes INTEGER DEFAULT 0 NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_chapter_update TEXT,
    has_updates INTEGER DEFAULT 0 NOT NULL,
    free_chapters INTEGER DEFAULT 0 NOT NULL,
    price INTEGER DEFAULT 0 NOT NULL
);

-- 创建章节表
CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY NOT NULL,
    comic_id TEXT NOT NULL,
    chapter_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    page_count INTEGER DEFAULT 0 NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_free INTEGER DEFAULT 0 NOT NULL,
    FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE,
    UNIQUE(comic_id, chapter_number)
);

-- 创建页面表
CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY NOT NULL,
    chapter_id TEXT NOT NULL,
    page_number INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    UNIQUE(chapter_id, page_number)
);

-- 创建用户漫画关系表
CREATE TABLE IF NOT EXISTS user_comics (
    user_id TEXT NOT NULL,
    comic_id TEXT NOT NULL,
    is_favorited INTEGER DEFAULT 0 NOT NULL,
    last_read_chapter_id TEXT,
    last_read_page_number INTEGER,
    last_read_at TEXT,
    purchased_at TEXT,
    PRIMARY KEY (user_id, comic_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE,
    FOREIGN KEY (last_read_chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
);

-- 创建阅读历史表
CREATE TABLE IF NOT EXISTS reading_history (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    comic_id TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    page_number INTEGER NOT NULL,
    read_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- 创建评论表
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    comic_id TEXT NOT NULL,
    chapter_id TEXT,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    comic_id TEXT NOT NULL,
    chapter_id TEXT,
    amount INTEGER NOT NULL,
    type TEXT DEFAULT 'comic' NOT NULL CHECK (type IN ('comic', 'chapter')),
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- 创建用户章节购买表
CREATE TABLE IF NOT EXISTS user_chapter_purchases (
    user_id TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    purchased_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, chapter_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- 创建系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'string' NOT NULL CHECK (type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_comics_status ON comics(status);
CREATE INDEX IF NOT EXISTS idx_comics_updated_at ON comics(updated_at);
CREATE INDEX IF NOT EXISTS idx_chapters_comic_id ON chapters(comic_id);
CREATE INDEX IF NOT EXISTS idx_pages_chapter_id ON pages(chapter_id);
CREATE INDEX IF NOT EXISTS idx_user_comics_user_id ON user_comics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_comics_comic_id ON user_comics(comic_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_user_comic ON reading_history(user_id, comic_id);
CREATE INDEX IF NOT EXISTS idx_comments_comic_id ON comments(comic_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- 插入初始系统设置
INSERT OR IGNORE INTO system_settings (key, value, type, description) VALUES
('site_name', '漫画管理系统', 'string', '网站名称'),
('chapter_price', '299', 'number', '单章节价格（积分）'),
('max_free_chapters', '5', 'number', '最大免费章节数'),
('upload_max_size', '10485760', 'number', '上传文件最大大小（字节）'),
('allowed_image_types', '["jpg", "jpeg", "png", "webp"]', 'json', '允许的图片类型');
