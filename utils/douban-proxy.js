// utils/douban-proxy.js - 豆瓣代理 API 封装
// 使用第三方代理服务，无需 API Key

// 豆瓣代理 API 源列表 (按优先级)
const DOUBAN_PROXIES = [
  'https://api.douban.uomg.com',
  'https://douban-api.uomg.com',
  'https://api.imsyy.top/douban',
  'https://douban.uomg.com'
];

// 当前使用的代理源
let currentProxyIndex = 0;

/**
 * 获取当前可用的代理 URL
 */
function getCurrentProxy() {
  return DOUBAN_PROXIES[currentProxyIndex] || DOUBAN_PROXIES[0];
}

/**
 * 切换到下一个代理源
 */
function switchProxy() {
  currentProxyIndex = (currentProxyIndex + 1) % DOUBAN_PROXIES.length;
  console.log(`切换到豆瓣代理源：${getCurrentProxy()}`);
}

/**
 * 重置代理源
 */
function resetProxy() {
  currentProxyIndex = 0;
}

/**
 * 通用请求方法
 * @param {string} endpoint - API 端点
 * @param {object} params - 请求参数
 * @returns {Promise}
 */
function request(endpoint, params = {}) {
  return new Promise((resolve, reject) => {
    const url = `${DOUBAN_PROXY}${endpoint}`;
    
    wx.request({
      url: url,
      data: params,
      method: 'GET',
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          resolve(res.data.data || res.data);
        } else {
          reject({
            code: res.statusCode,
            message: res.data.msg || '请求失败'
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
 * 搜索电影
 * @param {string} keyword - 搜索关键词
 * @returns {Promise}
 */
function searchMovie(keyword) {
  return request('/api/movie/search', {
    word: keyword,
    limit: 20
  });
}

/**
 * 搜索电视剧
 * @param {string} keyword - 搜索关键词
 * @returns {Promise}
 */
function searchTV(keyword) {
  return request('/api/tv/search', {
    word: keyword,
    limit: 20
  });
}

/**
 * 搜索 (自动判断电影/电视剧)
 * @param {string} keyword - 搜索关键词
 * @param {string} type - 类型 movie|tv|auto
 * @returns {Promise}
 */
function search(keyword, type = 'auto') {
  if (type === 'movie') {
    return searchMovie(keyword);
  } else if (type === 'tv') {
    return searchTV(keyword);
  } else {
    // 自动模式：同时搜索电影和电视剧
    return Promise.all([
      searchMovie(keyword).catch(() => []),
      searchTV(keyword).catch(() => [])
    ]).then(([movies, tvs]) => {
      return {
        movies: movies || [],
        tvs: tvs || [],
        combined: [...(movies || []), ...(tvs || [])]
      };
    });
  }
}

/**
 * 获取电影详情
 * @param {string} id - 豆瓣电影 ID
 * @returns {Promise}
 */
function getMovieDetail(id) {
  return request('/api/movie/detail', { id });
}

/**
 * 获取电视剧详情
 * @param {string} id - 豆瓣电视剧 ID
 * @returns {Promise}
 */
function getTVDetail(id) {
  return request('/api/tv/detail', { id });
}

/**
 * 获取详情 (自动判断类型)
 * @param {string} id - 豆瓣 ID
 * @param {string} type - 类型 movie|tv
 * @returns {Promise}
 */
function getDetail(id, type = 'movie') {
  if (type === 'movie') {
    return getMovieDetail(id);
  } else {
    return getTVDetail(id);
  }
}

/**
 * 获取正在热映的电影
 * @returns {Promise}
 */
function getNowPlaying() {
  return request('/api/movie/nowplaying', { limit: 20 });
}

/**
 * 获取热门电视剧
 * @returns {Promise}
 */
function getPopularTV() {
  return request('/api/tv/hot', { limit: 20 });
}

/**
 * 解析豆瓣电影数据为追剧格式
 * @param {object} item - 豆瓣电影数据
 * @returns {object}
 */
function parseMovie(item) {
  return {
    id: `douban_${item.id}`,
    source: 'douban',
    title: item.title || item.name || '',
    originalTitle: item.original_title || item.original_name || '',
    summary: item.summary || item.desc || '',
    rating: item.rating ? (item.rating.value || item.rating.score || 0) : 0,
    ratingCount: item.rating ? (item.rating.count || item.rating.num || 0) : 0,
    poster: item.image || item.cover || item.poster || '',
    backdrop: item.backdrop || item.cover_large || '',
    year: item.year || (item.pubdate ? item.pubdate.split('-')[0] : ''),
    genres: item.genres || [],
    directors: item.directors ? item.directors.map(d => d.name) : [],
    casts: item.casts ? item.casts.map(c => c.name) : [],
    duration: item.duration || '',
    subtype: 'movie',
    // 追剧相关
    currentSeason: 1,
    currentEpisode: 0,
    watchStatus: 'watching',
    addedTime: Date.now(),
    updateTime: Date.now()
  };
}

/**
 * 解析豆瓣电视剧数据为追剧格式
 * @param {object} item - 豆瓣电视剧数据
 * @returns {object}
 */
function parseTV(item) {
  return {
    id: `douban_${item.id}`,
    source: 'douban',
    title: item.title || item.name || '',
    originalTitle: item.original_title || item.original_name || '',
    summary: item.summary || item.desc || '',
    rating: item.rating ? (item.rating.value || item.rating.score || 0) : 0,
    ratingCount: item.rating ? (item.rating.count || item.rating.num || 0) : 0,
    poster: item.image || item.cover || item.poster || '',
    backdrop: item.backdrop || item.cover_large || '',
    year: item.year || (item.pubdate ? item.pubdate.split('-')[0] : ''),
    genres: item.genres || [],
    directors: item.directors ? item.directors.map(d => d.name) : [],
    casts: item.casts ? item.casts.map(c => c.name) : [],
    episodesCount: item.episodes_count || item.total_episodes || 0,
    seasonsCount: item.seasons_count || item.total_seasons || 1,
    status: item.status || '',
    subtype: 'tv',
    // 追剧相关
    currentSeason: 1,
    currentEpisode: 0,
    watchStatus: 'watching',
    addedTime: Date.now(),
    updateTime: Date.now()
  };
}

/**
 * 解析搜索结果项
 * @param {object} item - 豆瓣搜索结果项
 * @param {string} type - 类型 movie|tv
 * @returns {object}
 */
function parseSearchResult(item, type = 'movie') {
  if (type === 'tv') {
    return parseTV(item);
  } else {
    return parseMovie(item);
  }
}

module.exports = {
  search,
  searchMovie,
  searchTV,
  getDetail,
  getMovieDetail,
  getTVDetail,
  getNowPlaying,
  getPopularTV,
  parseMovie,
  parseTV,
  parseSearchResult,
  DOUBAN_PROXY
};
