// utils/tmdb.js - TMDB API 封装

const config = require('./config.js');

const TMDB_BASE_URL = config.tmdb.baseUrl;
const IMAGE_BASE_URL = config.tmdb.imageBaseUrl;
const API_KEY = config.tmdb.apiKey;
const LANGUAGE = config.language;

/**
 * 获取 API 完整 URL
 * @param {string} endpoint - API 端点
 * @returns {string}
 */
function getApiUrl(endpoint) {
  const separator = endpoint.startsWith('?') ? '&' : '?';
  return `${TMDB_BASE_URL}${endpoint}${separator}api_key=${API_KEY}&language=${LANGUAGE}`;
}

/**
 * 搜索多类型（影视）
 * @param {string} keyword - 搜索关键词
 * @param {number} page - 页码
 * @returns {Promise}
 */
function search(keyword, page = 1) {
  return request({
    url: getApiUrl(`/search/multi&query=${encodeURIComponent(keyword)}&page=${page}&include_adult=${config.includeAdult}`)
  });
}

/**
 * 搜索电视剧
 * @param {string} keyword - 搜索关键词
 * @param {number} page - 页码
 * @returns {Promise}
 */
function searchTV(keyword, page = 1) {
  return request({
    url: getApiUrl(`/search/tv&query=${encodeURIComponent(keyword)}&page=${page}&include_adult=${config.includeAdult}`)
  });
}

/**
 * 获取电视剧详情
 * @param {number} tvId - 电视剧 ID
 * @returns {Promise}
 */
function getTVDetail(tvId) {
  return request({
    url: getApiUrl(`/tv/${tvId}`)
  });
}

/**
 * 获取季详情
 * @param {number} tvId - 电视剧 ID
 * @param {number} seasonNum - 季数
 * @returns {Promise}
 */
function getSeasonDetail(tvId, seasonNum) {
  return request({
    url: getApiUrl(`/tv/${tvId}/season/${seasonNum}`)
  });
}

/**
 * 获取热门电视剧
 * @param {number} page - 页码
 * @returns {Promise}
 */
function getPopular(page = 1) {
  return request({
    url: getApiUrl(`/tv/popular&page=${page}`)
  });
}

/**
 * 获取正在播出的电视剧
 * @param {number} page - 页码
 * @returns {Promise}
 */
function getOnTheAir(page = 1) {
  return request({
    url: getApiUrl(`/tv/on_the_air&page=${page}`)
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
 * 拼接图片 URL
 * @param {string} posterPath - 海报路径
 * @returns {string}
 */
function getImageUrl(posterPath) {
  if (!posterPath) {
    return '/images/empty.png'; // 默认图片
  }
  return IMAGE_BASE_URL + posterPath;
}

/**
 * 解析 TMDB 影视数据为追剧格式
 * @param {object} item - TMDB 影视数据
 * @returns {object}
 */
function parseTV(item) {
  return {
    id: item.id,
    title: item.name || item.title || '',
    originalTitle: item.original_name || item.original_title || '',
    summary: item.overview || '',
    rating: item.vote_average || 0,
    ratingCount: item.vote_count || 0,
    poster: getImageUrl(item.poster_path),
    backdrop: getImageUrl(item.backdrop_path),
    year: item.first_air_date ? item.first_air_date.split('-')[0] : (item.release_date ? item.release_date.split('-')[0] : ''),
    genres: item.genres ? item.genres.map(g => g.name) : [],
    directors: item.created_by ? item.created_by.map(c => c.name) : [],
    casts: [], // TMDB 详情需要额外请求 credits 接口
    episodesCount: 0, // 需要从季信息中计算
    seasonsCount: item.number_of_seasons || 1,
    status: item.status || '',
    subtype: item.media_type || 'tv',
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
 * 解析搜索结果项
 * @param {object} item - TMDB 搜索结果项
 * @returns {object}
 */
function parseSearchResult(item) {
  // 只处理电视剧和电影
  if (item.media_type !== 'tv' && item.media_type !== 'movie') {
    return null;
  }

  return {
    id: item.id,
    title: item.name || item.title || '',
    originalTitle: item.original_name || item.original_title || '',
    summary: item.overview || '',
    rating: item.vote_average || 0,
    ratingCount: item.vote_count || 0,
    poster: getImageUrl(item.poster_path),
    year: item.first_air_date ? item.first_air_date.split('-')[0] : (item.release_date ? item.release_date.split('-')[0] : ''),
    media_type: item.media_type || 'tv'
  };
}

/**
 * 估算单集时长（分钟）
 * @param {string} status - 状态字符串
 * @param {number} seasonsCount - 季数
 * @returns {number}
 */
function estimateEpisodeDuration(status, seasonsCount) {
  // 根据类型估算
  if (seasonsCount > 10) {
    return 45; // 长篇剧集，通常 45 分钟
  }
  return 50; // 默认 50 分钟
}

/**
 * 从季详情计算总集数
 * @param {object} seasonData - 季详情数据
 * @returns {number}
 */
function getEpisodesCountFromSeason(seasonData) {
  if (!seasonData || !seasonData.episodes) {
    return 0;
  }
  return seasonData.episodes.length;
}

module.exports = {
  search,
  searchTV,
  getTVDetail,
  getSeasonDetail,
  getPopular,
  getOnTheAir,
  parseTV,
  parseSearchResult,
  getImageUrl,
  estimateEpisodeDuration,
  getEpisodesCountFromSeason
};
