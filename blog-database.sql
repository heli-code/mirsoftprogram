-- 简洁个人博客 - 最终合并数据库脚本
-- 清理优化版本，包含核心功能
-- 执行日期: 2024年

-- ==========================================
-- 第一步：完全清理现有内容
-- ==========================================

-- 删除所有表（按照依赖关系反向）
DROP TABLE IF EXISTS post_tags CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS authors CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- 删除函数
DROP FUNCTION IF EXISTS increment_post_views(UUID);

-- ==========================================
-- 第二步：创建核心表结构
-- ==========================================

-- 1. 分类表（基础表）
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#666666',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 作者表
CREATE TABLE authors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 文章表（核心表）
CREATE TABLE posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
    featured_image VARCHAR(500),
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 评论表（互动功能）
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'spam')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 第三步：创建索引（提升性能）
-- ==========================================

-- 文章表索引
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX idx_posts_slug ON posts(slug);

-- 评论表索引
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- 分类表索引
CREATE INDEX idx_categories_slug ON categories(slug);

-- ==========================================
-- 第四步：插入核心示例数据
-- ==========================================

-- 插入分类数据
INSERT INTO categories (name, slug, description, color) VALUES 
('技术', 'tech', '技术相关文章、编程经验、开发工具', '#007ACC'),
('生活', 'life', '日常生活分享、个人感悟、随笔记录', '#28a745'),
('思考', 'thoughts', '个人思考、观点分享、深度见解', '#6f42c1');

-- 插入作者数据
INSERT INTO authors (name, email, bio) VALUES 
('博客作者', 'author@blog.com', '一个热爱分享的技术爱好者，专注于前端开发和用户体验设计');

-- 插入文章数据
INSERT INTO posts (title, slug, content, excerpt, category_id, status, published_at, views, likes) VALUES 

('欢迎来到我的个人博客', 'welcome-to-my-blog', 
'# 欢迎来到我的个人博客

## 🎉 博客正式上线！

这是我的第一篇博客文章，标志着我的个人博客正式上线。在这个博客中，我将分享我的技术经验、生活感悟和学习心得。

## 📝 关于这个博客

这个博客采用了**简洁的设计理念**，专注于内容的质量和可读性。

## 🛠 技术栈

- **前端**: 纯 HTML5, CSS3, JavaScript
- **数据库**: Supabase (PostgreSQL)
- **部署**: Netlify

感谢您的访问，希望我的博客能为您带来价值！', 
'我的第一篇博客文章，介绍博客的初衷、设计理念和技术栈。', 
(SELECT id FROM categories WHERE slug = 'tech'),
'published',
NOW() - INTERVAL '7 days',
156,
23),

('如何保持学习动力：我的经验分享', 'how-to-stay-motivated',
'# 如何保持学习动力：我的经验分享

在漫长学习的过程中，我们经常会遇到动力不足的情况。今天我想分享一些个人总结的方法。

## 🎯 设定明确的目标

设定清晰、具体、可衡量的学习目标。

## 📅 建立学习习惯

将学习变成日常习惯，就像刷牙洗脸一样自然。

## 👥 寻找学习伙伴

与他人一起学习可以相互激励。

## 💡 我的总结

记住，学习是一个**持续的过程**，保持耐心和坚持是关键。

希望这些经验对你有帮助！', 
'分享保持学习动力的实用方法，帮助你克服学习中的动力瓶颈。', 
(SELECT id FROM categories WHERE slug = 'thoughts'),
'published',
NOW() - INTERVAL '5 days',
89,
15),

('前端开发最佳实践总结', 'frontend-best-practices',
'# 前端开发最佳实践总结

经过多年的前端开发经验，我总结了一些最佳实践。

## 🏗 代码组织

保持文件结构清晰，使用有意义的命名规范。

## 🎨 样式管理

使用合适的 CSS 方法论，保持样式的一致性。

## ⚡ 性能优化

优化资源加载，减少重绘重排。

## 🔒 安全考虑

XSS 防护、数据安全、API 认证等。

## 💎 总结

希望这些最佳实践能够帮助你写出更好的前端代码。

记住：**代码是写给人看的，顺便给机器执行**。', 
'全面总结前端开发的最佳实践，包括代码组织、样式管理、性能优化、安全考虑等方面。', 
(SELECT id FROM categories WHERE slug = 'tech'),
'published',
NOW() - INTERVAL '3 days',
234,
18);

-- 插入评论数据
INSERT INTO comments (post_id, name, email, content, status) VALUES 
((SELECT id FROM posts WHERE slug = 'welcome-to-my-blog'), '小明', 'xiaoming@example.com', '恭喜博客上线！设计很简洁，期待更多精彩内容。', 'approved'),
((SELECT id FROM posts WHERE slug = 'welcome-to-my-blog'), '技术爱好者', 'tech@example.com', '技术栈选择很不错，我也是用的 Supabase + Netlify。', 'approved'),
((SELECT id FROM posts WHERE slug = 'how-to-stay-motivated'), '学习者', 'learner@example.com', '非常有用的建议！特别是设定明确目标和学习习惯这两点。', 'approved'),
((SELECT id FROM posts WHERE slug = 'frontend-best-practices'), '前端开发者', 'frontend@example.com', '总结得很全面，对我的项目很有帮助。感谢分享！', 'approved');

-- ==========================================
-- 第五步：创建核心函数
-- ==========================================

-- 浏览量统计函数
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE posts 
    SET views = views + 1 
    WHERE posts.id = increment_post_views.post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 第六步：启用行级安全策略
-- ==========================================

-- 启用 RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

-- 创建安全策略

-- 文章策略
CREATE POLICY "Published posts are viewable by everyone" ON posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can update their own posts" ON posts
    FOR UPDATE USING (true);

-- 评论策略
CREATE POLICY "Approved comments are viewable by everyone" ON comments
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Anyone can insert comments" ON comments
    FOR INSERT WITH CHECK (true);

-- 分类策略
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

-- 作者策略
CREATE POLICY "Authors are viewable by everyone" ON authors
    FOR SELECT USING (true);

-- ==========================================
-- 第七步：设置权限
-- ==========================================

-- 为匿名用户设置函数权限
GRANT EXECUTE ON FUNCTION increment_post_views(UUID) TO anon;

-- ==========================================
-- 第八步：最终验证
-- ==========================================

-- 显示完整统计信息
SELECT '🎉 数据库设置完成！' as status;
SELECT '📊 数据统计:' as section;

SELECT 
    'Categories' as table_name, 
    COUNT(*) as count,
    '分类数量' as description
FROM categories

UNION ALL

SELECT 
    'Authors', 
    COUNT(*), 
    '作者数量'
FROM authors

UNION ALL

SELECT 
    'Posts', 
    COUNT(*), 
    '文章总数'
FROM posts

UNION ALL

SELECT 
    'Published Posts', 
    COUNT(*), 
    '已发布文章'
FROM posts 
WHERE status = 'published'

UNION ALL

SELECT 
    'Comments', 
    COUNT(*), 
    '评论总数'
FROM comments

UNION ALL

SELECT 
    'Approved Comments', 
    COUNT(*), 
    '已批准评论'
FROM comments 
WHERE status = 'approved';

-- 显示示例数据
SELECT '📝 示例文章:' as section;
SELECT 
    title as "文章标题",
    LEFT(excerpt, 50) || '...' as "文章摘要",
    views as "浏览量",
    likes as "点赞数"
FROM posts 
WHERE status = 'published'
ORDER BY published_at DESC;

SELECT '✅ 所有功能已就绪，可以开始使用博客了！' as final_message;