# 📍 如何查看云开发环境 ID

## 方法 1: 微信开发者工具 (最简单)

### 步骤:

**1. 打开微信开发者工具**
- 打开你的小程序项目

**2. 点击云开发按钮**
- 工具栏顶部 → 点击「云开发」图标 ☁️

**3. 查看环境 ID**
- 云开发控制台打开后
- 左上角显示的就是**环境 ID**
- 格式类似：`cloud1-xxx` 或 `prod-xxx`

**4. 复制环境 ID**
- 点击环境 ID 即可复制
- 或右键 → 复制

---

## 方法 2: 小程序后台

### 步骤:

**1. 登录小程序后台**
```
https://mp.weixin.qq.com/
```

**2. 进入云开发**
- 左侧菜单 → 云开发

**3. 查看环境**
- 点击你的环境名称
- 环境 ID 显示在基本信息中

---

## 方法 3: 代码查看

### 在小程序中查看:

```javascript
// app.js 或任意页面
App({
  onLaunch: function () {
    wx.cloud.init({
      env: 'auto',  // 自动使用默认环境
      traceUser: true
    });
    
    // 获取当前环境 ID
    const envId = wx.cloud.CloudEnvironment;
    console.log('环境 ID:', envId);
  }
});
```

### 在云函数中查看:

```javascript
// 云函数中
const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event, context) => {
  const envId = cloud.getCloudbaseContext().envId;
  console.log('当前环境 ID:', envId);
  
  return { envId };
};
```

---

## 📝 配置示例

### app.js 配置:

```javascript
// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上版本');
    } else {
      wx.cloud.init({
        env: 'cloud1-xxx',  // ⬅️ 这里填你的环境 ID
        traceUser: true,
      });
    }
    
    this.globalData = {};
  },
  globalData: {}
});
```

---

## 🔍 环境 ID 格式

环境 ID 通常是以下格式之一:

- `cloud1-xxx` (开发环境)
- `cloud2-xxx` (测试环境)
- `prod-xxx` (生产环境)
- `your-env-name-xxx` (自定义)

示例:
```
cloud1-myapp-1g2h3j4k5l6m7n8o
prod-webapp-9a8b7c6d5e4f3g2h
```

---

## ⚠️ 常见问题

### Q: 没有「云开发」按钮？
**A**: 
1. 检查微信开发者工具版本 (需 2.2.3+)
2. 确认项目已关联小程序
3. 重启开发者工具

### Q: 云开发控制台打不开？
**A**:
1. 检查网络连接
2. 确认已登录微信开发者账号
3. 确认小程序已开通云开发

### Q: 有多个环境怎么办？
**A**:
- 选择你要用的环境
- 点击环境名称切换
- 复制对应环境 ID

---

## 📞 需要帮助？

1. 打开微信开发者工具
2. 点击右上角「详情」
3. 查看「云开发」标签页

---

**找到环境 ID 后，填入 `app.js` 即可！** 🎉
