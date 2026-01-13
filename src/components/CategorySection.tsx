import { Link } from "react-router-dom";
import { ChevronRight, Heart } from "lucide-react";
import { Article } from "@/services/articleService";
import { useLikes } from "@/hooks/useLikes";
import { cn } from "@/lib/utils";
import { BookmarkButton } from "./BookmarkButton";

interface CategorySectionProps {
  title: string;
  articles: Article[];
  viewAllLink: string;
  isLoading?: boolean;
}

const CategorySection = ({ title, articles, viewAllLink, isLoading }: CategorySectionProps) => {
  const { toggleLike, isArticleLiked } = useLikes();

  const handleToggleLike = (e: React.MouseEvent, article: Article) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(article);
  };

  if (!isLoading && (!articles || articles.length === 0)) return null;

  return (
    <section className="pb-16 pt-0">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl">
          {/* Header */}
          <div className="relative pt-6 mb-8 flex justify-between items-center">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-border/40"></div>
            <div className="absolute top-0 left-0 w-16 h-[2px] bg-yellow-500"></div>
            <h2 className="text-sm md:text-base font-bold uppercase tracking-tight">{title}</h2>
            <Link to={viewAllLink} className="text-xs md:text-sm font-bold md:font-medium text-yellow-500 md:text-muted-foreground md:hover:text-primary transition-colors flex items-center gap-1 group/link">
              View All
              <ChevronRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>

          {/* List Layout (matching NewsGrid) */}
          <div className="space-y-8">
            {isLoading ? (
              // Improved Skeleton loading state
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-6 items-start animate-pulse">
                  <div className="w-full md:w-[320px] h-[200px] md:h-[180px] bg-muted rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 w-40 bg-muted rounded"></div>
                    <div className="h-8 w-full bg-muted rounded"></div>
                    <div className="h-4 w-full bg-muted rounded"></div>
                  </div>
                </div>
              ))
            ) : (
              articles.slice(0, 4).map((article) => (
                <article key={article.id} className="group cursor-pointer">
                  <Link to={`/article/${article.id}`} className="block">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                      {/* Image Section */}
                      <div className="w-full md:w-[320px] h-[200px] md:h-auto md:aspect-video flex-shrink-0 relative overflow-hidden rounded-lg">
                        <div className="w-full h-full relative">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover bg-muted transition-transform duration-500 group-hover:scale-105"
                          />

                          {/* Action Buttons */}
                          <div className="hidden md:flex absolute top-2 right-2 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
