-- 漫画系统数据库设计 (Cloudflare D1)

-- 用户表
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  coin_balance INTEGER DEFAULT 0,
  vip_level INTEGER DEFAULT 0,
  vip_expired_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 漫画表
CREATE TABLE comics (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover TEXT, -- R2存储的封面图URL
  author TEXT NOT NULL,
  status TEXT DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed')),
  category TEXT, -- JSON数组存储分类
  rating REAL DEFAULT 0.0,
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  free_chapters INTEGER DEFAULT 0, -- 免费章节数
  price INTEGER DEFAULT 0, -- 价格(分)
  is_hot BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  has_updates BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME
);

-- 章节表
CREATE TABLE chapters (
  id TEXT PRIMARY KEY,
  comic_id TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  page_count INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comic_id) REFERENCES comics (id) ON DELETE CASCADE,
  UNIQUE(comic_id, chapter_number)
);

-- 页面表
CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL,
  page_number INTEGER NOT NULL,
  image_url TEXT NOT NULL, -- R2存储的图片URL
  width INTEGER,
  height INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chapter_id) REFERENCES chapters (id) ON DELETE CASCADE,
  UNIQUE(chapter_id, page_number)
);

-- 用户漫画关系表
CREATE TABLE user_comics (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  comic_id TEXT NOT NULL,
  is_purchased BOOLEAN DEFAULT FALSE,
  is_favorited BOOLEAN DEFAULT FALSE,
  last_read_chapter INTEGER,
  last_read_at DATETIME,
  purchased_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (comic_id) REFERENCES comics (id) ON DELETE CASCADE,
  UNIQUE(user_id, comic_id)
);

-- 阅读历史表
CREATE TABLE reading_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  comic_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  last_page_number INTEGER DEFAULT 1,
  read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (comic_id) REFERENCES comics (id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters (id) ON DELETE CASCADE,
  UNIQUE(user_id, comic_id, chapter_id)
);

-- 评论表
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  comic_id TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  likes_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (comic_id) REFERENCES comics (id) ON DELETE CASCADE
);

-- 订单表
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  comic_id TEXT NOT NULL,
  amount INTEGER NOT NULL, -- 金额(分)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (comic_id) REFERENCES comics (id) ON DELETE CASCADE
);

-- 分类表
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引优化
CREATE INDEX idx_comics_status ON comics(status);
CREATE INDEX idx_comics_is_hot ON comics(is_hot);
CREATE INDEX idx_comics_is_new ON comics(is_new);
CREATE INDEX idx_comics_has_updates ON comics(has_updates);
CREATE INDEX idx_comics_created_at ON comics(created_at);
CREATE INDEX idx_chapters_comic_id ON chapters(comic_id);
CREATE INDEX idx_chapters_published ON chapters(is_published, published_at);
CREATE INDEX idx_pages_chapter_id ON pages(chapter_id);
CREATE INDEX idx_user_comics_user_id ON user_comics(user_id);
CREATE INDEX idx_user_comics_favorited ON user_comics(user_id, is_favorited);
CREATE INDEX idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX idx_comments_comic_id ON comments(comic_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- 插入默认分类
INSERT INTO categories (id, name, description, sort_order) VALUES
('romance', '恋爱', '浪漫爱情类漫画', 1),
('action', '动作', '热血战斗类漫画', 2),
('comedy', '喜剧', '搞笑幽默类漫画', 3),
('drama', '剧情', '深度剧情类漫画', 4),
('fantasy', '奇幻', '魔法幻想类漫画', 5),
('horror', '恐怖', '惊悚恐怖类漫画', 6),
('slice-of-life', '日常', '生活日常类漫画', 7),
('school', '校园', '校园生活类漫画', 8);
