// test-tmdb.js - TMDB API 测试脚本
// 在微信开发者工具控制台运行

const TMDB_API_KEY = ''; // ⬅️ 先填入你的 API Key

const TMDB_BASE = 'https://api.themoviedb.org/3';

// 测试搜索
function testSearch(keyword = '狂飙') {
  console.log('🔍 开始测试 TMDB API...');
  console.log('关键词:', keyword);
  
  const url = `${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(keyword)}&page=1&include_adult=false`;
  
  console.log('请求 URL:', url);
  
  wx.request({
    url: url,
    method: 'GET',
    success: (res) => {
      console.log('✅ 请求成功！');
      console.log('状态码:', res.statusCode);
      console.log('返回数据:', res.data);
      
      if (res.statusCode === 200 && res.data.results) {
        const tvResults = res.data.results.filter(item => 
          item.media_type === 'tv' || item.media_type === 'movie'
        );
        
        console.log('📺 找到影视作品:', tvResults.length);
        console.log('前 3 个结果:');
        tvResults.slice(0, 3).forEach((item, i) => {
          console.log(`${i + 1}. ${item.name || item.title} (${item.media_type})`);
        });
        
        if (tvResults.length > 0) {
          console.log('\n✅ TMDB API 配置正确！可以正常使用！');
        } else {
          console.log('\n⚠️ 未找到结果，请更换关键词测试');
        }
      } else {
        console.log('❌ API 返回错误:', res.data);
      }
    },
    fail: (err) => {
      console.log('❌ 请求失败:', err);
      console.log('错误信息:', err.errMsg);
      
      if (err.errMsg.includes('url not in domain list')) {
        console.log('\n⚠️ 域名未配置！');
        console.log('请在小程序后台配置域名：');
        console.log('https://api.themoviedb.org');
        console.log('https://image.tmdb.org');
      }
    }
  });
}

// 测试图片 URL
function testImage(posterPath) {
  const imageUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;
  console.log('测试图片 URL:', imageUrl);
  
  // 可以在浏览器中打开这个 URL 测试
  return imageUrl;
}

// 运行测试
console.log('=================================');
console.log('TMDB API 测试工具');
console.log('=================================');
console.log('');
console.log('使用方法:');
console.log('1. 在上方填入你的 TMDB API Key');
console.log('2. 运行 testSearch() 函数');
console.log('');
console.log('示例:');
console.log('testSearch("狂飙")');
console.log('testSearch("流浪地球")');
console.log('testSearch("三体")');
console.log('');
console.log('=================================');

// 自动运行（如果有 API Key）
if (TMDB_API_KEY) {
  console.log('检测到 API Key，自动运行测试...');
  testSearch('狂飙');
} else {
  console.log('⚠️ 请先填入 TMDB API Key');
  console.log('申请地址：https://www.themoviedb.org/settings/api');
}
