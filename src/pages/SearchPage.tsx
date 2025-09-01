import { useState, useEffect, useMemo } from "react";
import { Search, Filter, X, Calendar, User, Tag, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  tags: string[];
}

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const categories = ["AI", "Computing", "Automotive", "Blockchain", "Networking"];
  const allTags = ["AI", "Photography", "Smartphones", "Quantum", "Computing", "Technology", "EV", "Automotive", "Sustainability", "Web3", "Blockchain", "Decentralization", "5G", "Networking", "Infrastructure"];

  // Popular searches
  const popularSearches = ["AI", "Machine Learning", "Electric Vehicles", "Quantum Computing", "5G", "Blockchain"];

  const filteredArticles = useMemo(() => {
    // Mock data
    const mockArticles: Article[] = [
      {
        id: 1,
        title: "AI Revolution in Smartphone Photography",
        category: "AI",
        excerpt: "How machine learning is transforming mobile cameras...",
        image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&h=250&fit=crop",
        author: "Sarah Chen",
        date: "2 hours ago",
        readTime: "5 min",
        views: 1247,
        tags: ["AI", "Photography", "Smartphones"]
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
        views: 892,
        tags: ["Quantum", "Computing", "Technology"]
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
        views: 645,
        tags: ["EV", "Automotive", "Sustainability"]
      },
      {
        id: 4,
        title: "Web3 and the Decentralized Internet",
        category: "Blockchain",
        excerpt: "Understanding the implications of Web3 technology...",
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop",
        author: "Mark Rodriguez",
        date: "8 hours ago",
        readTime: "6 min",
        views: 1156,
        tags: ["Web3", "Blockchain", "Decentralization"]
      },
      {
        id: 5,
        title: "5G Network Deployment Progress",
        category: "Networking",
        excerpt: "Latest updates on global 5G infrastructure rollout...",
        image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=250&fit=crop",
        author: "Emily Zhang",
        date: "12 hours ago",
        readTime: "3 min",
        views: 789,
        tags: ["5G", "Networking", "Infrastructure"]
      }
    ];
    
    let filtered = mockArticles;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(article =>
        selectedCategories.includes(article.category)
      );
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(article =>
        selectedTags.some(tag => article.tags.includes(tag))
      );
    }

    // Sort
    switch (sortBy) {
      case "date":
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case "views":
        filtered.sort((a, b) => b.views - a.views);
        break;
      case "readTime":
        filtered.sort((a, b) => parseInt(a.readTime) - parseInt(b.readTime));
        break;
      default:
        // Relevance (keep current order)
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategories, selectedTags, sortBy]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedTags([]);
    setSortBy("relevance");
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-20">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Search Articles</h1>
            
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search articles, topics, or keywords..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>

            {/* Quick Searches */}
            {!searchQuery && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Popular Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search) => (
                    <Badge
                      key={search}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleSearch(search)}
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && !searchQuery && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary"
                      onClick={() => handleSearch(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>

                <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                  {/* Sort By */}
                  <div>
                    <h3 className="font-medium mb-3">Sort By</h3>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="views">Views</SelectItem>
                        <SelectItem value="readTime">Read Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Categories */}
                  <div>
                    <h3 className="font-medium mb-3">Categories</h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                          />
                          <label htmlFor={category} className="text-sm cursor-pointer">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="font-medium mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {(selectedCategories.length > 0 || selectedTags.length > 0 || searchQuery) && (
                    <Button
                      variant="outline"
                      onClick={clearAllFilters}
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {filteredArticles.length} result{filteredArticles.length !== 1 ? 's' : ''} found
                  {searchQuery && ` for "${searchQuery}"`}
                </p>
                
                {/* Active Filters */}
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((category) => (
                    <Badge key={category} variant="secondary" className="flex items-center gap-1">
                      {category}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => toggleCategory(category)}
                      />
                    </Badge>
                  ))}
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Results Grid */}
              {filteredArticles.length > 0 ? (
                <div className="space-y-6">
                  {filteredArticles.map((article) => (
                    <Card key={article.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        <Link to={`/article/${article.id}`} className="block">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/3">
                              <img
                                src={article.image}
                                alt={article.title}
                                className="w-full h-48 md:h-32 object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                              />
                            </div>
                            <div className="md:w-2/3 p-6">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">{article.category}</Badge>
                                <span className="text-sm text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">{article.readTime} read</span>
                              </div>
                              
                              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
                                {article.title}
                              </h3>
                              
                              <p className="text-muted-foreground mb-3">
                                {article.excerpt}
                              </p>
                              
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-1">
                                    <User className="w-4 h-4" />
                                    <span>{article.author}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{article.date}</span>
                                  </div>
                                </div>
                                <span>{article.views} views</span>
                              </div>
                              
                              <div className="flex flex-wrap gap-1 mt-3">
                                {article.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                  <Button onClick={clearAllFilters}>Clear All Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchPage;
