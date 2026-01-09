import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Rss, Bookmark, MessageSquare, TrendingUp, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { articleService, Article } from "@/services/articleService";
import { Link } from "react-router-dom";

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categoryMap: Record<string, string> = {
    "ai": "AI",
    "computing": "Computing", 
    "automotive": "Automotive",
    "blockchain": "Blockchain",
    "networking": "Networking",
    "smartphones": "Smartphones",
    "gadgets": "Gadgets",
    "ev": "EV",
    "dc": "DC",
    "ios": "iOS",
    "android": "Android",
    "apple": "Apple",
    "amazon-prime": "Amazon Prime",
    "netflix": "Netflix",
    "hotstar": "Hotstar",
    "marvel": "Marvel",
    "games": "Games",
    "movies": "Movies",
    "anime": "Anime",
    "cars": "Cars",
    "bikes": "Bikes"
  };

  const currentCategory = category ? categoryMap[category.toLowerCase()] || category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ") : "All";

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const data = await articleService.getPublishedArticles();
        setArticles(data);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = useMemo(() => {
    const searchCategory = (category?.toLowerCase() || "").replace(/-/g, " ");
    
    const filtered = currentCategory === "All" 
      ? articles 
      : articles.filter(article => {
          // Escape special characters for regex
          const escapedSearch = searchCategory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          // Use word boundary to prevent partial matches (e.g., "ai" in "entertainment", "ev" in "review")
          const searchRegex = new RegExp(`\\b${escapedSearch}\\b`, 'i');

          // Helper for strict matching
          const isMatch = (text: string | undefined) => {
            if (!text) return false;
            const t = text.toLowerCase();
            // Exact match
            if (t === searchCategory) return true;
            // Word boundary match
            if (searchRegex.test(t)) return true;
            // Singular/Plural check
            if (t === searchCategory + 's' || searchCategory === t + 's') return true;
            return false;
          };

          // Check primary category
          if (isMatch(article.category)) return true;
          
          // Check sub category
          if (isMatch(article.subCategory)) return true;
          
          // Check tags
          if (article.tags?.some(tag => isMatch(tag))) return true;

          // Special handling for EV inclusion in Cars/Bikes pages
           if (article.subCategory === "EV") {
              if (searchCategory === "cars" && !/bike|motorcycle|scooter/i.test(article.title)) return true;
              if (searchCategory === "bikes" && /bike|motorcycle|scooter/i.test(article.title)) return true;
           }

           // Entertainment Cross-Categorization
           const titleLower = article.title.toLowerCase();
           const subCatLower = (article.subCategory || "").toLowerCase();
           const catLower = article.category.toLowerCase();

           // 1. Marvel/DC -> Movies
           if (searchCategory === "movies") {
              if (subCatLower === "marvel" || subCatLower === "dc") return true;
              // Include Netflix/Prime if explicitly identified as movie/film
              if ((subCatLower === "netflix" || subCatLower === "amazon prime" || subCatLower === "hotstar") && 
                  (titleLower.includes("movie") || titleLower.includes("film"))) return true;
           }

           // 2. Animated content -> Anime
           if (searchCategory === "anime") {
              if (titleLower.includes("animated") || titleLower.includes("animation") || titleLower.includes("anime")) return true;
              if (article.tags?.some(t => t.toLowerCase().includes("anime") || t.toLowerCase().includes("animated"))) return true;
           }

           // 3. Movies/etc -> Marvel/DC (Bi-directional)
           if (searchCategory === "marvel" && (titleLower.includes("marvel") || titleLower.includes("mcu") || titleLower.includes("avengers"))) return true;
           if (searchCategory === "dc" && (titleLower.includes("dc") || titleLower.includes("batman") || titleLower.includes("superman") || titleLower.includes("joker"))) return true;

           // 4. Movies/etc -> Netflix/Prime (Bi-directional)
           if (searchCategory === "netflix" && titleLower.includes("netflix")) return true;
           if (searchCategory === "amazon prime" && (titleLower.includes("amazon prime") || titleLower.includes("prime video"))) return true;
           if (searchCategory === "hotstar" && (titleLower.includes("hotstar") || titleLower.includes("disney+"))) return true;
            
           // Check status (double check for published)
          if ((article.status || '').toLowerCase() !== 'published') return false;

          return false;
      });

    // Default sort by latest for the new design
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [currentCategory, articles, category]);

  const featuredArticles = filteredArticles.slice(0, 6);
  const latestArticles = filteredArticles.slice(6);

  // Helper to format date relative (mock implementation, ideally use date-fns)
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-8 pb-16 flex justify-center items-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8 border-b border-border/40 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-1 px-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-base font-medium">Back</span>
              </Button>
              <span className="text-muted-foreground text-base">/</span>
              <h1 className="text-base font-bold uppercase tracking-tight text-blue-500">{currentCategory}</h1>
            </div>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="space-y-12">
              {/* Featured Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Large Cards (Top Row) - First 2 items */}
                {featuredArticles.slice(0, 2).map((article) => (
                  <Link 
                    key={article.id} 
                    to={`/article/${article.id}`}
                    className="col-span-1 md:col-span-2 relative group overflow-hidden rounded-xl aspect-video md:aspect-[16/9]"
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 w-full">
                      {article.subCategory && (
                        <Badge variant="secondary" className="mb-3 bg-blue-600 hover:bg-blue-700 text-white border-none">
                          {article.subCategory}
                        </Badge>
                      )}
                      <h2 className="text-xl md:text-2xl font-bold text-white leading-tight group-hover:underline decoration-2 underline-offset-4">
                        {article.title}
                      </h2>
                    </div>
                  </Link>
                ))}

                {/* Smaller Cards (Bottom Row) - Next 4 items */}
                {featuredArticles.slice(2, 6).map((article) => (
                  <Link 
                    key={article.id} 
                    to={`/article/${article.id}`}
                    className="col-span-1 relative group overflow-hidden rounded-xl aspect-video"
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4 w-full">
                      <h3 className="text-sm font-bold text-white leading-snug group-hover:underline decoration-1 underline-offset-2 line-clamp-3">
                        {article.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Latest Section */}
              {latestArticles.length > 0 && (
                <div className="space-y-6 max-w-5xl">
                  <div className="relative pt-6 mb-6">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-border/40"></div>
                    <div className="absolute top-0 left-0 w-16 h-[2px] bg-yellow-500"></div>
                    <h2 className="text-base font-bold uppercase tracking-tight">Latest</h2>
                  </div>
                  
                  <div className="grid gap-6">
                    {latestArticles.map((article) => (
                      <Link key={article.id} to={`/article/${article.id}`}>
                        <Card className="bg-transparent border-none shadow-none group hover:bg-accent/5 transition-colors p-2 -mx-2 rounded-lg">
                          <div className="flex flex-col sm:flex-row gap-6">
                            <div className="sm:w-64 aspect-video flex-shrink-0 overflow-hidden rounded-lg">
                              <img
                                src={article.image}
                                alt={article.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                            <div className="flex-1 min-w-0 py-1">
                              <div className="text-xs text-muted-foreground mb-2">
                                {formatRelativeTime(article.date)}
                              </div>
                              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors leading-tight">
                                {article.title}
                              </h3>
                              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                {article.excerpt}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                                <span className="text-foreground">By {article.author}</span>
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  <span>0</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-50" />
              <h3 className="text-2xl font-bold mb-3">No articles found</h3>
              <p className="text-muted-foreground mb-8 text-lg">
                We couldn't find any articles in the {currentCategory} category.
              </p>
              <Link to="/">
                <Button size="lg">Browse All Articles</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoryPage;
