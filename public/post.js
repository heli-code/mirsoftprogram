// 文章详情页 JavaScript
class PostDetailApp {
    constructor() {
        // 从环境变量或默认值获取 Supabase 配置
        // 使用全局window对象的环境变量访问方式，兼容Netlify部署
        const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
        this.supabaseUrl = isLocal ? 
            'https://hlszmnqtoccezqagbuyd.supabase.co' : 
            (typeof process !== 'undefined' && process.env && process.env.SUPABASE_URL) || 
            'https://hlszmnqtoccezqagbuyd.supabase.co'; // 默认使用生产环境URL
        this.supabaseKey = isLocal ? 
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsc3ptbnF0b2NjZXpxYWdidXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NzU4NzMsImV4cCI6MjA3OTQ1MTg3M30.sUAvFoKTIiADmWewa2CPy8bJCYAGU4xNCqdrbmwSvJQ' : 
            (typeof process !== 'undefined' && process.env && process.env.SUPABASE_ANON_KEY) || 
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsc3ptbnF0b2NjZXpxYWdidXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NzU4NzMsImV4cCI6MjA3OTQ1MTg3M30.sUAvFoKTIiADmWewa2CPy8bJCYAGU4xNCqdrbmwSvJQ'; // 默认使用生产环境密钥
        this.supabase = null;
        this.currentPost = null;
        this.init();
    }

    async init() {
        try {
            this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
            
            // 从URL获取文章ID
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('id');
            
            if (!postId) {
                this.showError('未找到文章ID');
                return;
            }
            
            // 加载文章
            await this.loadPost(postId);
            
            // 设置事件监听
            this.setupEventListeners();
            
            console.log('文章详情页初始化成功');
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('无法加载文章');
        }
    }

    async loadPost(postId) {
        try {
            const { data: post, error } = await this.supabase
                .from('posts')
                .select(`
                    *,
                    categories(name, slug, color),
                    authors(name, avatar_url)
                `)
                .eq('id', postId)
                .eq('status', 'published')
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    this.showError('文章不存在');
                } else {
                    throw error;
                }
                return;
            }

            this.currentPost = post;
            this.renderPost(post);
            
            // 增加浏览量
            await this.incrementViews(postId);
            
            // 加载评论
            await this.loadComments(postId);
            
        } catch (error) {
            console.error('加载文章失败:', error);
            this.showError('加载文章失败');
        }
    }

    renderPost(post) {
        document.getElementById('page-title').textContent = `${post.title} - 我的个人博客`;
        document.getElementById('post-title').textContent = post.title;
        document.getElementById('post-date').textContent = new Date(post.published_at).toLocaleDateString('zh-CN');
        document.getElementById('post-views').textContent = `${post.views + 1} 次阅读`;
        document.getElementById('like-count').textContent = post.likes || 0;
        
        // 分类
        const categoryElement = document.getElementById('post-category');
        if (post.categories) {
            categoryElement.innerHTML = `<span style="color: ${post.categories.color}">${this.escapeHtml(post.categories.name)}</span>`;
        } else {
            categoryElement.textContent = '未分类';
        }
        
        // 文章内容
        const postBody = document.getElementById('post-body');
        postBody.innerHTML = this.markdownToHtml(post.content);
        
        // 隐藏加载提示，显示文章内容
        document.getElementById('post-loading').style.display = 'none';
        document.getElementById('post-content').style.display = 'block';
    }

    async loadComments(postId) {
        try {
            const { data: comments, error } = await this.supabase
                .from('comments')
                .select('*')
                .eq('post_id', postId)
                .eq('status', 'approved')
                .order('created_at', { ascending: true });

            if (error) throw error;

            const container = document.getElementById('comments-container');
            if (comments && comments.length > 0) {
                container.innerHTML = comments.map(comment => this.createCommentElement(comment)).join('');
            } else {
                container.innerHTML = '<p style="color: #666; text-align: center;">暂无评论，来做第一个评论的人吧！</p>';
            }
        } catch (error) {
            console.error('加载评论失败:', error);
        }
    }

    createCommentElement(comment) {
        const date = new Date(comment.created_at).toLocaleDateString('zh-CN');
        return `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-author">${this.escapeHtml(comment.name)}</span>
                    <span class="comment-date">${date}</span>
                </div>
                <div class="comment-content">
                    ${this.escapeHtml(comment.content)}
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // 点赞按钮
        const likeButton = document.getElementById('like-button');
        if (likeButton && this.currentPost) {
            likeButton.addEventListener('click', () => this.handleLike());
        }
        
        // 评论表单
        const commentForm = document.getElementById('comment-form');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => this.handleCommentSubmit(e));
        }
    }

    async handleLike() {
        if (!this.currentPost) return;
        
        try {
            const { error } = await this.supabase
                .from('posts')
                .update({ likes: (this.currentPost.likes || 0) + 1 })
                .eq('id', this.currentPost.id);

            if (error) throw error;
            
            // 更新本地数据和UI
            this.currentPost.likes = (this.currentPost.likes || 0) + 1;
            const likeCount = document.getElementById('like-count');
            likeCount.textContent = this.currentPost.likes;
            
            // 禁用点赞按钮防止重复点击
            document.getElementById('like-button').disabled = true;
            document.getElementById('like-button').textContent = `✓ 已点赞 (${this.currentPost.likes})`;
            
        } catch (error) {
            console.error('点赞失败:', error);
        }
    }

    async handleCommentSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('comment-name').value.trim();
        const content = document.getElementById('comment-content').value.trim();
        
        if (!name || !content) {
            alert('请填写姓名和评论内容');
            return;
        }
        
        try {
            const { error } = await this.supabase
                .from('comments')
                .insert({
                    post_id: this.currentPost.id,
                    name: name,
                    content: content,
                    status: 'approved', // 自动批准评论
                    ip_address: await this.getClientIP(),
                    user_agent: navigator.userAgent
                });

            if (error) throw error;
            
            // 清空表单
            e.target.reset();
            
            // 重新加载评论
            await this.loadComments(this.currentPost.id);
            
            alert('评论发表成功！');
            
        } catch (error) {
            console.error('发表评论失败:', error);
            alert('发表评论失败，请重试');
        }
    }

    async incrementViews(postId) {
        try {
            await this.supabase.rpc('increment_post_views', { 
                post_id: postId 
            });
        } catch (error) {
            console.error('更新浏览量失败:', error);
        }
    }

    async getClientIP() {
        // 简单的IP获取方法，实际项目中可能需要更复杂的实现
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return null;
        }
    }

    markdownToHtml(text) {
        // 简单的Markdown转HTML实现
        return text
            // 标题
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // 粗体
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // 斜体
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // 链接
            .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            // 代码
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // 段落
            .replace(/\n\n/g, '</p><p>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>')
            // 列表
            .replace(/^\- (.+)$/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        document.getElementById('post-loading').style.display = 'none';
        document.getElementById('post-error').style.display = 'block';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 直接启动应用，配置已在类中设置
    window.postDetailApp = new PostDetailApp();
});