import React from 'react';
import { useBookmarks } from '@/contexts/BookmarkContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookmarkButton } from '@/components/BookmarkButton';
import { CalendarDays, Clock, User, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const BookmarksPage: React.FC = () => {
  const { bookmarks } = useBookmarks();

  if (bookmarks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Bookmarks</h1>
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            No bookmarks yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start bookmarking articles to read them later
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Bookmarks</h1>
        <Badge variant="secondary" className="text-sm">
          {bookmarks.length} {bookmarks.length === 1 ? 'article' : 'articles'}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bookmarks.map((article) => (
          <Card key={article.id} className="group hover:shadow-lg transition-shadow duration-200">
            <Link to={`/article/${article.id}`} className="block">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={article.image}
                  alt={article.title}
                  className="h-48 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                  <BookmarkButton 
                    article={article} 
                    variant="outline" 
                    className="bg-white/90 backdrop-blur-sm hover:bg-white"
                  />
                </div>
              </div>
            </Link>
            
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-xs">
                  {article.category}
                </Badge>
              </div>
              
              <Link to={`/article/${article.id}`}>
                <h3 className="font-semibold text-lg mb-3 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {article.title}
                </h3>
              </Link>
              
              {article.excerpt && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    <span>{article.date}</span>
                  </div>
                </div>
                {article.readTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{article.readTime}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BookmarksPage;
