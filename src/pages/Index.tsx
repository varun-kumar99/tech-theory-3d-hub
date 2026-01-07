import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import NewsGrid from "@/components/NewsGrid";
import CategorySection from "@/components/CategorySection";
import Footer from "@/components/Footer";
import { articleService, Article } from "@/services/articleService";

const Index = () => {
  const [allArticles, setAllArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const articles = await articleService.getPriorityArticles();
      setAllArticles(articles);
    };
    fetchArticles();
  }, []);

  const heroArticles = allArticles.slice(0, 8);
  const trendingArticles = allArticles.slice(8);

  // Helper to get recent articles by category or subcategory
  const getArticlesByFilter = (filterFn: (a: Article) => boolean) => {
    return allArticles
      .filter(filterFn)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);
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
    <div className="min-h-screen">
      <Navbar />
      <main className="pb-20">
        <HeroSection articles={heroArticles} />
        <NewsGrid articles={trendingArticles} title="Latest" viewAllLink="/search" />
        
        {techArticles.length > 0 && (
          <CategorySection 
            articles={techArticles} 
            title="Tech" 
            viewAllLink="/category/tech" 
          />
        )}
        
        {bikesArticles.length > 0 && (
          <CategorySection 
            articles={bikesArticles} 
            title="Bikes" 
            viewAllLink="/category/bikes" 
          />
        )}

        {carsArticles.length > 0 && (
          <CategorySection 
            articles={carsArticles} 
            title="Cars" 
            viewAllLink="/category/cars" 
          />
        )}
        
        {entertainmentArticles.length > 0 && (
          <CategorySection 
            articles={entertainmentArticles} 
            title="Entertainment" 
            viewAllLink="/category/entertainment" 
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
