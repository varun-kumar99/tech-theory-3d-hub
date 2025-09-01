import React from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks } from '@/contexts/BookmarkContext';
import { cn } from '@/lib/utils';

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
  const bookmarked = isBookmarked(article.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(article);
  };

  // Handle minimal variant as a special case
  if (variant === 'minimal') {
    return (
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
    );
  }

  return (
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
  );
};
