import { useState, useEffect, useMemo } from "react";
import { Search, Filter, X, Tag, TrendingUp, LayoutGrid, LayoutList, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link, useSearchParams } from "react-router-dom";
import { articleService, Article } from "@/services/articleService";
import { NAV_CATEGORIES } from "@/constants/categories";
import { BookmarkButton } from "@/components/BookmarkButton";
import { useLikes } from "@/hooks/useLikes";
import { cn } from "@/lib/utils";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(15);
  const { toggleLike, isArticleLiked } = useLikes();

  const handleToggleLike = (e: React.MouseEvent, article: Article) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(article);
  };

  // Update searchQuery when URL param changes
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
      if (!recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
      }
    }
  }, [searchParams]);

  const categories = NAV_CATEGORIES.map(c => c.name);

  // Fetch articles on mount
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      const articles = await articleService.getPublishedArticles();
      setAllArticles(articles);
      
      // Get all unique tags
      const tags = Array.from(new Set(articles.flatMap((a: any) => a.tags || []))).slice(0, 15) as string[];
      setAllTags(tags);
      setIsLoading(false);
    };
    fetchArticles();
  }, []);

  // Popular searches
  const popularSearches = ["AI", "Machine Learning", "Electric Vehicles", "Quantum Computing", "5G", "Blockchain"];

  // Filter and sort articles
  useEffect(() => {
    let filtered = [...allArticles];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(article =>
        selectedCategories.includes(article.category) || 
        selectedCategories.some(cat => article.category.includes(cat)) // Handle "Category • Sub" format
      );
    }

    // Tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(article =>
        article.tags?.some((tag: string) => selectedTags.includes(tag))
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
        filtered.sort((a, b) => parseInt(a.readTime || "0") - parseInt(b.readTime || "0"));
        break;
      default:
        // Relevance (keep current order)
        break;
    }

    setFilteredArticles(filtered);
    setVisibleCount(15); // Reset visible count when filters change
  }, [searchQuery, selectedCategories, selectedTags, sortBy, allArticles]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Update URL without reloading
    setSearchParams(query ? { q: query } : {}, { replace: true });
    
    if (query && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSearchParams({});
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
      <SEO 
        title={searchQuery ? `Search: ${searchQuery}` : "Search Articles"}
        description={`Search for the latest tech news, reviews and articles on TECH Theory.`}
        keywords="tech search, article search, technology reviews"
      />
      <Navbar />
      
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="mb-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Search Articles</h1>
            
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search articles, topics, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 h-12 text-lg"
              />
            </div>

            {/* Popular Searches */}
            {!searchQuery && (
              <div className="mb-4">
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
              <div className="sticky top-20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>

                <div className={`space-y-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                  {/* Sort By */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">Sort By</h3>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full">
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
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">Categories</h3>
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                          />
                          <label htmlFor={category} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "secondary"}
                          className="cursor-pointer hover:bg-primary/90"
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
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex flex-col gap-3">
                      <div className="aspect-video bg-muted animate-pulse rounded-xl" />
                      <div className="space-y-2 px-1">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-6 w-full bg-muted animate-pulse rounded" />
                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Results Header */}
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <p className="text-muted-foreground font-medium">
                  {filteredArticles.length} result{filteredArticles.length !== 1 ? 's' : ''}
                </p>
                
                <div className="flex items-center gap-4">
                  {/* View Toggle */}
                  <div className="flex items-center border rounded-md p-1 bg-muted/20">
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setViewMode('list')}
                      title="List View"
                    >
                      <LayoutList className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setViewMode('grid')}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Active Filters (Mobile/Tablet or extra context) */}
              {(selectedCategories.length > 0 || selectedTags.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedCategories.map((category) => (
                    <Badge key={category} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      {category}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                        onClick={() => toggleCategory(category)}
                      />
                    </Badge>
                  ))}
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      <Tag className="w-3 h-3" />
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                        onClick={() => toggleTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}

              {/* Results Grid */}
              {filteredArticles.length > 0 ? (
                <>
                  <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-8"}>
                    {filteredArticles.slice(0, visibleCount).map((article) => (
                      <article key={article.id} className="group cursor-pointer h-full">
                        <Link to={`/article/${article.id}`} className="block h-full">
                          {viewMode === 'grid' ? (
                            // 3-Column Overlay Design for Grid View
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                              {/* Image Background */}
                              <img
                                src={article.image}
                                alt={article.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              
                              {/* Gradient Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                              
                              {/* Content Overlay */}
                              <div className="absolute bottom-0 left-0 w-full p-4 md:p-5">
                                <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md line-clamp-3">
                                  {article.title}
                                </h3>
                              </div>

                              {/* Hover Actions (Optional, but good for UX) */}
                              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                          ) : (
                            // Original List View Design
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                              {/* Image Section */}
                              <div className="w-full md:w-[320px] flex-shrink-0 relative overflow-hidden rounded-lg">
                                <div className="aspect-video relative">
                                  <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover bg-muted transition-transform duration-500 group-hover:scale-105"
                                  />
                                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                                
                                <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                                  <div className="flex items-center space-x-4">
                                    <span className="font-medium text-foreground">By {article.author}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                       {article.readTime}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {article.tags?.slice(0, 3).map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-[10px] h-5 px-1.5">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Link>
                      </article>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {visibleCount < filteredArticles.length && (
                    <div className="mt-12 flex justify-center">
                      <Button 
                        onClick={() => setVisibleCount(prev => prev + 9)}
                        variant="outline"
                        size="lg"
                        className="min-w-[200px] border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
                      >
                        Load More Posts
                      </Button>
                    </div>
                  )}
                </>
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
              </>
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
