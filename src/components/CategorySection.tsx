import { Link } from "react-router-dom";
import { ChevronRight, MessageSquare, Heart } from "lucide-react";
import { Article } from "@/services/articleService";
import { useLikes } from "@/hooks/useLikes";
import { cn } from "@/lib/utils";

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
    <section className="py-2 px-4">
      <div className="container mx-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="relative pt-6 mb-6 flex justify-between items-center">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-border/40"></div>
            <div className="absolute top-0 left-0 w-16 h-[2px] bg-yellow-500"></div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">{title}</h2>
            <Link to={viewAllLink} className="text-xs font-bold text-yellow-500 hover:text-yellow-600 transition-colors flex items-center gap-1 group/link uppercase tracking-wider">
              See More
              <ChevronRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading ? (
              // Improved Skeleton loading state
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-video rounded-xl bg-muted animate-pulse relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-full p-4 space-y-2">
                    <div className="h-4 w-3/4 bg-background/20 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-background/20 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : (
              articles.slice(0, 4).map((article) => (
                <Link key={article.id} to={`/article/${article.id}`} className="group relative block aspect-video overflow-hidden rounded-xl bg-muted">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90" />
                  
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
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
                  </div>

                  <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end h-full">
                    
                    <div className="mt-auto relative">
                      {/* Title */}
                      <h3 className="text-sm md:text-base font-bold leading-tight text-white line-clamp-3 group-hover:text-yellow-400 transition-colors pr-6">
                          {article.title}
                      </h3>
                      
                      {/* Comment Icon - Absolute positioned */}
                      <div className="absolute bottom-1 right-0">
                          <MessageSquare className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
