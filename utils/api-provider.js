// utils/api-provider.js - 统一 API 提供者管理
// 支持多 API 源自动切换

const tmdb = require('./tmdb.js');
const doubanProxy = require('./douban-proxy.js');
const doubanCrawler = require('./douban-crawler.js');

// API 源配置
const API_PROVIDERS = {
  TMDB: 'tmdb',
  DOUBAN: 'douban'
};

// 优先级顺序 (数字越小优先级越高)
const PRIORITY = [
  API_PROVIDERS.TMDB,    // 优先 TMDB (数据全)
  API_PROVIDERS.DOUBAN   // 备用豆瓣 (中文准)
];

// API 源状态
const providerStatus = {
  [API_PROVIDERS.TMDB]: { enabled: true, lastError: null },
  [API_PROVIDERS.DOUBAN]: { enabled: true, lastError: null }
};

/**
 * 获取启用的 API 提供者 (按优先级)
 * @returns {string[]}
 */
function getEnabledProviders() {
  return PRIORITY.filter(provider => providerStatus[provider].enabled);
}

/**
 * 尝试多个 API 提供者
 * @param {Function[]} tasks - API 调用函数数组
 * @returns {Promise}
 */
async function tryProviders(tasks) {
  const errors = [];
  
  for (const task of tasks) {
    try {
      const result = await task();
      if (result) {
        return result;
      }
    } catch (error) {
      errors.push(error);
      console.warn(`API 调用失败：${error.message || error}`);
    }
  }
  
  throw new Error(`所有 API 源都失败：${errors.map(e => e.message).join(', ')}`);
}

/**
 * 搜索影视 (自动切换 API 源)
 * @param {string} keyword - 搜索关键词
 * @param {string} type - 类型 tv|movie|auto
 * @returns {Promise}
 */
async function search(keyword, type = 'auto') {
  return tryProviders([
    () => tmdb.search(keyword).then(res => ({ source: 'tmdb', data: res })),
    () => doubanCrawler.search(keyword, type).then(res => ({ source: 'douban-crawler', data: res.data })),
    () => doubanProxy.search(keyword, type).then(res => ({ source: 'douban-proxy', data: res }))
  ]);
}

/**
 * 搜索电视剧
 * @param {string} keyword - 搜索关键词
 * @returns {Promise}
 */
async function searchTV(keyword) {
  return tryProviders([
    () => tmdb.searchTV(keyword).then(res => ({ source: 'tmdb', data: res })),
    () => doubanProxy.searchTV(keyword).then(res => ({ source: 'douban', data: res }))
  ]);
}

/**
 * 搜索电影
 * @param {string} keyword - 搜索关键词
 * @returns {Promise}
 */
async function searchMovie(keyword) {
  return tryProviders([
    () => tmdb.search(keyword).then(res => ({ source: 'tmdb', data: res })),
    () => doubanProxy.searchMovie(keyword).then(res => ({ source: 'douban', data: res }))
  ]);
}

/**
 * 获取电视剧详情
 * @param {string} id - 影视 ID (带前缀 tmdb_或 douban_)
 * @returns {Promise}
 */
async function getTVDetail(id) {
  if (id.startsWith('douban_')) {
    const doubanId = id.replace('douban_', '');
    return doubanProxy.getTVDetail(doubanId).then(res => ({ source: 'douban', data: res }));
  } else {
    // TMDB ID
    const tmdbId = id.replace('tmdb_', '');
    return tmdb.getTVDetail(tmdbId).then(res => ({ source: 'tmdb', data: res }));
  }
}

/**
 * 获取电影详情
 * @param {string} id - 影视 ID
 * @returns {Promise}
 */
async function getMovieDetail(id) {
  if (id.startsWith('douban_')) {
    const doubanId = id.replace('douban_', '');
    return doubanProxy.getMovieDetail(doubanId).then(res => ({ source: 'douban', data: res }));
  } else {
    const tmdbId = id.replace('tmdb_', '');
    return tmdb.getTVDetail(tmdbId).then(res => ({ source: 'tmdb', data: res }));
  }
}

/**
 * 获取详情 (自动判断类型)
 * @param {string} id - 影视 ID
 * @param {string} type - 类型 tv|movie
 * @returns {Promise}
 */
async function getDetail(id, type = 'tv') {
  if (type === 'movie') {
    return getMovieDetail(id);
  } else {
    return getTVDetail(id);
  }
}

/**
 * 获取热门电视剧
 * @param {number} page - 页码
 * @returns {Promise}
 */
async function getPopularTV(page = 1) {
  return tryProviders([
    () => tmdb.getPopular(page).then(res => ({ source: 'tmdb', data: res })),
    () => doubanProxy.getPopularTV().then(res => ({ source: 'douban', data: res }))
  ]);
}

/**
 * 获取正在播出的电视剧
 * @param {number} page - 页码
 * @returns {Promise}
 */
async function getOnTheAir(page = 1) {
  return tmdb.getOnTheAir(page).then(res => ({ source: 'tmdb', data: res }));
}

/**
 * 解析数据 (根据来源选择解析器)
 * @param {object} item - 原始数据
 * @param {string} source - 来源 tmdb|douban
 * @param {string} type - 类型 tv|movie
 * @returns {object}
 */
function parseData(item, source, type = 'tv') {
  if (source === 'douban') {
    if (type === 'movie') {
      return doubanProxy.parseMovie(item);
    } else {
      return doubanProxy.parseTV(item);
    }
  } else {
    // TMDB
    if (type === 'movie') {
      return tmdb.parseTV(item); // TMDB 的 parseTV 也支持电影
    } else {
      return tmdb.parseTV(item);
    }
  }
}

/**
 * 获取当前 API 源状态
 * @returns {object}
 */
function getProviderStatus() {
  return { ...providerStatus };
}

/**
 * 设置 API 源启用状态
 * @param {string} provider - API 源
 * @param {boolean} enabled - 是否启用
 */
function setProviderEnabled(provider, enabled) {
  if (providerStatus[provider]) {
    providerStatus[provider].enabled = enabled;
  }
}

/**
 * 测试 API 源可用性
 * @param {string} provider - API 源
 * @returns {Promise<boolean>}
 */
async function testProvider(provider) {
  try {
    if (provider === API_PROVIDERS.TMDB) {
      await tmdb.getPopular(1);
      providerStatus[provider].lastError = null;
      return true;
    } else if (provider === API_PROVIDERS.DOUBAN) {
      await doubanProxy.getPopularTV();
      providerStatus[provider].lastError = null;
      return true;
    }
  } catch (error) {
    providerStatus[provider].lastError = error.message;
    return false;
  }
  return false;
}

module.exports = {
  search,
  searchTV,
  searchMovie,
  getDetail,
  getTVDetail,
  getMovieDetail,
  getPopularTV,
  getOnTheAir,
  parseData,
  getProviderStatus,
  setProviderEnabled,
  testProvider,
  API_PROVIDERS,
  PRIORITY
};
