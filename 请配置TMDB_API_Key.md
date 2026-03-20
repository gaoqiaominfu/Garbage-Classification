# ⚠️ 重要：请配置 TMDB API Key

## 🎯 搜索没反应的原因

**TMDB API Key 没配置！**

---

## 📝 5 分钟申请 TMDB API Key

### 步骤 1: 访问 TMDB
```
https://www.themoviedb.org/
```

### 步骤 2: 注册账号
1. 点击右上角「Join TMDB」
2. 填写邮箱、用户名、密码
3. 验证邮箱

### 步骤 3: 申请 API Key
1. 登录后点击头像 →「Settings」
2. 左侧菜单 →「API」
3. 点击「Click here to request an API Key」
4. 选择「Developer」类型
5. 填写申请表：
   - **Application Name**: 追剧助手
   - **Application URL**: https://localhost
   - **Application Summary**: 个人追剧记录小程序
6. 提交后等待审核（通常几分钟）

### 步骤 4: 复制 API Key
审核通过后，在 API 页面看到：
```
API Key (v3 auth): xxxxxxxxxxxxxxxxxxxxxxxx
```
点击复制！

---

## ⚙️ 配置到项目

### 打开 utils/config.js

找到第 6 行：
```javascript
apiKey: '' // 需配置 TMDB API Key
```

### 改为：
```javascript
apiKey: 'xxxxxxxxxxxxxxxxxxxxxxxx', // 你的 API Key
```

**例如：**
```javascript
tmdb: {
  baseUrl: 'https://api.themoviedb.org/3',
  imageBaseUrl: 'https://image.tmdb.org/t/p/w500',
  apiKey: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', // 你的实际 API Key
},
```

---

## 🧪 测试

### 1. 保存 config.js

### 2. 微信开发者工具 → 编译

### 3. 搜索测试
- 进入搜索页
- 输入「狂飙」
- 点击搜索
- 应该能看到搜索结果！

---

## 🌐 配置域名（重要！）

### 小程序后台配置：

1. 登录 https://mp.weixin.qq.com/
2. 开发管理 → 开发设置
3. 服务器域名 → request 合法域名
4. 添加：
   ```
   https://api.themoviedb.org
   https://image.tmdb.org
   ```
5. 保存

---

## ✅ 检查清单

- [ ] 申请 TMDB API Key
- [ ] 填入 `utils/config.js`
- [ ] 配置小程序域名
- [ ] 保存并编译
- [ ] 测试搜索功能

---

**配置完成后，搜索就能用了！** 🎉
