import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { articleService } from '@/services/articleService';

interface Article {
  id: number;
  title: string;
  category: string;
  image: string;
  author: string;
  date: string;
  readTime?: string;
  excerpt?: string;
}

interface BookmarkContextType {
  bookmarks: Article[];
  addBookmark: (article: Article) => void;
  removeBookmark: (articleId: number) => void;
  isBookmarked: (articleId: number) => boolean;
  toggleBookmark: (article: Article) => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

interface BookmarkProviderProps {
  children: ReactNode;
}

export const BookmarkProvider: React.FC<BookmarkProviderProps> = ({ children }) => {
  const { user, addBookmark: authAddBookmark, removeBookmark: authRemoveBookmark } = useAuth();
  const [bookmarks, setBookmarks] = useState<Article[]>([]);

  // Sync with AuthContext bookmarks when user changes
  useEffect(() => {
    const syncBookmarks = async () => {
      if (user && user.bookmarks) {
        // Fetch full article details for each bookmark ID
        const loadedBookmarks = await Promise.all(
          user.bookmarks.map(async (id) => {
            const article = await articleService.getArticleById(id);
            if (!article) return null;
            
            // Map ArticleService Article to BookmarkContext Article (they are slightly different)
            return {
              id: Number(article.id),
              title: article.title,
              category: article.category,
              image: article.image || '',
              author: article.author,
              date: article.date,
              readTime: article.readTime,
              excerpt: article.excerpt
            };
          })
        );
        
        const validBookmarks = loadedBookmarks.filter((b): b is Article => b !== null);
        // Dedup bookmarks by ID to prevent duplicates
        const uniqueBookmarks = Array.from(new Map(validBookmarks.map(item => [item.id, item])).values());
        
        setBookmarks(uniqueBookmarks);
      } else {
        // Fallback to local storage if no user (guest mode) or empty
        const savedBookmarks = localStorage.getItem('tech-theory-bookmarks');
        if (savedBookmarks) {
          try {
            const parsed = JSON.parse(savedBookmarks);
            // Dedup and ensure valid ID
            const unique = Array.from(new Map(parsed.map((item: Article) => [Number(item.id), { ...item, id: Number(item.id) }])).values());
            setBookmarks(unique as Article[]);
          } catch (error) {
            console.error('Error loading bookmarks:', error);
          }
        }
      }
    };

    syncBookmarks();
  }, [user]); // Re-run when user (and their bookmarks) changes

  // Save guest bookmarks to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('tech-theory-bookmarks', JSON.stringify(bookmarks));
    }
  }, [bookmarks, user]);

  const addBookmark = (article: Article) => {
    const articleId = Number(article.id);
    
    // Check if already bookmarked to prevent duplicates/errors
    if (isBookmarked(articleId)) {
      return; 
    }

    const bookmarkToAdd = { ...article, id: articleId };

    setBookmarks(prev => {
      // Double check inside state updater for safety
      if (prev.some(bookmark => bookmark.id === articleId)) {
        return prev; 
      }
      return [...prev, bookmarkToAdd];
    });
    
    // Sync with AuthContext if user is logged in
    if (user) {
      authAddBookmark(articleId);
    }
    
    toast.success('Article bookmarked!');
  };

  const removeBookmark = (articleId: number | string) => {
    const id = Number(articleId);
    
    // Check if it exists before trying to remove
    if (!isBookmarked(id)) {
      return;
    }

    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
    
    // Sync with AuthContext if user is logged in
    if (user) {
      authRemoveBookmark(id);
    }
    
    toast.success('Bookmark removed!');
  };

  const isBookmarked = (articleId: number | string) => {
    const id = Number(articleId);
    return bookmarks.some(bookmark => bookmark.id === id);
  };

  const toggleBookmark = (article: Article) => {
    // Force ID to number
    const articleId = Number(article.id);
    const articleWithNumId = { ...article, id: articleId };

    if (isBookmarked(articleId)) {
      removeBookmark(articleId);
    } else {
      addBookmark(articleWithNumId);
    }
  };

  const value = {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};
