// utils/douban-crawler.js - 豆瓣网页爬虫
// 直接爬取豆瓣移动端页面，无需 API Key

const DOUBAN_MOBILE = 'https://m.douban.com';

/**
 * 通用请求方法
 * @param {string} url - 请求 URL
 * @param {object} params - 请求参数
 * @returns {Promise}
 */
function request(url, params = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      data: params,
      method: 'GET',
      header: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        'Referer': DOUBAN_MOBILE
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
 * 解析 HTML 字符串
 * @param {string} html - HTML 内容
 * @returns {Document}
 */
function parseHTML(html) {
  // 小程序环境需要用特殊方式解析
  return html;
}

/**
 * 从豆瓣移动搜索页提取数据
 * @param {string} html - 搜索页 HTML
 * @returns {Array}
 */
function parseSearchHTML(html) {
  const results = [];
  
  try {
    // 提取 script 标签中的 JSON 数据
    const jsonMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?})\s*;/);
    if (jsonMatch && jsonMatch[1]) {
      const data = JSON.parse(jsonMatch[1]);
      
      // 提取搜索结果
      if (data.subject_collection_items) {
        data.subject_collection_items.forEach(item => {
          results.push(parseSubjectItem(item));
        });
      }
    }
  } catch (e) {
    console.error('解析豆瓣 HTML 失败:', e);
  }
  
  // 如果没有解析到数据，尝试正则提取
  if (results.length === 0) {
    // 提取单个结果块
    const itemRegex = /<div[^>]*class="card"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g;
    let match;
    
    while ((match = itemRegex.exec(html)) !== null) {
      const itemHtml = match[1];
      
      // 提取标题
      const titleMatch = itemHtml.match(/<span[^>]*class="title"[^>]*>([^<]+)<\/span>/);
      const title = titleMatch ? titleMatch[1].trim() : '';
      
      // 提取评分
      const ratingMatch = itemHtml.match(/<span[^>]*class="rating"[^>]*>([^<]+)<\/span>/);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
      
      // 提取图片
      const imageMatch = itemHtml.match(/<img[^>]*src="([^"]+)"/);
      const image = imageMatch ? imageMatch[1] : '';
      
      // 提取年份
      const yearMatch = itemHtml.match(/<span[^>]*class="year"[^>]*>(\d{4})<\/span>/);
      const year = yearMatch ? yearMatch[1] : '';
      
      // 提取类型
      const genresMatch = itemHtml.match(/<span[^>]*class="genre"[^>]*>([^<]+)<\/span>/);
      const genres = genresMatch ? genresMatch[1].split('/').map(g => g.trim()) : [];
      
      if (title) {
        results.push({
          title,
          rating,
          image,
          year,
          genres,
          type: 'tv' // 默认电视剧
        });
      }
    }
  }
  
  return results;
}

/**
 * 解析豆瓣数据项
 * @param {object} item - 豆瓣数据项
 * @returns {object}
 */
function parseSubjectItem(item) {
  return {
    id: `douban_${item.id || item.rating || Math.random()}`,
    source: 'douban',
    title: item.title || item.name || '',
    originalTitle: item.original_title || '',
    summary: item.summary || item.intro || item.description || '',
    rating: item.rating ? (item.rating.value || item.rating.score || 0) : 0,
    ratingCount: item.rating ? (item.rating.count || 0) : 0,
    poster: item.pic ? (item.pic.normal || item.pic.large || item.pic.small || '') : '',
    backdrop: item.pic ? (item.pic.large || '') : '',
    year: item.year || (item.episodes_info ? item.episodes_info.split(' ')[0] : ''),
    genres: item.genres || [],
    directors: item.directors ? item.directors.map(d => d.name) : [],
    casts: item.actors ? item.actors.map(c => c.name) : [],
    episodesCount: item.episodes_count || 0,
    seasonsCount: item.seasons_count || 1,
    status: item.status || '',
    subtype: item.type === 'movie' ? 'movie' : 'tv',
    url: item.url || '',
    // 追剧相关
    currentSeason: 1,
    currentEpisode: 0,
    watchStatus: 'watching',
    addedTime: Date.now(),
    updateTime: Date.now()
  };
}

/**
 * 搜索电视剧
 * @param {string} keyword - 搜索关键词
 * @returns {Promise}
 */
function searchTV(keyword) {
  // 豆瓣移动搜索 URL
  const url = `${DOUBAN_MOBILE}/search/`;
  
  return request(url, {
    query: keyword,
    type: 'tv'
  }).then(html => {
    const results = parseSearchHTML(html);
    return {
      code: 200,
      data: {
        results: results,
        total: results.length
      }
    };
  });
}

/**
 * 搜索电影
 * @param {string} keyword - 搜索关键词
 * @returns {Promise}
 */
function searchMovie(keyword) {
  const url = `${DOUBAN_MOBILE}/search/`;
  
  return request(url, {
    query: keyword,
    type: 'movie'
  }).then(html => {
    const results = parseSearchHTML(html);
    return {
      code: 200,
      data: {
        results: results,
        total: results.length
      }
    };
  });
}

/**
 * 搜索 (自动判断)
 * @param {string} keyword - 搜索关键词
 * @param {string} type - 类型 tv|movie|auto
 * @returns {Promise}
 */
function search(keyword, type = 'auto') {
  if (type === 'movie') {
    return searchMovie(keyword);
  } else if (type === 'tv') {
    return searchTV(keyword);
  } else {
    // 同时搜索电影和电视剧
    return Promise.all([
      searchMovie(keyword).catch(() => ({ data: { results: [] } })),
      searchTV(keyword).catch(() => ({ data: { results: [] } }))
    ]).then(([movies, tvs]) => {
      return {
        code: 200,
        data: {
          results: [...(movies.data?.results || []), ...(tvs.data?.results || [])],
          total: (movies.data?.results?.length || 0) + (tvs.data?.results?.length || 0)
        }
      };
    });
  }
}

/**
 * 获取详情 (需要额外请求)
 * @param {string} id - 豆瓣 ID
 * @param {string} type - 类型 movie|tv
 * @returns {Promise}
 */
function getDetail(id, type = 'tv') {
  const doubanId = id.replace('douban_', '');
  const url = `${DOUBAN_MOBILE}/${type}/${doubanId}/`;
  
  return request(url).then(html => {
    // 解析详情页
    const jsonMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?})\s*;/);
    if (jsonMatch && jsonMatch[1]) {
      const data = JSON.parse(jsonMatch[1]);
      return {
        code: 200,
        data: parseSubjectItem(data.subject || data)
      };
    }
    
    return {
      code: 404,
      data: null
    };
  });
}

/**
 * 解析电视剧数据为追剧格式
 * @param {object} item - 豆瓣数据
 * @returns {object}
 */
function parseTV(item) {
  return parseSubjectItem(item);
}

/**
 * 解析搜索结果项
 * @param {object} item - 豆瓣搜索结果项
 * @param {string} type - 类型 movie|tv
 * @returns {object}
 */
function parseSearchResult(item, type = 'tv') {
  return parseSubjectItem(item);
}

module.exports = {
  search,
  searchMovie,
  searchTV,
  getDetail,
  parseTV,
  parseSearchResult,
  DOUBAN_MOBILE
};
