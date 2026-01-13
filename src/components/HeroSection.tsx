import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { articleService, Article } from "@/services/articleService";
import { Loader2 } from "lucide-react";

interface HeroSectionProps {
  articles?: Article[];
  isLoading?: boolean;
}

const HeroSection = ({ articles, isLoading: externalLoading }: HeroSectionProps) => {
  const [internalStories, setInternalStories] = useState<Article[]>([]);
  const [internalLoading, setInternalLoading] = useState(!articles);

  useEffect(() => {
    if (articles) return;

    const fetchArticles = async () => {
      setInternalLoading(true);
      try {
        const data = await articleService.getPublishedArticles();
        setInternalStories(data.slice(0, 12));
      } catch (error) {
        console.error("Failed to fetch latest stories", error);
      } finally {
        setInternalLoading(false);
      }
    };

    fetchArticles();
  }, [articles]);

  const isLoading = externalLoading ?? internalLoading;
  const latestStories = articles || internalStories;

  if (isLoading) {
    return (
      <section className="relative pb-8 md:pb-16 pt-2">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <div className="h-9 w-48 bg-muted animate-pulse rounded-md mb-2"></div>
            <div className="w-16 h-1 bg-primary rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="h-[400px] bg-muted animate-pulse rounded-sm"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-[192px] bg-muted animate-pulse rounded-sm"></div>
              <div className="h-[192px] bg-muted animate-pulse rounded-sm"></div>
              <div className="h-[192px] bg-muted animate-pulse rounded-sm"></div>
              <div className="h-[192px] bg-muted animate-pulse rounded-sm"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (latestStories.length === 0) {
    return (
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <p className="text-muted-foreground">No articles found. Start creating some!</p>
          <Button asChild className="mt-4">
            <Link to="/admin">Create Article</Link>
          </Button>
        </div>
      </section>
    );
  }

  const handlePrefetch = (articleId: string | number) => {
    articleService.getArticleById(String(articleId)).catch(e => console.warn("Prefetch failed:", e));
  };

  return (
    <section className="relative pb-8 md:pb-16 pt-2">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Latest Stories</h2>
          <div className="w-16 h-1 bg-primary rounded-full"></div>
        </div>

        {/* Featured Layout - Large card + 2x2 grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Large Featured Article */}
          <article className="group cursor-pointer">
            <Link to={`/article/${latestStories[0].id}`} className="block" onMouseEnter={() => handlePrefetch(latestStories[0].id)}>
              <div className="rounded-sm overflow-hidden relative h-[400px] transition-all duration-300 hover:scale-[1.02] bg-card shadow-sm group">
                <img
                  src={latestStories[0].image}
                  alt={latestStories[0].title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end z-10">
                  <h3 className="text-2xl md:text-4xl font-extrabold leading-tight text-white mb-1 line-clamp-2 drop-shadow-md group-hover:underline decoration-2 underline-offset-4">
                    {latestStories[0].title}
                  </h3>
                  <div className="text-sm text-gray-300 flex items-center font-medium">
                    <span>{latestStories[0].date}</span>
                  </div>
                </div>
              </div>
            </Link>
          </article>

          {/* 2x2 Grid of smaller cards (Desktop) / Vertical List (Mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestStories.slice(1, 5).map((story, index) => (
              <article key={story.id} className="group cursor-pointer">
                <Link to={`/article/${story.id}`} className="block" onMouseEnter={() => handlePrefetch(story.id)}>
                  {/* Desktop Card (Original) */}
                  <div className="hidden md:block rounded-sm overflow-hidden relative h-[192px] transition-all duration-300 hover:scale-[1.02] bg-card shadow-sm">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                      <h3 className="text-base font-bold leading-tight text-white mb-1 line-clamp-2 drop-shadow-md group-hover:underline decoration-1 underline-offset-2">
                        {story.title}
                      </h3>
                      <div className="text-xs text-gray-300 flex items-center font-medium">
                        <span>{story.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Card (List Style) */}
                  <div className="flex md:hidden flex-row gap-3 items-stretch h-[90px]">
                    <div className="w-[120px] flex-shrink-0 relative overflow-hidden rounded-lg">
                      <img
                        src={story.image}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-sm font-bold leading-tight text-foreground line-clamp-3 mb-1">
                        {story.title}
                      </h3>
                      <div className="text-[10px] text-muted-foreground">
                        {story.date}
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>

        {/* Bottom Row - Three Equal Cards (Desktop) / Vertical List (Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {latestStories.slice(5, 8).map((story, index) => (
            <article key={story.id} className="group cursor-pointer">
              <Link to={`/article/${story.id}`} className="block" onMouseEnter={() => handlePrefetch(story.id)}>
                {/* Desktop Card */}
                <div className="hidden md:block rounded-sm overflow-hidden relative h-[280px] transition-all duration-300 hover:scale-[1.02] bg-card shadow-sm">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <h3 className="text-xl font-bold leading-tight text-white mb-1 line-clamp-2 drop-shadow-md group-hover:underline decoration-2 underline-offset-4">
                      {story.title}
                    </h3>
                    <div className="text-sm text-gray-300 flex items-center font-medium">
                      <span>{story.date}</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Card (List Style) */}
                <div className="flex md:hidden flex-row gap-3 items-stretch h-[90px]">
                  <div className="w-[120px] flex-shrink-0 relative overflow-hidden rounded-lg">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-sm font-bold leading-tight text-foreground line-clamp-3 mb-1">
                      {story.title}
                    </h3>
                    <div className="text-[10px] text-muted-foreground">
                      {story.date}
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
