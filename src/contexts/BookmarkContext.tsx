import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { articleService } from '@/services/articleService';

interface Article {
  id: string | number;
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
  removeBookmark: (articleId: string | number) => void;
  isBookmarked: (articleId: string | number) => boolean;
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
      if (user) {
        // Migration logic: Check if we have local guest bookmarks to migrate
        const savedBookmarks = localStorage.getItem('tech-theory-bookmarks');
        if (savedBookmarks) {
          try {
            const guestBookmarks: Article[] = JSON.parse(savedBookmarks);
            if (guestBookmarks.length > 0) {
              console.log(`Migrating ${guestBookmarks.length} guest bookmarks for user ${user.id}`);
              
              // Add each guest bookmark to the user's account
              // authAddBookmark is async, but we don't necessarily need to wait for all
              for (const bookmark of guestBookmarks) {
                if (!user.bookmarks.some(id => String(id) === String(bookmark.id))) {
                  authAddBookmark(bookmark.id);
                }
              }
              
              // Clear guest bookmarks after migration attempt
              localStorage.removeItem('tech-theory-bookmarks');
            }
          } catch (e) {
            console.error("Error migrating guest bookmarks:", e);
          }
        }

        if (user.bookmarks) {
          // Fetch full article details for each bookmark ID efficiently
          const loadedArticles = await articleService.getArticlesByIds(user.bookmarks);
          
          const validBookmarks = loadedArticles.map(article => ({
            id: article.id,
            title: article.title,
            category: article.category,
            image: article.image || '',
            author: article.author,
            date: article.date,
            readTime: article.readTime,
            excerpt: article.excerpt
          }));
          
          // Dedup bookmarks by ID to prevent duplicates
          const uniqueBookmarks = Array.from(new Map(validBookmarks.map(item => [item.id, item])).values());
          
          setBookmarks(uniqueBookmarks);
        }
      } else {
        // Fallback to local storage if no user (guest mode) or empty
        const savedBookmarks = localStorage.getItem('tech-theory-bookmarks');
        if (savedBookmarks) {
          try {
            const parsed = JSON.parse(savedBookmarks);
            // Dedup and ensure valid ID
            const unique = Array.from(new Map(parsed.map((item: Article) => [item.id, item])).values());
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
    const articleId = article.id;
    
    // Check if already bookmarked to prevent duplicates/errors
    if (isBookmarked(articleId)) {
      return; 
    }

    const bookmarkToAdd = { ...article };

    setBookmarks(prev => {
      // Double check inside state updater for safety
      if (prev.some(bookmark => String(bookmark.id) === String(articleId))) {
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
    // Check if it exists before trying to remove
    if (!isBookmarked(articleId)) {
      return;
    }

    setBookmarks(prev => prev.filter(bookmark => String(bookmark.id) !== String(articleId)));
    
    // Sync with AuthContext if user is logged in
    if (user) {
      authRemoveBookmark(articleId);
    }
    
    toast.success('Bookmark removed!');
  };

  const isBookmarked = (articleId: number | string) => {
    return bookmarks.some(bookmark => String(bookmark.id) === String(articleId));
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
