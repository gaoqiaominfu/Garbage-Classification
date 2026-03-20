// utils/config.js - 配置文件

module.exports = {
  // TMDB API 配置
  tmdb: {
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p/w500',
    apiKey: '' // 需配置 TMDB API Key
  },

  // 豆瓣代理 API 配置
  douban: {
    proxyUrl: 'https://api.douban.uomg.com',
    enabled: true
  },

  // API 源选择 (auto|tmdb|douban)
  // auto: 自动切换 (优先 TMDB，失败切豆瓣)
  apiProvider: 'auto',

  // 默认语言
  language: 'zh-CN',

  // 是否包含成人内容
  includeAdult: false,

  // 缓存配置
  cache: {
    enabled: true,
    expireTime: 30 * 60 * 1000 // 30 分钟
  }
};
