import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Filter, Grid3X3, List, Calendar, TrendingUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

interface Article {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  views: number;
}

const CategoryPage = () => {
  const { category } = useParams();
  const [sortBy, setSortBy] = useState("latest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categoryMap: Record<string, string> = {
    "ai": "AI",
    "computing": "Computing", 
    "automotive": "Automotive",
    "blockchain": "Blockchain",
    "networking": "Networking"
  };

  const currentCategory = category ? categoryMap[category.toLowerCase()] || category : "All";

  const filteredArticles = useMemo(() => {
    // Mock articles data
    const allArticles: Article[] = [
      {
        id: 1,
        title: "AI Revolution in Smartphone Photography",
        category: "AI",
        excerpt: "How machine learning is transforming mobile cameras and computational photography...",
        image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&h=250&fit=crop",
        author: "Sarah Chen",
        date: "2 hours ago",
        readTime: "5 min",
        views: 1247
      },
      {
        id: 2,
        title: "The Future of Quantum Computing",
        category: "Computing",
        excerpt: "Exploring the potential of quantum computers in solving complex problems...",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=250&fit=crop",
        author: "David Kim",
        date: "4 hours ago",
        readTime: "7 min",
        views: 892
      },
      {
        id: 3,
        title: "Electric Vehicle Market Trends 2024",
        category: "Automotive",
        excerpt: "Analysis of the growing electric vehicle market and key players...",
        image: "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400&h=250&fit=crop",
        author: "Lisa Wang",
        date: "6 hours ago",
        readTime: "4 min",
        views: 645
      },
      {
        id: 4,
        title: "Machine Learning in Healthcare Diagnostics",
        category: "AI",
        excerpt: "How AI is revolutionizing medical diagnosis and patient care...",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop",
        author: "Dr. Emily Rodriguez",
        date: "8 hours ago",
        readTime: "6 min",
        views: 1156
      },
      {
        id: 5,
        title: "Neural Networks and Deep Learning Advances",
        category: "AI",
        excerpt: "Latest breakthroughs in neural network architectures and training methods...",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop",
        author: "Prof. Michael Chen",
        date: "12 hours ago",
        readTime: "8 min",
        views: 789
      },
      {
        id: 6,
        title: "Edge Computing Revolution",
        category: "Computing",
        excerpt: "How edge computing is transforming data processing and IoT applications...",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop",
        author: "Alex Johnson",
        date: "1 day ago",
        readTime: "5 min",
        views: 934
      }
    ];
    
    const filtered = currentCategory === "All" 
      ? allArticles 
      : allArticles.filter(article => article.category === currentCategory);

    
    // Sort articles
    const sortedFiltered = [...filtered];
    switch (sortBy) {
      case "latest":
        sortedFiltered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case "popular":
        sortedFiltered.sort((a, b) => b.views - a.views);
        break;
      case "trending":
        // Mock trending logic
        sortedFiltered.sort((a, b) => b.views - a.views);
        break;
      default:
        break;
    }

    return sortedFiltered;
  }, [currentCategory, sortBy]);  const categoryStats = {
    totalArticles: filteredArticles.length,
    totalViews: filteredArticles.reduce((sum, article) => sum + article.views, 0),
    avgReadTime: Math.round(
      filteredArticles.reduce((sum, article) => sum + parseInt(article.readTime), 0) / 
      filteredArticles.length
    )
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-20">
        <div className="container mx-auto px-4">
          {/* Category Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {currentCategory} Articles
                </h1>
                <p className="text-muted-foreground">
                  Discover the latest {currentCategory.toLowerCase()} insights and innovations
                </p>
              </div>
              
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {categoryStats.totalArticles} Articles
              </Badge>
            </div>

            {/* Category Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Articles</p>
                    <p className="text-2xl font-bold">{categoryStats.totalArticles}</p>
                  </div>
                  <Filter className="h-8 w-8 text-muted-foreground" />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">{categoryStats.totalViews.toLocaleString()}</p>
                  </div>
                  <Eye className="h-8 w-8 text-muted-foreground" />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Read Time</p>
                    <p className="text-2xl font-bold">{categoryStats.avgReadTime}m</p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Articles */}
          {filteredArticles.length > 0 ? (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-6"
            }>
              {filteredArticles.map((article) => (
                <Card key={article.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <Link to={`/article/${article.id}`}>
                      {viewMode === "grid" ? (
                        <div>
                          <div className="relative">
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                            <div className="absolute top-3 left-3">
                              <Badge>{article.category}</Badge>
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary">
                              {article.title}
                            </h3>
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                              {article.excerpt}
                            </p>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>{article.author}</span>
                              <div className="flex items-center gap-2">
                                <span>{article.date}</span>
                                <span>•</span>
                                <span>{article.readTime} read</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4 p-6">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">{article.category}</Badge>
                              <span className="text-sm text-muted-foreground">{article.date}</span>
                            </div>
                            <h3 className="font-semibold mb-2 group-hover:text-primary">
                              {article.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {article.excerpt}
                            </p>
                            <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                              <span>by {article.author}</span>
                              <div className="flex items-center gap-2">
                                <span>{article.readTime} read</span>
                                <span>•</span>
                                <span>{article.views} views</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find any articles in the {currentCategory} category.
              </p>
              <Link to="/">
                <Button>Browse All Articles</Button>
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
