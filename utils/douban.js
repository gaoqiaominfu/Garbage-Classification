// utils/douban.js - 豆瓣 API 封装

const DOUBAN_API_BASE = 'https://api.douban.com/v2';

/**
 * 搜索影视作品
 * @param {string} keyword - 搜索关键词
 * @param {number} start - 起始位置
 * @param {number} count - 返回数量
 * @returns {Promise}
 */
function search(keyword, start = 0, count = 20) {
  return request({
    url: `${DOUBAN_API_BASE}/movie/search`,
    data: {
      q: keyword,
      start: start,
      count: count
    }
  });
}

/**
 * 获取影视详情
 * @param {string} id - 影视 ID
 * @returns {Promise}
 */
function getSubject(id) {
  return request({
    url: `${DOUBAN_API_BASE}/movie/subject/${id}`
  });
}

/**
 * 获取正在热映
 * @param {number} start - 起始位置
 * @param {number} count - 返回数量
 * @returns {Promise}
 */
function getComingSoon(start = 0, count = 20) {
  return request({
    url: `${DOUBAN_API_BASE}/movie/coming_soon`,
    data: {
      start: start,
      count: count
    }
  });
}

/**
 * 获取 Top250
 * @param {number} start - 起始位置
 * @param {number} count - 返回数量
 * @returns {Promise}
 */
function getTop250(start = 0, count = 20) {
  return request({
    url: `${DOUBAN_API_BASE}/movie/top250`,
    data: {
      start: start,
      count: count
    }
  });
}

/**
 * 通用请求方法
 * @param {object} options - 请求配置
 * @returns {Promise}
 */
function request(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: options.url,
      data: options.data || {},
      method: 'GET',
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject({
            code: res.statusCode,
            message: '请求失败'
          });
        }
      },
      fail: (err) => {
        reject({
          code: -1,
          message: err.errMsg || '网络错误'
        });
      }
    });
  });
}

/**
 * 解析影视数据为追剧格式
 * @param {object} subject - 豆瓣影视数据
 * @returns {object}
 */
function parseSubject(subject) {
  return {
    id: subject.id,
    title: subject.title,
    originalTitle: subject.original_title || '',
    summary: subject.summary || '',
    rating: subject.rating ? subject.rating.average : 0,
    ratingCount: subject.rating ? subject.rating.numRaters : 0,
    poster: subject.images ? (subject.images.large || subject.images.medium || subject.images.small) : '',
    year: subject.year || '',
    genres: subject.genres || [],
    directors: subject.directors ? subject.directors.map(d => d.name) : [],
    casts: subject.casts ? subject.casts.slice(0, 5).map(c => c.name) : [],
    episodesCount: subject.episodes_count || 0,
    seasonsCount: subject.seasons_count || 1,
    status: subject.status || '',
    subtype: subject.subtype || 'movie',
    pubdates: subject.pubdates || [],
    duration: subject.duration || '',
    // 追剧相关
    currentSeason: 1,
    currentEpisode: 0,
    watchStatus: 'watching', // watching, completed, dropped
    addedTime: Date.now(),
    updateTime: Date.now(),
    watchedEpisodes: [] // 已观看集数记录
  };
}

/**
 * 估算单集时长（分钟）
 * @param {string} duration - 时长字符串
 * @returns {number}
 */
function estimateEpisodeDuration(duration) {
  if (!duration) return 45; // 默认 45 分钟
  
  const match = duration.match(/(\d+)/);
  if (match) {
    const minutes = parseInt(match[1]);
    if (minutes < 10) return minutes * 10; // 如果是"5"，可能是 50 分钟
    return Math.min(minutes, 90); // 最多 90 分钟
  }
  return 45;
}

module.exports = {
  search,
  getSubject,
  getComingSoon,
  getTop250,
  parseSubject,
  estimateEpisodeDuration
};
