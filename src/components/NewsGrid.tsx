import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { BookmarkButton } from "./BookmarkButton";
import { Article } from "@/services/articleService";
import { cn } from "@/lib/utils";
import { useLikes } from "@/hooks/useLikes";

interface NewsGridProps {
  articles: Article[];
  title?: string;
  viewAllLink?: string;
  isLoading?: boolean;
}

const NewsGrid = ({ articles, title = "Latest", viewAllLink = "/search", isLoading = false }: NewsGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { toggleLike, isArticleLiked } = useLikes();
  const itemsPerPage = 12;

  const handleToggleLike = (e: React.MouseEvent, article: Article) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(article);
  };

  if (isLoading) {
    return (
      <section className="pb-16 pt-0 px-4">
        <div className="container mx-auto">
          <div className="max-w-5xl">
            <div className="relative pt-6 mb-8 flex justify-between items-center">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-border/40"></div>
              <div className="absolute top-0 left-0 w-16 h-[2px] bg-yellow-500"></div>
              <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
            </div>
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-[320px] h-[180px] bg-muted animate-pulse rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 w-40 bg-muted animate-pulse rounded"></div>
                    <div className="h-8 w-full bg-muted animate-pulse rounded"></div>
                    <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(articles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentArticles = articles.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <section className="pb-16 pt-0 px-4">
      <div className="container mx-auto">
        <div className="max-w-5xl">
          <div className="relative pt-6 mb-8 flex justify-between items-center">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-border/40"></div>
            <div className="absolute top-0 left-0 w-16 h-[2px] bg-yellow-500"></div>
            <h2 className="text-base font-bold uppercase tracking-tight">{title}</h2>
            <Link to={viewAllLink} className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 group/link">
              View All
              <ChevronRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>

          {/* Engadget-style article list with alternating layout */}
          <div className="space-y-8">
            {currentArticles.map((article) => {
              return (
                <article key={article.id} className="group cursor-pointer">
                  <Link to={`/article/${article.id}`} className="block">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      {/* Image Section */}
                      <div className="w-full md:w-[320px] flex-shrink-0 relative overflow-hidden rounded-lg">
                        <div className="aspect-video relative">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover bg-muted transition-transform duration-500 group-hover:scale-105"
                          />
                          
                          {/* Action Buttons */}
                          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button 
                              className={cn(
                                "p-2 backdrop-blur-sm rounded-full transition-colors",
                                isArticleLiked(article) 
                                  ? "bg-red-500 hover:bg-red-600" 
                                  : "bg-black/50 hover:bg-black/70"
                              )}
                              onClick={(e) => handleToggleLike(e, article)}
                            >
                              <Heart className={cn(
                                "w-3.5 h-3.5 text-white",
                                isArticleLiked(article) && "fill-current"
                              )} />
                            </button>
                            <div 
                              className="p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                              onClick={(e) => e.preventDefault()}
                            >
                              <BookmarkButton 
                                article={article} 
                                size="sm" 
                                variant="ghost" 
                                className="p-0 h-3.5 w-3.5 hover:bg-transparent text-white hover:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    
                    {/* Content Section */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                      <div>
                        <div className="flex items-center space-x-2 mb-2 text-xs text-muted-foreground">
                          <span className="uppercase tracking-wide text-primary font-bold">
                            {article.category}
                          </span>
                          <span>•</span>
                          <span>{article.date}</span>
                        </div>
                        
                        <h3 className="text-xl md:text-2xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors mb-3">
                          {article.title}
                        </h3>
                        
                        <p className="text-muted-foreground leading-relaxed mb-4 text-sm md:text-base line-clamp-2">
                          {article.excerpt}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium text-foreground">By {article.author}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                             {article.readTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  </Link>
                </article>
              );
            })}
          </div>

          {/* Minimal Pagination - Only show if more than 1 page */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center space-x-8">
              {currentPage > 1 && (
                <button
                  onClick={prevPage}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>
              )}
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-sm font-medium rounded transition-colors duration-200 ${
                      currentPage === page
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              {currentPage < totalPages && (
                <button
                  onClick={nextPage}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsGrid;