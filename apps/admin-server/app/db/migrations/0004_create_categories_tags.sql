-- 创建分类和标签相关表

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

-- 创建索引
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

-- 插入初始分类数据
INSERT OR IGNORE INTO categories (id, name, slug, description) VALUES
('cat_action', '动作', 'action', '充满动作和冒险的漫画'),
('cat_romance', '恋爱', 'romance', '浪漫爱情故事'),
('cat_comedy', '搞笑', 'comedy', '轻松幽默的漫画'),
('cat_drama', '剧情', 'drama', '情节丰富的故事'),
('cat_fantasy', '奇幻', 'fantasy', '魔法和奇幻世界'),
('cat_scifi', '科幻', 'sci-fi', '科学幻想题材'),
('cat_horror', '恐怖', 'horror', '恐怖惊悚题材'),
('cat_slice_of_life', '日常', 'slice-of-life', '日常生活题材');

-- 插入初始标签数据
INSERT OR IGNORE INTO tags (id, name, slug, color) VALUES
('tag_hot', '热门', 'hot', '#ff4757'),
('tag_new', '新作', 'new', '#2ed573'),
('tag_completed', '完结', 'completed', '#5352ed'),
('tag_exclusive', '独家', 'exclusive', '#ffa502'),
('tag_free', '免费', 'free', '#70a1ff'),
('tag_vip', 'VIP', 'vip', '#ffd700');
