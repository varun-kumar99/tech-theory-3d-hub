import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { articleService, Article } from "@/services/articleService";
import { Loader2 } from "lucide-react";

interface HeroSectionProps {
  articles?: Article[];
}

const HeroSection = ({ articles }: HeroSectionProps) => {
  const [internalStories, setInternalStories] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(!articles);

  useEffect(() => {
    if (articles) return;

    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const data = await articleService.getPublishedArticles();
        setInternalStories(data.slice(0, 12));
      } catch (error) {
        console.error("Failed to fetch latest stories", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [articles]);

  const latestStories = articles || internalStories;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (latestStories.length === 0) {
    return (
      <section className="py-8 px-6 bg-background">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">No articles found. Start creating some!</p>
          <Button asChild className="mt-4">
            <Link to="/admin">Create Article</Link>
          </Button>
        </div>
      </section>
    );
  }


  return (
    <section className="relative py-16 px-4">
      <div className="container mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Latest Stories</h2>
          <div className="w-16 h-1 bg-primary rounded-full"></div>
        </div>

        {/* Featured Layout - Large card + 2x2 grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Large Featured Article */}
          <article className="group cursor-pointer">
            <Link to={`/article/${latestStories[0].id}`} className="block">
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
                    <span>{latestStories[0].publishedDate}</span>
                  </div>
                </div>
              </div>
            </Link>
          </article>

          {/* 2x2 Grid of smaller cards */}
          <div className="grid grid-cols-2 gap-4">
            {latestStories.slice(1, 5).map((story, index) => (
              <article key={story.id} className="group cursor-pointer">
                <Link to={`/article/${story.id}`} className="block">
                  <div className="rounded-sm overflow-hidden relative h-[192px] transition-all duration-300 hover:scale-[1.02] bg-card shadow-sm">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                      <h3 className="text-sm md:text-base font-bold leading-tight text-white mb-1 line-clamp-2 drop-shadow-md group-hover:underline decoration-1 underline-offset-2">
                        {story.title}
                      </h3>
                      <div className="text-xs text-gray-300 flex items-center font-medium">
                        <span>{story.publishedDate}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>

        {/* Bottom Row - Three Equal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {latestStories.slice(5, 8).map((story, index) => (
            <article key={story.id} className="group cursor-pointer">
              <Link to={`/article/${story.id}`} className="block">
                <div className="rounded-sm overflow-hidden relative h-[280px] transition-all duration-300 hover:scale-[1.02] bg-card shadow-sm">
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
                      <span>{story.publishedDate}</span>
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