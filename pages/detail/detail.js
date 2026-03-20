// pages/detail/detail.js - 详情页逻辑
const app = getApp();
const storage = require('../../utils/storage.js');
const tmdb = require('../../utils/tmdb.js');

Page({
  data: {
    drama: null,
    progressPercent: 0,
    expanded: false,
    estimateWatchTime: '0 分钟'
  },

  onLoad(options) {
    if (options.id) {
      this.loadDrama(options.id);
    }
  },

  // 加载影视数据
  loadDrama(id) {
    const drama = storage.getDrama(id);
    
    if (drama) {
      const progressPercent = this.calculatePercent(drama);
      const estimateWatchTime = this.calculateWatchTime(drama);
      
      this.setData({
        drama,
        progressPercent,
        estimateWatchTime
      });
    } else {
      wx.showToast({
        title: '未找到该影视',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 计算进度百分比
  calculatePercent(drama) {
    if (drama.episodesCount <= 0) {
      return drama.currentEpisode > 0 ? 50 : 0;
    }
    const percent = (drama.currentEpisode / drama.episodesCount) * 100;
    return Math.min(Math.round(percent), 100);
  },

  // 估算观看时长
  calculateWatchTime(drama) {
    const watchedEpisodes = drama.watchedEpisodes ? drama.watchedEpisodes.length : drama.currentEpisode;
    const duration = tmdb.estimateEpisodeDuration(drama.status, drama.seasonsCount);
    const totalMinutes = watchedEpisodes * duration;
    
    if (totalMinutes < 60) {
      return `${totalMinutes}分钟`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
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

  // 切换状态
  changeStatus(e) {
    const status = e.currentTarget.dataset.status;
    const id = this.data.drama.id;
    
    storage.updateProgress(id, {
      watchStatus: status
    });
    
    this.setData({
      'drama.watchStatus': status
    });
    
    wx.showToast({
      title: '已更新状态',
      icon: 'success'
    });
  },

  // 改变季数
  changeSeason(e) {
    const delta = parseInt(e.currentTarget.dataset.delta);
    const id = this.data.drama.id;
    const newSeason = this.data.drama.currentSeason + delta;
    
    if (newSeason < 1) {
      wx.showToast({
        title: '季数不能小于 1',
        icon: 'none'
      });
      return;
    }
    
    storage.updateProgress(id, {
      currentSeason: newSeason
    });
    
    this.setData({
      'drama.currentSeason': newSeason
    });
  },

  // 改变集数
  changeEpisode(e) {
    const delta = parseInt(e.currentTarget.dataset.delta);
    const id = this.data.drama.id;
    const newEpisode = this.data.drama.currentEpisode + delta;
    
    if (newEpisode < 0) {
      wx.showToast({
        title: '集数不能小于 0',
        icon: 'none'
      });
      return;
    }
    
    // 检查是否超过总集数
    if (this.data.drama.episodesCount > 0 && newEpisode > this.data.drama.episodesCount) {
      wx.showModal({
        title: '提示',
        content: '已经超过总集数，是否标记为看完？',
        success: (res) => {
          if (res.confirm) {
            storage.updateProgress(id, {
              currentEpisode: this.data.drama.episodesCount,
              watchStatus: 'completed'
            });
            this.setData({
              'drama.currentEpisode': this.data.drama.episodesCount,
              'drama.watchStatus': 'completed',
              progressPercent: 100
            });
          }
        }
      });
      return;
    }
    
    storage.updateProgress(id, {
      currentEpisode: newEpisode
    });
    
    const newPercent = this.calculatePercent({
      ...this.data.drama,
      currentEpisode: newEpisode
    });
    
    this.setData({
      'drama.currentEpisode': newEpisode,
      progressPercent: newPercent
    });
  },

  // 快速增加一集
  quickAddEpisode() {
    const id = this.data.drama.id;
    const result = storage.incrementEpisode(id);
    
    if (result) {
      const newPercent = this.calculatePercent({
        ...this.data.drama,
        currentEpisode: result.currentEpisode
      });
      
      this.setData({
        'drama.currentEpisode': result.currentEpisode,
        'drama.currentSeason': result.currentSeason,
        'drama.watchStatus': result.watchStatus,
        progressPercent: newPercent
      });
      
      wx.showToast({
        title: '已更新进度',
        icon: 'success'
      });
      
      if (result.watchStatus === 'completed') {
        wx.showModal({
          title: '恭喜！',
          content: '已经看完这部剧了！',
          showCancel: false
        });
      }
    }
  },

  // 切换简介展开/收起
  toggleExpand() {
    this.setData({
      expanded: !this.data.expanded
    });
  },

  // 删除追剧
  removeDrama() {
    const drama = this.data.drama;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除《${drama.title}》吗？删除后无法恢复。`,
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          const success = storage.removeDrama(drama.id);
          
          if (success) {
            wx.showToast({
              title: '已删除',
              icon: 'success'
            });
            setTimeout(() => {
              wx.navigateBack();
            }, 1000);
          } else {
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 页面分享
  onShareAppMessage() {
    const drama = this.data.drama;
    return {
      title: drama ? `我在追《${drama.title}》，一起来看吧！` : '追剧记录',
      path: `/pages/detail/detail?id=${drama ? drama.id : ''}`
    };
  }
});
