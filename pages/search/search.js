// pages/search/search.js - 搜索页逻辑
const apiProvider = require('../../utils/api-provider.js');
const storage = require('../../utils/storage.js');
const tmdb = require('../../utils/tmdb.js');

Page({
  data: {
    keyword: '',
    searchResult: [],
    loading: false,
    hasSearched: false,
    hotKeywords: ['狂飙', '漫长的季节', '三体', '繁花', '庆余年', '甄嬛传', '琅琊榜', '沉默的真相'],
    apiSource: 'auto' // 显示当前使用的 API 源
  },

  onLoad() {
    // 获取当前 API 源配置
    const config = require('../../utils/config.js');
    this.setData({ 
      apiSource: config.apiProvider || 'auto',
      hasCloud: !!wx.cloud
    });
    
    // 检查云开发是否可用
    if (wx.cloud) {
      console.log('云开发可用，优先使用云函数搜索');
    } else {
      console.log('云开发不可用，使用普通 API 搜索');
    }
  },

  // 输入处理
  onInput(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  // 清空搜索
  clearSearch() {
    this.setData({
      keyword: '',
      searchResult: [],
      hasSearched: false
    });
  },

  // 使用热门关键词搜索
  searchWithKeyword(e) {
    const keyword = e.currentTarget.dataset.item;
    this.setData({ keyword });
    this.performSearch(keyword);
  },

  // 搜索按钮点击
  onSearch() {
    const keyword = this.data.keyword.trim();
    if (!keyword) {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      });
      return;
    }
    this.performSearch(keyword);
  },

  // 执行搜索
  performSearch(keyword) {
    this.setData({ loading: true, hasSearched: true });
    
    console.log('开始搜索:', keyword);
    wx.showLoading({ title: '搜索中...', mask: true });
    
    // 直接用 TMDB 搜索 (最简单稳定)
    tmdb.search(keyword, 1)
      .then(res => {
        wx.hideLoading();
        console.log('TMDB 搜索结果:', res);
        
        // 过滤只保留电视剧和电影
        const results = (res.results || []).filter(item => 
          item.media_type === 'tv' || item.media_type === 'movie'
        );
        
        this.setData({
          searchResult: results,
          loading: false,
          apiSource: 'tmdb'
        });
        
        if (results.length === 0) {
          wx.showToast({
            title: '未找到相关内容',
            icon: 'none'
          });
        } else {
          wx.showToast({
            title: `找到${results.length}条结果`,
            icon: 'success'
          });
        }
      })
      .catch(err => {
        wx.hideLoading();
        console.error('搜索失败:', err);
        this.setData({ loading: false });
        wx.showToast({
          title: err.message || '搜索失败，请检查网络',
          icon: 'none'
        });
      });
  },

  // 添加到追剧
  addToDrama(e) {
    const item = e.currentTarget.dataset.item;
    const drama = tmdb.parseTV(item);
    
    wx.showModal({
      title: '添加追剧',
      content: `确定要添加《${drama.title}》到追剧列表吗？`,
      success: (res) => {
        if (res.confirm) {
          const success = storage.addDrama(drama);
          
          if (success) {
            wx.showToast({
              title: '添加成功',
              icon: 'success'
            });
            
            // 延迟跳转到详情页
            setTimeout(() => {
              wx.navigateTo({
                url: `/pages/detail/detail?id=${drama.id}`
              });
            }, 1000);
          } else {
            wx.showToast({
              title: '已在追剧列表中',
              icon: 'none'
            });
            
            // 跳转到详情页
            setTimeout(() => {
              wx.navigateTo({
                url: `/pages/detail/detail?id=${drama.id}`
              });
            }, 1000);
          }
        }
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    if (this.data.keyword) {
      this.performSearch(this.data.keyword);
    }
    wx.stopPullDownRefresh();
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '一起来追剧吧！',
      path: '/pages/search/search'
    };
  }
});
