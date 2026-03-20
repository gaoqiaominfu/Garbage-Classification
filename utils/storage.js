// utils/storage.js - 本地存储封装

const STORAGE_KEY_DRAMA_LIST = 'drama_tracker_list';
const STORAGE_KEY_SETTINGS = 'drama_tracker_settings';
const STORAGE_KEY_STATS = 'drama_tracker_stats';

/**
 * 初始化存储
 */
function init() {
  if (!wx.getStorageSync(STORAGE_KEY_DRAMA_LIST)) {
    wx.setStorageSync(STORAGE_KEY_DRAMA_LIST, []);
  }
  if (!wx.getStorageSync(STORAGE_KEY_SETTINGS)) {
    wx.setStorageSync(STORAGE_KEY_SETTINGS, {
      theme: 'light',
      autoUpdate: true,
      showNotification: true
    });
  }
  if (!wx.getStorageSync(STORAGE_KEY_STATS)) {
    wx.setStorageSync(STORAGE_KEY_STATS, {
      totalWatched: 0,
      totalDramas: 0,
      completedDramas: 0,
      totalMinutes: 0
    });
  }
}

/**
 * 获取追剧列表
 * @returns {Array}
 */
function getDramaList() {
  return wx.getStorageSync(STORAGE_KEY_DRAMA_LIST) || [];
}

/**
 * 保存追剧列表
 * @param {Array} list - 追剧列表
 */
function saveDramaList(list) {
  wx.setStorageSync(STORAGE_KEY_DRAMA_LIST, list);
  updateStats();
}

/**
 * 添加追剧
 * @param {object} drama - 影视数据
 * @returns {boolean}
 */
function addDrama(drama) {
  const list = getDramaList();
  
  // 检查是否已存在
  const exists = list.some(item => item.id === drama.id);
  if (exists) {
    return false;
  }
  
  list.unshift(drama); // 添加到开头
  saveDramaList(list);
  return true;
}

/**
 * 更新追剧进度
 * @param {string} id - 影视 ID
 * @param {object} progress - 进度数据
 * @returns {boolean}
 */
function updateProgress(id, progress) {
  const list = getDramaList();
  const index = list.findIndex(item => item.id === id);
  
  if (index === -1) {
    return false;
  }
  
  list[index] = {
    ...list[index],
    ...progress,
    updateTime: Date.now()
  };
  
  // 按更新时间排序
  list.sort((a, b) => b.updateTime - a.updateTime);
  
  saveDramaList(list);
  return true;
}

/**
 * 快速增加一集
 * @param {string} id - 影视 ID
 * @returns {object|null} 更新后的进度
 */
function incrementEpisode(id) {
  const list = getDramaList();
  const index = list.findIndex(item => item.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const drama = list[index];
  const newEpisode = drama.currentEpisode + 1;
  
  // 检查是否超过总集数
  if (drama.episodesCount > 0 && newEpisode > drama.episodesCount) {
    // 标记为看完
    drama.watchStatus = 'completed';
  }
  
  drama.currentEpisode = newEpisode;
  drama.updateTime = Date.now();
  
  // 记录已观看集数
  if (!drama.watchedEpisodes) {
    drama.watchedEpisodes = [];
  }
  const episodeKey = `S${drama.currentSeason}E${newEpisode}`;
  if (!drama.watchedEpisodes.includes(episodeKey)) {
    drama.watchedEpisodes.push(episodeKey);
  }
  
  list.sort((a, b) => b.updateTime - a.updateTime);
  saveDramaList(list);
  
  return {
    currentSeason: drama.currentSeason,
    currentEpisode: drama.currentEpisode,
    watchStatus: drama.watchStatus
  };
}

/**
 * 删除追剧
 * @param {string} id - 影视 ID
 * @returns {boolean}
 */
function removeDrama(id) {
  const list = getDramaList();
  const newList = list.filter(item => item.id !== id);
  
  if (newList.length === list.length) {
    return false;
  }
  
  saveDramaList(newList);
  return true;
}

/**
 * 获取单个追剧
 * @param {string} id - 影视 ID
 * @returns {object|null}
 */
function getDrama(id) {
  const list = getDramaList();
  const drama = list.find(item => item.id === id);
  return drama || null;
}

/**
 * 更新统计数据
 */
function updateStats() {
  const list = getDramaList();
  const douban = require('./douban.js');
  
  let totalWatched = 0;
  let completedDramas = 0;
  let totalMinutes = 0;
  
  list.forEach(drama => {
    totalWatched += drama.currentEpisode;
    
    if (drama.watchStatus === 'completed') {
      completedDramas++;
    }
    
    // 估算观看时长
    const episodeDuration = douban.estimateEpisodeDuration(drama.duration);
    totalMinutes += drama.currentEpisode * episodeDuration;
  });
  
  const stats = {
    totalWatched,
    totalDramas: list.length,
    completedDramas,
    totalMinutes
  };
  
  wx.setStorageSync(STORAGE_KEY_STATS, stats);
  return stats;
}

/**
 * 获取统计数据
 * @returns {object}
 */
function getStats() {
  return wx.getStorageSync(STORAGE_KEY_STATS) || {
    totalWatched: 0,
    totalDramas: 0,
    completedDramas: 0,
    totalMinutes: 0
  };
}

/**
 * 获取设置
 * @returns {object}
 */
function getSettings() {
  return wx.getStorageSync(STORAGE_KEY_SETTINGS) || {
    theme: 'light',
    autoUpdate: true,
    showNotification: true
  };
}

/**
 * 保存设置
 * @param {object} settings - 设置数据
 */
function saveSettings(settings) {
  wx.setStorageSync(STORAGE_KEY_SETTINGS, {
    ...getSettings(),
    ...settings
  });
}

/**
 * 清空所有数据
 */
function clearAll() {
  wx.removeStorageSync(STORAGE_KEY_DRAMA_LIST);
  wx.removeStorageSync(STORAGE_KEY_STATS);
  init();
}

module.exports = {
  init,
  getDramaList,
  saveDramaList,
  addDrama,
  updateProgress,
  incrementEpisode,
  removeDrama,
  getDrama,
  getStats,
  updateStats,
  getSettings,
  saveSettings,
  clearAll
};
