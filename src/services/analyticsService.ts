
import { articleService } from "./articleService";

export interface DailyViews {
  date: string;
  views: number;
}

export interface DeviceStats {
  name: string;
  value: number;
}

export interface UserGrowth {
  month: string;
  users: number;
}

export interface TopArticle {
  id: string;
  title: string;
  views: number;
  likes: number;
}

class AnalyticsService {
  getDailyViews(): DailyViews[] {
    const data: DailyViews[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: Math.floor(Math.random() * 1000) + 500
      });
    }
    return data;
  }

  getDeviceStats(): DeviceStats[] {
    return [
      { name: 'Desktop', value: 65 },
      { name: 'Mobile', value: 25 },
      { name: 'Tablet', value: 10 },
    ];
  }

  getUserGrowth(): UserGrowth[] {
    return [
      { month: 'Jan', users: 120 },
      { month: 'Feb', users: 150 },
      { month: 'Mar', users: 200 },
      { month: 'Apr', users: 280 },
      { month: 'May', users: 350 },
      { month: 'Jun', users: 420 },
    ];
  }

  async getTopArticles(): Promise<TopArticle[]> {
    const articles = await articleService.getAllArticles();
    return articles
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(article => ({
        id: String(article.id),
        title: article.title,
        views: article.views || 0,
        likes: article.likes || 0
      }));
  }
}

export const analyticsService = new AnalyticsService();
