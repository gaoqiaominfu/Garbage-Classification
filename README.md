# 追剧记录小程序

一款微信小程序，用于记录追剧进度（第几季第几集），支持多种数据源。

## 🎯 数据源说明

| 数据源 | 状态 | 说明 |
|--------|------|------|
| TMDB | ✅ 稳定 | 需 API Key，数据全 |
| 豆瓣云函数 | ✅ 推荐 | 无需 Key，中文准 |
| 豆瓣代理 | ⚠️ 备用 | 不稳定 |

**推荐使用云函数方案**，无需 API Key，数据准确！

## 功能特性

### 核心功能
- ✅ **影视搜索** - 调用 TMDB API 搜索影视，显示海报、评分、简介
- ✅ **观看记录** - 记录当前季数、集数，快速更新进度（+1 集）
- ✅ **追剧列表** - 卡片式展示所有追剧，显示进度条，按更新时间排序
- ✅ **统计功能** - 本季已看集数、总计观看时长估算
- ✅ **深色模式** - 支持深色/浅色主题切换

### UI 设计
- 现代简约风格
- 卡片式布局
- 进度条可视化
- 海报墙展示
- 深色/浅色模式支持

## 项目结构

```
drama-tracker-miniprogram/
├── app.js                     # 小程序入口
├── app.json                   # 小程序配置
├── app.wxss                   # 全局样式
├── project.config.json        # 微信开发者工具配置
├── sitemap.json               # 站点地图配置
├── images/                    # 图片资源目录
│   ├── tv.png                 # TabBar 图标（追剧）
│   ├── tv-active.png          # TabBar 图标（追剧 - 选中）
│   ├── search.png             # TabBar 图标（搜索）
│   ├── search-active.png      # TabBar 图标（搜索 - 选中）
│   └── empty.png              # 空状态图标
├── pages/
│   ├── index/                 # 首页（追剧列表）
│   │   ├── index.wxml
│   │   ├── index.wxss
│   │   └── index.js
│   ├── search/                # 搜索页
│   │   ├── search.wxml
│   │   ├── search.wxss
│   │   └── index.js
│   └── detail/                # 详情页
│       ├── detail.wxml
│       ├── detail.wxss
│       └── detail.js
├── components/
│   └── drama-card/            # 影视卡片组件
│       ├── drama-card.wxml
│       ├── drama-card.wxss
│       ├── drama-card.js
│       └── drama-card.json
└── utils/
    ├── config.js              # 配置文件（API Key 等）
    ├── tmdb.js                # TMDB API 封装
    └── storage.js             # 本地存储封装
```

## 快速开始

### 1. 准备工作

- 注册微信小程序账号：https://mp.weixin.qq.com/
- 下载微信开发者工具：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
- 获取 AppID（在小程序后台设置中查看）
- 申请 TMDB API Key（详见下方说明）

### 2. 导入项目

1. 打开微信开发者工具
2. 点击「+」或「导入项目」
3. 选择项目目录：`drama-tracker-miniprogram`
4. 填入你的 AppID
5. 点击「导入」

### 3. 配置 AppID

打开 `project.config.json`，将 `appid` 字段修改为你的小程序 AppID：

```json
{
  "appid": "你的 AppID"
}
```

### 4. 准备图标资源

在 `images/` 目录下准备以下图标（建议尺寸 81x81 像素）：

- `tv.png` - 追剧 Tab 图标
- `tv-active.png` - 追剧 Tab 选中图标
- `search.png` - 搜索 Tab 图标
- `search-active.png` - 搜索 Tab 选中图标
- `empty.png` - 空状态占位图（建议 200x200 像素）

> 💡 可以使用图标库如 [iconfont](https://www.iconfont.cn/) 或 [flaticon](https://www.flaticon.com/) 获取免费图标

### 5. TMDB API Key 配置

#### TMDB API Key 申请步骤：

1. **访问 TMDB 官网**
   - 打开 https://www.themoviedb.org/

2. **注册账号**
   - 点击右上角「Join TMDB」
   - 填写邮箱、用户名、密码
   - 验证邮箱完成注册

3. **申请 API Key**
   - 登录后，点击头像 → 「设置」（Settings）
   - 在左侧菜单选择「设置」→「API」
   - 点击「申请 API Key」（Click here to request an API Key）
   - 选择「Developer」类型
   - 填写申请表：
     - **Application Name**: 追剧记录小程序（或你喜欢的名字）
     - **Application URL**: 可以填 https://localhost 或个人博客
     - **Application Summary**: 个人学习使用的追剧记录小程序，用于记录观看进度（中文或英文均可）
   - 提交后等待审核（通常几分钟到几小时）
   - 审核通过后，在 API 页面查看你的 API Key（v3 auth）

4. **配置 API Key**
   
   打开 `utils/config.js`，将 API Key 填入：
   
   ```javascript
   module.exports = {
     tmdb: {
       baseUrl: 'https://api.themoviedb.org/3',
       imageBaseUrl: 'https://image.tmdb.org/t/p/w500',
       apiKey: '你的 API Key'  // 在这里填入
     },
     language: 'zh-CN',
     includeAdult: false
   };
   ```

5. **测试 API**
   
   在微信开发者工具中编译项目，尝试搜索影视作品，如果能正常返回数据说明配置成功。

#### 注意事项：

- ✅ TMDB API 免费且无需服务器代理，可直接在小程序中调用
- ✅ 请求限制：每秒约 40 次请求，对个人项目足够
- ✅ 图片 URL 需要拼接：`https://image.tmdb.org/t/p/w500/{poster_path}`
- ⚠️ API Key 不要上传到公开代码仓库（建议使用环境变量或本地配置）

### 6. 运行和调试

1. 在微信开发者工具中点击「编译」
2. 在模拟器中查看效果
3. 使用「真机调试」在手机上测试

### 7. 上传发布

1. 点击微信开发者工具右上角「上传」
2. 填写版本号和项目备注
3. 登录小程序后台提交审核

## 使用说明

### 添加追剧

1. 点击底部「搜索」Tab
2. 输入影视名称进行搜索
3. 点击搜索结果添加到追剧列表

### 更新进度

**方式一：快速更新**
- 在首页追剧卡片上点击「+1 集」按钮

**方式二：详情页更新**
1. 点击追剧卡片进入详情页
2. 使用「+」「-」按钮调整季数/集数
3. 或点击「+1 集（快速更新）」按钮

### 标记状态

在详情页可以标记追剧状态：
- 📺 追剧中
- ✅ 已看完
- ❌ 已弃剧

### 切换主题

在首页顶部统计栏点击「🌙/☀️」按钮切换深色/浅色主题

## 数据存储

所有数据存储在微信本地存储中：

- `drama_tracker_list` - 追剧列表
- `drama_tracker_settings` - 用户设置
- `drama_tracker_stats` - 统计数据

## 技术栈

- 微信小程序原生开发
- WXML + WXSS + JavaScript
- 本地存储（wx.setStorage）
- TMDB API

## API 说明

### TMDB API 文档

- 官方文档：https://developers.themoviedb.org/3
- 基础 URL：`https://api.themoviedb.org/3`
- 认证方式：API Key（query parameter: `api_key`）

### 已实现的接口

| 功能 | 接口 | 说明 |
|-----|------|------|
| 搜索影视 | `/search/multi` | 搜索电视剧和电影 |
| 电视剧详情 | `/tv/{tv_id}` | 获取电视剧详细信息 |
| 季详情 | `/tv/{tv_id}/season/{season_number}` | 获取某一季的集数信息 |
| 热门电视剧 | `/tv/popular` | 获取热门电视剧列表 |
| 正在播出 | `/tv/on_the_air` | 获取正在播出的电视剧 |

### 数据字段映射

| TMDB 字段 | 追剧格式字段 | 说明 |
|----------|-------------|------|
| `name` / `title` | `title` | 剧名 |
| `vote_average` | `rating` | 评分 |
| `poster_path` | `poster` | 海报（需拼接图片 URL） |
| `overview` | `summary` | 简介 |
| `first_air_date` | `year` | 首播年份 |
| `number_of_seasons` | `seasonsCount` | 总季数 |

## 注意事项

1. **HTTPS 要求**：微信小程序要求所有网络请求使用 HTTPS（TMDB API 已支持）
2. **域名配置**：在小程后台配置合法的服务器域名：
   - `api.themoviedb.org`
   - `image.tmdb.org`
3. **API Key 安全**：不要将 API Key 上传到公开代码仓库
4. **图片加载**：TMDB 图片可能需要配置 download 域名

## 后续优化建议

- [ ] 添加观影日历功能
- [ ] 支持数据云同步
- [ ] 添加追剧提醒功能
- [ ] 支持导出/导入数据
- [ ] 添加影视评分功能
- [ ] 支持分享追剧列表
- [ ] 添加观影笔记功能
- [ ] 支持获取演员信息（调用 TMDB credits 接口）
- [ ] 支持获取季/集详情

## 开发团队

奉旨开发 · 追剧记录小程序

## 许可证

MIT License
