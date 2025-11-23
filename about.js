// 关于页面 JavaScript
class AboutApp {
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
            this.supabase = window.supabase.createClient(this.supabaseUrl, this.supabaseKey);
            
            // 加载统计数据
            await this.loadStats();
            
            console.log('关于页面初始化成功');
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('无法加载统计数据');
        }
    }

    async loadStats() {
        try {
            // 并发请求所有统计数据
            const [postsResult, viewsResult, commentsResult] = await Promise.all([
                this.supabase
                    .from('posts')
                    .select('count', { count: 'exact', head: true })
                    .eq('status', 'published'),
                    
                this.supabase
                    .from('posts')
                    .select('views')
                    .eq('status', 'published'),
                    
                this.supabase
                    .from('comments')
                    .select('count', { count: 'exact, head: true })
                    .eq('status', 'approved')
            ]);

            // 计算总浏览量
            const totalViews = viewsResult.data ? 
                viewsResult.data.reduce((sum, post) => sum + (post.views || 0), 0) : 0;

            // 更新DOM
            this.updateStats({
                posts: postsResult.count || 0,
                views: totalViews,
                comments: commentsResult.count || 0
            });

        } catch (error) {
            console.error('加载统计数据失败:', error);
            this.showError('加载统计数据失败');
        }
    }

    updateStats(stats) {
        // 使用动画效果更新数字
        this.animateNumber('total-posts', stats.posts);
        this.animateNumber('total-views', stats.views);
        this.animateNumber('total-comments', stats.comments);
    }

    animateNumber(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const duration = 2000; // 2秒动画
        const steps = 60; // 60步
        const stepValue = targetValue / steps;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const currentValue = Math.min(Math.floor(stepValue * currentStep), targetValue);
            element.textContent = currentValue.toLocaleString('zh-CN');

            if (currentStep >= steps) {
                clearInterval(timer);
                element.textContent = targetValue.toLocaleString('zh-CN');
            }
        }, duration / steps);
    }

    showError(message) {
        console.error(message);
        // 可以选择显示错误信息给用户
        const statsElements = ['total-posts', 'total-views', 'total-comments'];
        statsElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '--';
                element.style.color = '#999';
            }
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 直接启动应用，配置已在类中设置
    window.aboutApp = new AboutApp();
});