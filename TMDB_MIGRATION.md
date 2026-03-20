# TMDB API 迁移说明

## 迁移概述

本次迁移将追剧小程序的 API 从豆瓣改为 TMDB（The Movie Database）。

## 修改内容

### 1. 新增文件

#### `utils/config.js`
配置文件，存放 TMDB API Key 和其他配置项。

```javascript
module.exports = {
  tmdb: {
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p/w500',
    apiKey: '' // 需配置
  },
  language: 'zh-CN',
  includeAdult: false
};
```

#### `utils/tmdb.js`
TMDB API 封装模块，实现以下函数：

| 函数 | 说明 | 参数 |
|-----|------|------|
| `search(keyword, page)` | 搜索影视（多类型） | 关键词、页码 |
| `searchTV(keyword, page)` | 搜索电视剧 | 关键词、页码 |
| `getTVDetail(tvId)` | 获取电视剧详情 | 电视剧 ID |
| `getSeasonDetail(tvId, seasonNum)` | 获取季详情 | 电视剧 ID、季数 |
| `getPopular(page)` | 获取热门电视剧 | 页码 |
| `getOnTheAir(page)` | 获取正在播出 | 页码 |
| `parseTV(item)` | 解析 TMDB 数据为追剧格式 | TMDB 数据对象 |
| `parseSearchResult(item)` | 解析搜索结果项 | 搜索结果对象 |
| `getImageUrl(posterPath)` | 拼接图片 URL | 海报路径 |
| `estimateEpisodeDuration(status, seasonsCount)` | 估算单集时长 | 状态、季数 |
| `getEpisodesCountFromSeason(seasonData)` | 从季详情获取集数 | 季详情数据 |

### 2. 修改文件

#### `pages/search/search.js`
- 将 `require('../../utils/douban.js')` 改为 `require('../../utils/tmdb.js')`
- 调用 `tmdb.search()` 替代 `douban.search()`
- 处理 TMDB 返回的 `results` 数组，过滤 `media_type` 为 `tv` 或 `movie` 的项
- 使用 `tmdb.parseTV()` 解析数据

#### `pages/detail/detail.js`
- 将 `require('../../utils/douban.js')` 改为 `require('../../utils/tmdb.js')`
- 调用 `tmdb.estimateEpisodeDuration()` 替代 `douban.estimateEpisodeDuration()`

#### `app.js`
- 将 `doubanApiKey` 改为 `tmdbApiKey`

#### `README.md`
- 更新 API 配置说明，添加 TMDB API Key 申请步骤
- 更新技术栈说明
- 添加 TMDB API 文档链接和接口说明

### 3. 保留文件

#### `utils/douban.js`
保留原文件作为参考，暂不删除。

## 字段映射

| 豆瓣字段 | TMDB 字段 | 说明 |
|---------|----------|------|
| `title` / `subject_title` | `name` (tv) / `title` (movie) | 剧名/片名 |
| `rating.average` | `vote_average` | 评分（0-10） |
| `poster` | `poster_path` | 海报路径（需拼接 URL） |
| `summary` | `overview` | 简介 |
| `year` | `first_air_date` / `release_date` 的年份 | 首播/上映年份 |
| `id` | `id` | ID |
| `seasons_count` | `number_of_seasons` | 总季数 |
| `episodes_count` | 从季详情计算 | 总集数 |

## 图片 URL 拼接

TMDB 返回的是相对路径，需要拼接完整 URL：

```javascript
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const posterUrl = posterPath ? IMAGE_BASE + posterPath : '/images/empty.png';
```

## 配置步骤

1. 申请 TMDB API Key（详见 README.md）
2. 在 `utils/config.js` 中配置 `apiKey`
3. 在微信小程序后台配置域名：
   - `api.themoviedb.org`
   - `image.tmdb.org`

## 测试验证

1. 编译小程序
2. 在搜索页输入关键词（如"狂飙"）
3. 验证搜索结果正常显示
4. 添加一部剧到追剧列表
5. 验证详情页显示正常

## 注意事项

1. **API Key 安全**：不要将 API Key 上传到公开代码仓库
2. **域名配置**：必须在小程序后台配置 TMDB 域名
3. **图片加载**：TMDB 图片域名也需要配置
4. **请求限制**：TMDB 有速率限制（约 40 次/秒），但个人使用足够

## 后续优化

- [ ] 添加演员信息（调用 credits 接口）
- [ ] 支持获取季/集详情
- [ ] 添加热门/正在播出列表页
- [ ] 优化图片加载（使用不同尺寸）
