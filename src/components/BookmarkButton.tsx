import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks } from '@/contexts/BookmarkContext';
import { cn } from '@/lib/utils';
import { Article } from '@/services/articleService';
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from '@/components/AuthDialog';

interface BookmarkButtonProps {
  article: Article;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'ghost' | 'outline' | 'minimal';
  className?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  article,
  size = 'sm',
  variant = 'ghost',
  className
}) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const bookmarked = isBookmarked(article.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    toggleBookmark(article);
  };

  return (
    <>
      <AuthDialog 
        isOpen={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        title="Bookmark this article"
        description="Sign in to save this article to your bookmarks and access it later."
      />
      {variant === 'minimal' ? (
        <button
          onClick={handleClick}
          className={cn(
            'transition-colors duration-200 p-1 hover:bg-transparent',
            bookmarked 
              ? 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            className
          )}
          aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          {bookmarked ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </button>
      ) : (
        <Button
          variant={variant as 'default' | 'ghost' | 'outline'}
          size={size}
          onClick={handleClick}
          className={cn(
            'transition-colors duration-200',
            bookmarked 
              ? 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            className
          )}
          aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          {bookmarked ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>
      )}
    </>
  );
};
