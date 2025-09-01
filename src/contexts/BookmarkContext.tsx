import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

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
  const [bookmarks, setBookmarks] = useState<Article[]>([]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('tech-theory-bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    }
  }, []);

  // Save bookmarks to localStorage whenever bookmarks change
  useEffect(() => {
    localStorage.setItem('tech-theory-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (article: Article) => {
    setBookmarks(prev => {
      if (prev.some(bookmark => bookmark.id === article.id)) {
        return prev; // Already bookmarked
      }
      toast.success('Article bookmarked!');
      return [...prev, article];
    });
  };

  const removeBookmark = (articleId: number) => {
    setBookmarks(prev => {
      const filtered = prev.filter(bookmark => bookmark.id !== articleId);
      toast.success('Bookmark removed!');
      return filtered;
    });
  };

  const isBookmarked = (articleId: number) => {
    return bookmarks.some(bookmark => bookmark.id === articleId);
  };

  const toggleBookmark = (article: Article) => {
    if (isBookmarked(article.id)) {
      removeBookmark(article.id);
    } else {
      addBookmark(article);
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
