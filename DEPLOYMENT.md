# 部署详细说明

## 🚀 完整部署流程

### 第一步：Supabase 数据库设置

#### 1.1 创建 Supabase 项目
1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 "Start your project"
3. 使用 GitHub 账号登录或注册新账号
4. 创建新项目：
   - 项目名称：`simple-personal-blog`
   - 数据库密码：生成强密码并保存
   - 选择地区（推荐选择距离较近的地区）

#### 1.2 执行数据库初始化
1. 进入项目控制台
2. 点击左侧菜单 "SQL Editor"
3. 点击 "New query"
4. 复制并粘贴 `supabase-schema.sql` 的内容
5. 点击 "Run" 执行脚本
6. 再次点击 "New query"
7. 复制并粘贴 `supabase-functions.sql` 的内容
8. 点击 "Run" 执行脚本

#### 1.3 获取 API 配置信息
1. 点击左侧菜单 "Project Settings" → "API"
2. 复制以下信息：
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: 以 `eyJ...` 开头的长字符串

### 第二步：项目配置

#### 2.1 本地环境配置
1. 复制环境变量模板：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入实际配置：
   ```env
   SUPABASE_URL=https://your-actual-project-id.supabase.co
   SUPABASE_ANON_KEY=your-actual-anon-key
   ```

#### 2.2 更新 JavaScript 配置
需要编辑以下 4 个 JavaScript 文件，替换 Supabase 配置：

**main.js** (第 8-9 行)：
```javascript
this.supabaseUrl = 'https://your-actual-project-id.supabase.co';
this.supabaseKey = 'your-actual-anon-key';
```

**blog.js** (第 8-9 行)：
```javascript
this.supabaseUrl = 'https://your-actual-project-id.supabase.co';
this.supabaseKey = 'your-actual-anon-key';
```

**post.js** (第 8-9 行)：
```javascript
this.supabaseUrl = 'https://your-actual-project-id.supabase.co';
this.supabaseKey = 'your-actual-anon-key';
```

**about.js** (第 8-9 行)：
```javascript
this.supabaseUrl = 'https://your-actual-project-id.supabase.co';
this.supabaseKey = 'your-actual-anon-key';
```

#### 2.3 本地测试
1. 启动本地服务器：
   ```bash
   # 方法一：使用 Node.js
   npm install
   npm run dev
   
   # 方法二：使用 Python
   python -m http.server 8000
   
   # 方法三：使用 PHP
   php -S localhost:8000
   ```

2. 打开浏览器访问 `http://localhost:8000`
3. 验证页面功能和数据加载

### 第三步：Git 版本控制

#### 3.1 初始化 Git 仓库
```bash
git init
git add .
git commit -m "Initial commit: 简洁个人博客项目"
```

#### 3.2 推送到远程仓库
```bash
# 推送到 GitHub
git remote add origin https://github.com/yourusername/simple-personal-blog.git
git branch -M main
git push -u origin main
```

### 第四步：Netlify 部署

#### 4.1 方法一：拖拽部署（最快）
1. 访问 [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. 注册/登录 Netlify 账号
3. 将整个项目文件夹拖拽到页面中
4. 等待部署完成（约 1-2 分钟）
5. 获得部署地址

#### 4.2 方法二：Git 集成部署（推荐）
1. 访问 [https://app.netlify.com](https://app.netlify.com)
2. 点击 "Add new site" → "Import an existing project"
3. 连接 Git 仓库（GitHub/GitLab/Bitbucket）
4. 选择仓库
5. 配置构建设置：
   - Build command: 留空（不需要构建）
   - Publish directory: 留空（根目录）
6. 点击 "Deploy site"

#### 4.3 配置环境变量
1. 在 Netlify 控制台，进入 Site settings
2. 点击 "Environment variables" → "Edit variables"
3. 添加以下环境变量：
   ```
   Key: SUPABASE_URL
   Value: https://your-actual-project-id.supabase.co
   
   Key: SUPABASE_ANON_KEY
   Value: your-actual-anon-key
   ```
4. 点击 "Save"

#### 4.4 触发重新部署
1. 在部署页面点击 "Trigger deploy" → "Deploy site"
2. 等待重新部署完成

### 第五步：验证部署

#### 5.1 功能测试清单
- [ ] 首页正常加载
- [ ] 文章列表显示正常
- [ ] 文章详情页可访问
- [ ] 评论功能正常
- [ ] 点赞功能正常
- [ ] 关于页面统计正常
- [ ] 移动端适配正常

#### 5.2 数据库测试
1. 在 Supabase 控制台查看数据：
   ```sql
   SELECT * FROM posts;
   SELECT * FROM categories;
   SELECT * FROM comments;
   ```

2. 测试新数据写入：
   - 在网站发表评论
   - 点赞文章
   - 检查数据是否正确保存

### 第六步：域名配置（可选）

#### 6.1 使用 Netlify 子域名
1. 在 Netlify 控制台点击 "Site settings"
2. 找到 "Site information" → "Site name"
3. 修改为想要的名称，如 `my-cool-blog`
4. 访问地址变为 `https://my-cool-blog.netlify.app`

#### 6.2 使用自定义域名
1. 在 Site settings 中点击 "Domain management"
2. 点击 "Add custom domain"
3. 输入域名（如 `blog.yourdomain.com`）
4. 按提示配置 DNS 记录
5. 等待 SSL 证书生成

## 🔧 常见问题解决

### Q1: 部署后页面显示配置提示
**解决方案**：
1. 检查 JavaScript 文件中的 Supabase 配置
2. 确认环境变量设置正确
3. 重新触发部署

### Q2: 数据无法加载
**解决方案**：
1. 检查 Supabase 项目 URL 和密钥
2. 确认数据库表已创建
3. 检查 RLS 策略设置

### Q3: 评论无法提交
**解决方案**：
1. 检查 comments 表的权限设置
2. 确认 RLS 策略允许插入操作
3. 检查网络请求是否成功

### Q4: 样式显示异常
**解决方案**：
1. 检查 CSS 文件路径
2. 清除浏览器缓存
3. 检查控制台错误信息

### Q5: 移动端适配问题
**解决方案**：
1. 检查响应式断点设置
2. 测试不同设备尺寸
3. 调整 CSS 媒体查询

## 📊 监控和维护

### 定期检查
1. **数据库监控**：查看 Supabase 使用情况
2. **访问统计**：查看 Netlify 分析数据
3. **性能优化**：检查页面加载速度
4. **安全更新**：定期更新依赖

### 备份数据
1. **数据库备份**：在 Supabase 中定期导出数据
2. **代码备份**：维护 Git 版本控制
3. **配置备份**：保存环境变量配置

## 🎯 扩展建议

### 短期扩展
- 添加搜索功能
- 实现文章归档
- 添加标签系统
- 优化 SEO

### 长期扩展
- 用户认证系统
- 文章编辑器
- 多语言支持
- 社交媒体集成

---

## 📞 技术支持

如遇到部署问题，可以：
1. 查看项目 Issues
2. 参考 Supabase 和 Netlify 官方文档
3. 在开发者社区提问

**部署成功后，请保存以下信息：**
- Netlify 部署地址：_________________________
- Supabase 项目地址：_______________________
- Git 仓库地址：_____________________________