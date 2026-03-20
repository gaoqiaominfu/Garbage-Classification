# 图标资源说明

本目录需要放置以下图标文件（PNG 格式）：

## TabBar 图标（81x81 像素）

| 文件名 | 说明 | 建议颜色 |
|--------|------|----------|
| `tv.png` | 追剧 Tab 默认图标 | 灰色 #999999 |
| `tv-active.png` | 追剧 Tab 选中图标 | 蓝色 #4A90D9 |
| `search.png` | 搜索 Tab 默认图标 | 灰色 #999999 |
| `search-active.png` | 搜索 Tab 选中图标 | 蓝色 #4A90D9 |

## 其他图标

| 文件名 | 尺寸 | 说明 |
|--------|------|------|
| `empty.png` | 200x200 | 空状态占位图 |

## 图标获取方式

### 方式一：微信官方图标库
访问 https://developers.weixin.qq.com/miniprogram/dev/framework/ability/material.html

### 方式二：iconfont
1. 访问 https://www.iconfont.cn/
2. 搜索 "tv"、"search" 等关键词
3. 下载 PNG 格式，调整尺寸为 81x81

### 方式三：使用 emoji 临时替代
在 `app.json` 中暂时移除 `iconPath` 和 `selectedIconPath` 字段，仅使用 `text` 显示文字

## 临时解决方案

如果暂时没有图标，可以修改 `app.json`：

```json
"tabBar": {
  "list": [
    {
      "pagePath": "pages/index/index.html",
      "text": "📺 追剧"
    },
    {
      "pagePath": "pages/search/search.html",
      "text": "🔍 搜索"
    }
  ]
}
```

移除 `iconPath` 和 `selectedIconPath` 字段即可仅显示文字。
