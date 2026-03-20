// components/drama-card/drama-card.js - 影视卡片组件逻辑
Component({
  properties: {
    drama: {
      type: Object,
      value: {},
      observer: 'updateData'
    }
  },

  data: {
    percent: 0,
    statusText: '追剧中'
  },

  methods: {
    // 更新数据
    updateData(drama) {
      const percent = this.calculatePercent(drama);
      const statusText = this.getStatusText(drama.watchStatus);
      
      this.setData({
        percent,
        statusText
      });
    },

    // 计算进度百分比
    calculatePercent(drama) {
      if (!drama) return 0;
      if (drama.episodesCount <= 0) {
        return drama.currentEpisode > 0 ? 50 : 0;
      }
      const percent = (drama.currentEpisode / drama.episodesCount) * 100;
      return Math.min(Math.round(percent), 100);
    },

    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        'watching': '追剧中',
        'completed': '已看完',
        'dropped': '已弃剧'
      };
      return statusMap[status] || '追剧中';
    },

    // 卡片点击
    onCardTap() {
      this.triggerEvent('tap', {
        id: this.properties.drama.id
      });
    }
  }
});
