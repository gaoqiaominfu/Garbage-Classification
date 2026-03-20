// pages/index/index.js - 首页逻辑
const app = getApp();
const storage = require('../../utils/storage.js');

Page({
  data: {
    dramaList: [],
    stats: {
      totalDramas: 0,
      totalWatched: 0,
      totalMinutes: 0
    },
    theme: 'light'
  },

  onLoad() {
    // 获取主题
    const theme = app.getTheme();
    this.setData({ theme });
    this.applyTheme(theme);
  },

  onShow() {
    this.loadDramaList();
    this.loadStats();
  },

  // 加载追剧列表
  loadDramaList() {
    const list = storage.getDramaList();
    this.setData({ dramaList: list });
  },

  // 加载统计数据
  loadStats() {
    const stats = storage.getStats();
    this.setData({ stats });
  },

  // 计算进度百分比
  calculatePercent(item) {
    if (item.episodesCount <= 0) {
      return item.currentEpisode > 0 ? 50 : 0;
    }
    const percent = (item.currentEpisode / item.episodesCount) * 100;
    return Math.min(Math.round(percent), 100);
  },

  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'watching': '追剧中',
      'completed': '已看完',
      'dropped': '已弃剧'
    };
    return statusMap[status] || '追剧中';
  },

  // 格式化时间（分钟转小时）
  formatTime(minutes) {
    if (minutes < 60) {
      return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours}小时`;
    }
    return `${hours}小时${mins}分`;
  },

  // 格式化更新时间
  formatUpdateTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) {
      return '刚刚';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    } else if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}天前`;
    } else {
      const date = new Date(timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  },

  // 切换主题
  toggleTheme() {
    const newTheme = app.toggleTheme();
    this.setData({ theme: newTheme });
    this.applyTheme(newTheme);
  },

  // 应用主题
  applyTheme(theme) {
    if (theme === 'dark') {
      wx.addStorageSync('theme', 'dark');
    } else {
      wx.removeStorageSync('theme');
    }
  },

  // 跳转到搜索页
  goToSearch() {
    wx.switchTab({
      url: '/pages/search/search'
    });
  },

  // 跳转到详情页
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  // 增加一集
  addEpisode(e) {
    const id = e.currentTarget.dataset.id;
    const result = storage.incrementEpisode(id);
    
    if (result) {
      wx.showToast({
        title: '已更新进度',
        icon: 'success'
      });
      this.loadDramaList();
      this.loadStats();
      
      // 如果刚看完，提示
      if (result.watchStatus === 'completed') {
        wx.showModal({
          title: '恭喜！',
          content: '已经看完这部剧了！',
          showCancel: false
        });
      }
    } else {
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      });
    }
  },

  // 标记看完
  markCompleted(e) {
    const id = e.currentTarget.dataset.id;
    const drama = storage.getDrama(id);
    
    if (!drama) {
      return;
    }
    
    wx.showModal({
      title: '确认标记',
      content: `确定要标记《${drama.title}》为看完吗？`,
      success: (res) => {
        if (res.confirm) {
          storage.updateProgress(id, {
            watchStatus: 'completed',
            currentEpisode: drama.episodesCount || drama.currentEpisode
          });
          
          wx.showToast({
            title: '已标记看完',
            icon: 'success'
          });
          
          this.loadDramaList();
          this.loadStats();
        }
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadDramaList();
    this.loadStats();
    wx.stopPullDownRefresh();
  }
});
