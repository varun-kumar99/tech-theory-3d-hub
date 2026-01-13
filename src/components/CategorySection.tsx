import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Article } from "@/services/articleService";

interface CategorySectionProps {
  title: string;
  articles: Article[];
  viewAllLink: string;
  isLoading?: boolean;
}

const CategorySection = ({ title, articles, viewAllLink, isLoading }: CategorySectionProps) => {
  if (!isLoading && (!articles || articles.length === 0)) return null;

  return (
    <section className="pb-6 pt-0">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="relative pt-4 mb-4 flex justify-between items-end">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10"></div>
          <div className="absolute top-0 left-0 w-16 h-[2px] bg-yellow-500"></div>
          
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">{title}</h2>
          <Link to={viewAllLink} className="text-[10px] font-bold uppercase tracking-widest text-white hover:text-yellow-500 transition-colors flex items-center gap-1.5 group/link pb-1">
            SEE MORE
            <ChevronRight className="w-3.5 h-3.5 text-yellow-500 transition-transform group-hover/link:translate-x-1" />
          </Link>
        </div>

        {/* Grid Layout (matching reference image) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-video bg-muted animate-pulse rounded-xl" />
            ))
          ) : (
            articles.map((article) => (
              <article key={article.id} className="group cursor-pointer relative overflow-hidden rounded-xl bg-zinc-900 border border-white/5 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-yellow-500/10">
                <Link to={`/article/${article.id}`} className="block relative aspect-video">
                  {/* Image Section */}
                  <img
                    src={article.image}
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Content Section Overlay (Bottom) */}
                  <div className="absolute inset-x-0 bottom-0 p-4 pt-10 z-10 flex flex-col justify-end">
                    <h3 className="text-sm md:text-base font-bold leading-tight text-white group-hover:text-yellow-500 transition-colors line-clamp-2 drop-shadow-lg">
                      {article.title}
                    </h3>
                  </div>
                </Link>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
