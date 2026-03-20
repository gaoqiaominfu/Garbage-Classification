// app.js - 小程序入口
App({
  onLaunch() {
    // ========== 云开发初始化 ==========
    // ⚠️ 请将 'your-env-id' 替换为你的云开发环境 ID
    // 查看方法：微信开发者工具 → 点击「云开发」→ 左上角显示环境 ID
    if (wx.cloud) {
      wx.cloud.init({
        env: 'your-env-id',  // ⬅️ 填入你的环境 ID，例如：cloud1-xxx
        traceUser: true,
      });
      console.log('✅ 云开发已初始化');
    } else {
      console.warn('⚠️ 云开发不可用，请使用微信开发者工具 2.2.3 或以上版本');
    }
    // ===================================
    
    // 初始化本地存储
    const storage = require('./utils/storage.js');
    storage.init();
    
    // 检查更新
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success(res) {
                if (res.confirm) {
                  updateManager.applyUpdate();
                }
              }
            });
          });
        }
      });
    }
  },

  globalData: {
    userInfo: null,
    tmdbApiKey: '', // 需配置 TMDB API Key
    theme: 'light', // 主题：light/dark
    watchedTimeTotal: 0 // 总观看时长（分钟）
  },

  // 切换主题
  toggleTheme() {
    this.globalData.theme = this.globalData.theme === 'light' ? 'dark' : 'light';
    wx.setStorageSync('theme', this.globalData.theme);
    return this.globalData.theme;
  },

  // 获取主题
  getTheme() {
    const theme = wx.getStorageSync('theme');
    if (theme) {
      this.globalData.theme = theme;
    }
    return this.globalData.theme;
  }
});
