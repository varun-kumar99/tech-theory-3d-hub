import { useState, useEffect } from 'react';
import { Article } from '@/services/articleService';

export const useLikes = () => {
  const [likedArticles, setLikedArticles] = useState<string[]>([]);
  const [likedTitles, setLikedTitles] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('liked_articles');
    if (saved) {
      try {
        setLikedArticles(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing liked articles", e);
      }
    }

    const savedTitles = localStorage.getItem('liked_article_titles');
    if (savedTitles) {
      try {
        setLikedTitles(JSON.parse(savedTitles));
      } catch (e) {
        console.error("Error parsing liked article titles", e);
      }
    }
  }, []);

  const toggleLike = (article: Article) => {
    const idStr = String(article.id);
    const title = article.title;
    
    let newLiked: string[];
    let newLikedTitles: string[];
    
    const isCurrentlyLiked = likedArticles.includes(idStr) || likedTitles.includes(title);
    
    if (isCurrentlyLiked) {
      newLiked = likedArticles.filter(id => id !== idStr);
      newLikedTitles = likedTitles.filter(t => t !== title);
    } else {
      newLiked = [...likedArticles, idStr];
      newLikedTitles = [...likedTitles, title];
    }
    
    setLikedArticles(newLiked);
    setLikedTitles(newLikedTitles);
    localStorage.setItem('liked_articles', JSON.stringify(newLiked));
    localStorage.setItem('liked_article_titles', JSON.stringify(newLikedTitles));
    
    return !isCurrentlyLiked;
  };

  const isArticleLiked = (article: Article) => {
    return likedArticles.includes(String(article.id)) || likedTitles.includes(article.title);
  };

  return { toggleLike, isArticleLiked, likedArticles, likedTitles };
};
