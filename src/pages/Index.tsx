import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import NewsGrid from "@/components/NewsGrid";
import CategorySection from "@/components/CategorySection";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { articleService, Article } from "@/services/articleService";

const Index = () => {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let debounceTimer: any = null;
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const articles = await articleService.getPriorityArticles();
        setAllArticles(articles);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        // If there are no articles returned immediately, keep showing the
        // loading state briefly so a background refresh can supply data
        // without flashing the "No articles" UI. If articles exist, stop loading now.
        if (allArticles.length === 0) {
          // small debounce (1.2s)
          debounceTimer = setTimeout(() => setIsLoading(false), 1200);
        } else {
          setIsLoading(false);
        }
      }
    };
    fetchArticles();

    // Listen for background updates so we can update UI when fresh data arrives
    const handler = (e: any) => {
      try {
        const fresh: Article[] = e?.detail;
        if (Array.isArray(fresh) && fresh.length > 0) {
          setAllArticles(fresh);
          setIsLoading(false);
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('articles:updated', handler as EventListener);
    return () => {
      window.removeEventListener('articles:updated', handler as EventListener);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, []);

  const sortedArticles = articleService.sortArticles(allArticles);
  const heroArticles = sortedArticles.slice(0, 8);
  const trendingArticles = sortedArticles.slice(8);

  // Helper to get recent articles by category or subcategory
  const getArticlesByFilter = (filterFn: (a: Article) => boolean) => {
    const filtered = allArticles.filter(filterFn);
    return articleService.sortArticles(filtered).slice(0, 4);
  };

  const techArticles = getArticlesByFilter(a => a.category === "Tech");

  // Bikes and Cars might be subcategories of Automobile, or main categories depending on data
  const bikesArticles = getArticlesByFilter(a => {
    const isExplicitBike = a.subCategory === "Bikes" || a.category === "Bikes" || (a.category === "Automobile" && a.subCategory === "Bikes");
    const isTagBike = a.tags?.some(t => t.toLowerCase() === "bikes" || t.toLowerCase() === "bike");
    // Heuristic: Include EV articles that mention bike/motorcycle in title
    const isEvBike = a.subCategory === "EV" && /bike|motorcycle|scooter/i.test(a.title);
    return isExplicitBike || isTagBike || isEvBike;
  });

  const carsArticles = getArticlesByFilter(a => {
    const isExplicitCar = a.subCategory === "Cars" || a.category === "Cars" || (a.category === "Automobile" && a.subCategory === "Cars");
    const isTagCar = a.tags?.some(t => t.toLowerCase() === "cars" || t.toLowerCase() === "car");
    // Heuristic: Include EV articles that don't look like bikes (assume car by default for EV)
    const isEvCar = a.subCategory === "EV" && !/bike|motorcycle|scooter/i.test(a.title);
    return isExplicitCar || isTagCar || isEvCar;
  });

  const entertainmentArticles = getArticlesByFilter(a => a.category === "Entertainment");

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Home"
        description="Stay ahead with the latest tech news, reviews, and insights. Your premier destination for technology coverage."
        keywords="tech news, reviews, technology, gadgets, future tech"
      />
      <Navbar />
      <main className="pt-6 pb-12 md:pb-20">
        <HeroSection articles={heroArticles} isLoading={isLoading} />
        <NewsGrid articles={trendingArticles} title="Latest" viewAllLink="/search" isLoading={isLoading} />

        {!isLoading && allArticles.length === 0 && (
          <div className="container mx-auto px-4 text-center py-20 text-gray-700 dark:text-gray-300">
            <h3 className="text-2xl font-semibold mb-2">No articles found</h3>
            <p className="text-sm">It looks like your database has no published articles or permissions prevent reading them. Check Supabase RLS/policies or try signing out and signing in again.</p>
          </div>
        )}

        <div className="space-y-4">
          <CategorySection
            articles={techArticles}
            title="Tech"
            viewAllLink="/category/tech"
            isLoading={isLoading}
          />

          <CategorySection
            articles={bikesArticles}
            title="Bikes"
            viewAllLink="/category/bikes"
            isLoading={isLoading}
          />

          <CategorySection
            articles={carsArticles}
            title="Cars"
            viewAllLink="/category/cars"
            isLoading={isLoading}
          />

          <CategorySection
            articles={entertainmentArticles}
            title="Entertainment"
            viewAllLink="/category/entertainment"
            isLoading={isLoading}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
