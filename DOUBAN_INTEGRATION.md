# 豆瓣 API 集成说明

## 📦 已完成的集成

### 新增文件

1. **`utils/douban-proxy.js`** - 豆瓣代理 API 封装
   - 支持多个代理源自动切换
   - 提供搜索、详情获取等功能
   - 数据格式转换为项目统一格式

2. **`utils/api-provider.js`** - 统一 API 提供者管理
   - 整合 TMDB 和豆瓣 API
   - 自动故障切换 (TMDB 失败→豆瓣)
   - 统一的接口调用方式

3. **`utils/config.js`** (已更新) - 配置文件
   - 添加豆瓣 API 配置
   - 支持 API 源选择 (auto/tmdb/douban)

4. **`pages/search/search.js`** (已更新) - 搜索页
   - 使用统一 API 提供者
   - 显示当前 API 源

5. **`pages/search/search.wxml`** (已更新) - 搜索页 UI
   - 添加 API 源指示器

6. **`pages/search/search.wxss`** (已更新) - 搜索页样式
   - API 源徽章样式

---

## 🔧 使用方法

### 方式 1: 自动切换 (推荐)

在 `utils/config.js` 中设置：
```javascript
apiProvider: 'auto'  // 优先 TMDB，失败自动切豆瓣
```

### 方式 2: 指定 API 源

```javascript
// 强制使用 TMDB
apiProvider: 'tmdb'

// 强制使用豆瓣
apiProvider: 'douban'
```

### 代码调用示例

```javascript
const apiProvider = require('../../utils/api-provider.js');

// 搜索 (自动切换 API 源)
apiProvider.search('狂飙')
  .then(res => {
    console.log('API 源:', res.source);  // 'tmdb' 或 'douban'
    console.log('数据:', res.data);
  });

// 获取详情
apiProvider.getTVDetail('douban_123456')  // 豆瓣 ID
  .then(res => console.log(res.data));

apiProvider.getTVDetail('tmdb_123456')   // TMDB ID
  .then(res => console.log(res.data));
```

---

## ⚠️ 豆瓣代理 API 现状

### 问题
豆瓣官方 API v2 已不公开开放，目前只能使用第三方代理：

| 代理源 | 状态 | 说明 |
|--------|------|------|
| api.douban.uomg.com | ⚠️ 不稳定 | 有时无法访问 |
| douban-api.uomg.com | ⚠️ 不稳定 | 同上 |
| api.imsyy.top/douban | ⚠️ 不稳定 | 个人维护 |

### 解决方案

1. **多代理源自动切换** - 代码已实现
2. **TMDB 作为主 API** - 稳定可靠
3. **豆瓣作为备用** - 中文数据补充

---

## 🎯 推荐配置

### 国内用户
```javascript
// utils/config.js
module.exports = {
  apiProvider: 'auto',  // 自动切换
  
  tmdb: {
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p/w500',
    apiKey: 'YOUR_TMDB_KEY'  // 需申请
  },
  
  douban: {
    proxyUrl: 'https://api.douban.uomg.com',
    enabled: true
  }
};
```

### 海外用户
```javascript
// 直接用 TMDB 即可
apiProvider: 'tmdb'
```

---

## 📊 API 对比

| 特性 | TMDB | 豆瓣代理 |
|------|------|----------|
| 稳定性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 中文数据 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 数据量 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 访问速度 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| API 限制 | 每秒 40 次 | 不确定 |

---

## 🐛 已知问题

1. **豆瓣代理不稳定**
   - 解决：自动切换到 TMDB
   
2. **豆瓣 ID 格式不统一**
   - 解决：使用 `douban_` 前缀标识

3. **图片加载慢**
   - 解决：豆瓣数据 + TMDB 图片 URL

---

## 🚀 后续优化

- [ ] 添加更多豆瓣代理源
- [ ] 实现 API 源手动切换 UI
- [ ] 添加 API 响应缓存
- [ ] 支持豆瓣 API 自建代理
- [ ] 数据合并 (TMDB+ 豆瓣互补)

---

## 📝 测试方法

### 测试 TMDB
```javascript
const tmdb = require('../../utils/tmdb.js');
tmdb.search('狂飙').then(console.log);
```

### 测试豆瓣
```javascript
const doubanProxy = require('../../utils/douban-proxy.js');
doubanProxy.searchTV('狂飙').then(console.log);
```

### 测试自动切换
```javascript
const apiProvider = require('../../utils/api-provider.js');
apiProvider.search('狂飙').then(res => {
  console.log('使用的 API 源:', res.source);
});
```

---

**更新时间**: 2026-03-16  
**集成人**: 太子奉旨
