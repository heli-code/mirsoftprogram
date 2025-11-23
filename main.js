// 主页 JavaScript - 集成 Supabase
class BlogApp {
    constructor() {
        // 从环境变量或默认值获取 Supabase 配置
        this.supabaseUrl = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') ? 
            'https://hlszmnqtoccezqagbuyd.supabase.co' : 
            (process.env.SUPABASE_URL || 'https://your-project.supabase.co');
        this.supabaseKey = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') ? 
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsc3ptbnF0b2NjZXpxYWdidXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NzU4NzMsImV4cCI6MjA3OTQ1MTg3M30.sUAvFoKTIiADmWewa2CPy8bJCYAGU4xNCqdrbmwSvJQ' : 
            (process.env.SUPABASE_ANON_KEY || 'your-anon-key');
        this.supabase = null;
        this.init();
    }

    async init() {
        try {
            // 初始化 Supabase
            this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
            
            // 加载最新文章
            await this.loadLatestPosts();
            
            console.log('博客应用初始化成功');
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('无法连接到数据库，请检查配置');
        }
    }

    async loadLatestPosts() {
        try {
            const { data: posts, error } = await this.supabase
                .from('posts')
                .select(`
                    *,
                    categories:category_id(name, slug)
                `)
                .eq('status', 'published')
                .order('published_at', { ascending: false })
                .limit(6);

            if (error) throw error;

            const container = document.getElementById('latest-posts-container');
            if (posts && posts.length > 0) {
                container.innerHTML = posts.map(post => this.createPostCard(post)).join('');
            } else {
                container.innerHTML = '<p>暂无文章</p>';
            }
        } catch (error) {
            console.error('加载文章失败:', error);
            this.showError('加载文章失败');
        }
    }

    createPostCard(post) {
        const date = new Date(post.published_at).toLocaleDateString('zh-CN');
        const category = post.categories ? post.categories.name : '未分类';
        
        return `
            <article class="post-card">
                <a href="post.html?id=${post.id}">
                    <h4>${this.escapeHtml(post.title)}</h4>
                    <div class="post-meta">
                        <span>${date}</span>
                        <span>•</span>
                        <span>${this.escapeHtml(category)}</span>
                    </div>
                    <p class="post-excerpt">
                        ${this.escapeHtml(post.excerpt || this.truncateText(post.content, 120))}
                    </p>
                    <span class="read-more">阅读更多 →</span>
                </a>
            </article>
        `;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        const container = document.getElementById('latest-posts-container');
        container.innerHTML = `<p style="color: #e74c3c;">${message}</p>`;
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 直接启动应用，配置已在类中设置
    window.blogApp = new BlogApp();
});

// 导出为模块（如果需要）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogApp;
}