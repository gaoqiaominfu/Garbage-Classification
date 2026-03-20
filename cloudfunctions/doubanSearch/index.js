// 云函数入口文件
const cloud = require('wx-server-sdk');
const axios = require('axios');
const cheerio = require('cheerio');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 豆瓣移动搜索 URL
const DOUBAN_MOBILE = 'https://m.douban.com';

/**
 * 解析豆瓣搜索页 HTML
 */
function parseSearchHTML(html, type = 'tv') {
  const $ = cheerio.load(html);
  const results = [];
  
  try {
    // 提取 script 标签中的 JSON 数据 (豆瓣有时会注入)
    const scriptContent = $('script').filter((i, elem) => {
      return $(elem).html() && $(elem).html().includes('__INITIAL_STATE__');
    }).html();
    
    if (scriptContent) {
      const jsonMatch = scriptContent.match(/window\.__INITIAL_STATE__\s*=\s*({.+?})\s*;/);
      if (jsonMatch && jsonMatch[1]) {
        const data = JSON.parse(jsonMatch[1]);
        if (data.subject_collection_items) {
          data.subject_collection_items.forEach(item => {
            results.push(parseSubjectItem(item, type));
          });
        }
      }
    }
  } catch (e) {
    console.error('解析 JSON 失败:', e);
  }
  
  // 如果 JSON 解析失败，尝试从 HTML 提取
  if (results.length === 0) {
    $('.subject-list .item').each((i, elem) => {
      const title = $(elem).find('.title').text().trim();
      const ratingText = $(elem).find('.rating').text();
      const rating = parseFloat(ratingText) || 0;
      const image = $(elem).find('img').attr('src');
      const year = $(elem).find('.year').text().trim();
      const genresText = $(elem).find('.genre').text();
      const genres = genresText ? genresText.split('/').map(g => g.trim()) : [];
      
      if (title) {
        results.push({
          id: `douban_${Date.now()}_${i}`,
          source: 'douban-crawler',
          title,
          originalTitle: '',
          summary: '',
          rating,
          ratingCount: 0,
          poster: image || '',
          backdrop: image || '',
          year,
          genres,
          directors: [],
          casts: [],
          episodesCount: 0,
          seasonsCount: 1,
          status: '',
          subtype: type,
          url: '',
          currentSeason: 1,
          currentEpisode: 0,
          watchStatus: 'watching',
          addedTime: Date.now(),
          updateTime: Date.now()
        });
      }
    });
  }
  
  return results;
}

/**
 * 解析单个条目
 */
function parseSubjectItem(item, type = 'tv') {
  return {
    id: `douban_${item.id || Date.now()}`,
    source: 'douban-crawler',
    title: item.title || item.name || '',
    originalTitle: item.original_title || '',
    summary: item.summary || item.intro || '',
    rating: item.rating ? (item.rating.value || item.rating.score || 0) : 0,
    ratingCount: item.rating ? (item.rating.count || 0) : 0,
    poster: item.pic ? (item.pic.normal || item.pic.large || '') : '',
    backdrop: item.pic ? (item.pic.large || '') : '',
    year: item.year || '',
    genres: item.genres || [],
    directors: item.directors ? item.directors.map(d => d.name) : [],
    casts: item.actors ? item.actors.map(c => c.name) : [],
    episodesCount: item.episodes_count || 0,
    seasonsCount: item.seasons_count || 1,
    status: item.status || '',
    subtype: type,
    url: item.url || '',
    currentSeason: 1,
    currentEpisode: 0,
    watchStatus: 'watching',
    addedTime: Date.now(),
    updateTime: Date.now()
  };
}

// 云函数入口
exports.main = async (event, context) => {
  const { keyword, type = 'tv', page = 1 } = event;
  
  if (!keyword) {
    return {
      code: 400,
      message: '缺少搜索关键词'
    };
  }
  
  try {
    // 爬豆瓣移动搜索页
    const url = `${DOUBAN_MOBILE}/search/`;
    const response = await axios.get(url, {
      params: { 
        query: keyword,
        type: type
      },
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': DOUBAN_MOBILE
      }
    });
    
    // 解析 HTML
    const results = parseSearchHTML(response.data, type);
    
    return {
      code: 200,
      message: 'success',
      data: {
        results,
        total: results.length,
        page,
        keyword,
        type
      }
    };
    
  } catch (error) {
    console.error('搜索失败:', error);
    return {
      code: 500,
      message: error.message || '搜索失败',
      data: null
    };
  }
};
