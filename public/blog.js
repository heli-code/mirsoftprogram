// 博客列表页 JavaScript
class BlogListApp {
    constructor() {
        // 从环境变量或默认值获取 Supabase 配置
        this.supabaseUrl = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') ? 
            'https://hlszmnqtoccezqagbuyd.supabase.co' : 
            (process.env.SUPABASE_URL || 'https://your-project.supabase.co');
        this.supabaseKey = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1') ? 
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsc3ptbnF0b2NjZXpxYWdidXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NzU4NzMsImV4cCI6MjA3OTQ1MTg3M30.sUAvFoKTIiADmWewa2CPy8bJCYAGU4xNCqdrbmwSvJQ' : 
            (process.env.SUPABASE_ANON_KEY || 'your-anon-key');
        this.supabase = null;
        this.currentCategory = null;
        this.categories = {}; // 缓存分类数据
        this.init();
    }

    async init() {
        try {
            // 确保加载状态正确
            const loading = document.getElementById('loading');
            const container = document.getElementById('blog-posts-container');
            if (loading) loading.style.display = 'block';
            if (container) container.innerHTML = '';
            
            // 添加超时保护
            const timeout = setTimeout(() => {
                if (loading) loading.style.display = 'none';
                if (container) container.innerHTML = '<p style="color: orange; text-align: center;">加载超时，请刷新页面重试</p>';
            }, 10000); // 10秒超时
            
            this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
            
            // 加载分类
            await this.loadCategories();
            
            // 加载文章列表
            await this.loadBlogPosts();
            
            // 清除超时
            clearTimeout(timeout);
            
            // 监听URL变化
            this.setupEventListeners();
            
            console.log('博客列表页初始化成功');
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('无法加载数据');
        }
    }

    async loadCategories() {
        try {
            const { data: categories, error } = await this.supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;

            // 缓存分类数据
            if (categories) {
                categories.forEach(cat => {
                    this.categories[cat.id] = cat;
                });

                const container = document.getElementById('categories-container');
                container.innerHTML = `
                    <div class="category-item" data-category="all" style="background: #3498db; color: white; padding: 1rem; border-radius: 8px; margin: 0.5rem; cursor: pointer; text-align: center;">
                        全部文章
                    </div>
                    ${categories.map(cat => `
                        <div class="category-item" data-category="${cat.id}" style="background: ${cat.color || '#2ecc71'}; color: white; padding: 1rem; border-radius: 8px; margin: 0.5rem; cursor: pointer; text-align: center;">
                            ${this.escapeHtml(cat.name)}
                        </div>
                    `).join('')}
                `;
                
                // 添加分类点击事件
                container.addEventListener('click', (e) => {
                    if (e.target.classList.contains('category-item')) {
                        e.preventDefault();
                        const categoryId = e.target.dataset.category;
                        this.filterByCategory(categoryId);
                    }
                });
            }
        } catch (error) {
            console.error('加载分类失败:', error);
        }
    }

    async loadBlogPosts(categoryId = null) {
        try {
            console.log('开始加载文章...');
            const loading = document.getElementById('loading');
            const container = document.getElementById('blog-posts-container');
            
            if (!loading || !container) {
                console.error('未找到必要的DOM元素');
                return;
            }
            
            loading.style.display = 'block';
            container.innerHTML = '';

            let query = this.supabase
                .from('posts')
                .select(`
                    *,
                    categories:category_id(name, slug)
                `)
                .eq('status', 'published')
                .order('published_at', { ascending: false });

            if (categoryId && categoryId !== 'all') {
                query = query.eq('category_id', categoryId);
            }

            console.log('执行查询...');
            const { data: posts, error } = await query;
            console.log('查询结果:', { posts, error });

            // 确保加载状态隐藏
            if (loading) loading.style.display = 'none';

            if (error) {
                console.error('查询错误:', error);
                if (container) container.innerHTML = `<p style="color: red; text-align: center;">查询失败: ${error.message}</p>`;
                return;
            }

            if (posts && posts.length > 0) {
                console.log(`找到 ${posts.length} 篇文章`);
                if (container) {
                    container.innerHTML = posts.map(post => this.createPostCard(post)).join('');
                }
            } else {
                console.log('未找到文章');
                if (container) {
                    container.innerHTML = '<p style="text-align: center; color: #666;">暂无文章</p>';
                }
            }
        } catch (error) {
            console.error('加载文章失败:', error);
            this.showError('加载文章失败');
        }
    }

    // 使用与main.js相同的方法名和实现
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

    filterByCategory(categoryId) {
        // 更新当前分类
        this.currentCategory = categoryId;
        
        // 更新分类高亮
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.toggle('active', item.dataset.category === categoryId);
        });
        
        // 重新加载文章
        this.loadBlogPosts(categoryId);
    }

    setupEventListeners() {
        // 监听浏览器后退/前进
        window.addEventListener('popstate', (e) => {
            const categoryId = e.state?.category || 'all';
            this.filterByCategory(categoryId);
        });
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
        const container = document.getElementById('blog-posts-container');
        container.innerHTML = `<p style="color: #e74c3c; text-align: center;">${message}</p>`;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 直接启动应用，配置已在类中设置
    window.blogListApp = new BlogListApp();
});