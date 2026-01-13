import { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, Moon, Sun, User, LogOut, Settings, BookmarkIcon, Menu, X, Facebook, XIcon, Instagram, Youtube, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link, useNavigate } from "react-router-dom";
import { articleService, Article } from "@/services/articleService";
import { AuthDialog } from "./AuthDialog";

import { useToast } from "@/components/ui/use-toast";

const Navbar = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Article[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const [logoError, setLogoError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const { user, logout } = useAuth();
  const { bookmarks } = useBookmarks();
  const navigate = useNavigate();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      const articles = await articleService.getPublishedArticles();
      setAllArticles(articles);
    };
    fetchArticles();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      const filtered = allArticles.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (articleId: string | number) => {
    navigate(`/article/${articleId}`);
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/', { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: clear local storage and reload
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const navItems = [
    { name: "Home", href: "/", active: true },
    { name: "Opinions", href: "/category/opinions" },
    {
      name: "Tech",
      href: "/category/tech",
      dropdown: [
        { name: "Android", href: "/category/android" },
        { name: "Apple", href: "/category/apple" },
        { name: "Hardware", href: "/category/hardware" },
        { name: "AI", href: "/category/ai" }
      ]
    },
    {
      name: "Automobile",
      href: "/category/automobile",
      dropdown: [
        { name: "Bikes", href: "/category/bikes" },
        { name: "Cars", href: "/category/cars" },
        { name: "EV", href: "/category/ev" }
      ]
    },
    {
      name: "Entertainment",
      href: "/category/entertainment",
      dropdown: [
        { name: "Games", href: "/category/games" },
        { name: "Movies", href: "/category/movies" },
        { name: "Marvel", href: "/category/marvel" },
        { name: "DC", href: "/category/dc" },
        { name: "Netflix", href: "/category/netflix" },
        { name: "Amazon Prime", href: "/category/amazon-prime" },
        { name: "Hotstar", href: "/category/hotstar" },
        { name: "Anime", href: "/category/anime" }
      ]
    },
    {
      name: "More",
      href: "#",
      dropdown: [
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" }
      ]
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="px-4 md:px-6">
        <div className="flex items-center justify-between h-16 relative">
          {/* Mobile Menu Toggle - Left */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden z-10"
                onClick={() => setIsMobileSearchOpen(false)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[300px] border-r border-border">
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-border">
                  <SheetTitle className="text-left">
                    <Link 
                      to="/" 
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {!logoError ? (
                        <img 
                          src="/logo.png" 
                          alt="Tech Theory" 
                          className="h-10 w-auto cursor-pointer object-contain dark:invert"
                          onError={() => setLogoError(true)}
                        />
                      ) : (
                        <h1 className="tech-logo text-3xl cursor-pointer">TECH Theory</h1>
                      )}
                  </Link>
                </SheetTitle>
              </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 overflow-y-auto">
                  {/* User Profile in Mobile Menu */}
                  {user ? (
                    <div className="px-6 py-6 border-b border-border bg-secondary/20">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{user.name}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" asChild onClick={() => setIsMobileMenuOpen(false)}>
                          <Link to="/profile"><User className="w-4 h-4 mr-2" /> Profile</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                          <LogOut className="w-4 h-4 mr-2" /> Logout
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-6 py-6 border-b border-border">
                      <Button className="w-full" onClick={() => { setIsAuthDialogOpen(true); setIsMobileMenuOpen(false); }}>
                        Sign In
                      </Button>
                    </div>
                  )}

                  <div className="py-2">
                    {navItems.map((item, index) => (
                      <div key={index} className="border-b border-border/50">
                        {item.href.startsWith('/') ? (
                          <div className="flex items-center justify-between px-6 py-4">
                            <Link
                              to={item.href}
                              className={`flex-1 text-lg font-medium text-wrap ${
                                item.active ? "text-primary" : "text-foreground"
                              }`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <span>{item.name}</span>
                            </Link>
                            {item.dropdown && (
                              <ChevronDown 
                                className={`w-5 h-5 transition-transform cursor-pointer ${
                                  activeDropdown === item.name ? 'rotate-180' : ''
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setActiveDropdown(activeDropdown === item.name ? null : item.name);
                                }}
                              />
                            )}
                          </div>
                        ) : (
                          <button
                            className={`w-full flex items-center justify-between px-6 py-4 text-lg font-medium text-left text-wrap ${
                              item.active ? "text-primary" : "text-foreground"
                            }`}
                            onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                          >
                            <span>{item.name}</span>
                            {item.dropdown && (
                              <ChevronDown 
                                className={`w-5 h-5 transition-transform ${
                                  activeDropdown === item.name ? 'rotate-180' : ''
                                }`}
                              />
                            )}
                          </button>
                        )}

                        {/* Mobile Dropdown */}
                        {item.dropdown && activeDropdown === item.name && (
                          <div className="bg-secondary/30">
                            {item.dropdown.map((subItem, subIndex) => (
                              subItem.href.startsWith('/') ? (
                                <Link
                                  key={subIndex}
                                  to={subItem.href}
                                  className="block px-12 py-3 text-base text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors text-wrap"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {subItem.name}
                                </Link>
                              ) : (
                                <a
                                  key={subIndex}
                                  href={subItem.href}
                                  className="block px-12 py-3 text-base text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {subItem.name}
                                </a>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </nav>

                {/* Social Media Icons - Moved to bottom */}
                <div className="flex justify-center gap-6 py-6 border-t border-border mt-auto">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <XIcon className="w-6 h-6" />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Youtube className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo - Centered on mobile, Left on desktop */}
          <div className="flex items-center absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:left-auto">
            <Link 
              to="/" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              {!logoError ? (
                <img 
                  src="/logo.png" 
                  alt="Tech Theory" 
                  className="h-10 w-auto cursor-pointer object-contain max-w-none dark:invert"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <h1 className="tech-logo text-3xl cursor-pointer">TECH Theory</h1>
              )}
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => { if (searchQuery.trim()) setShowSuggestions(true); }}
                className="pl-10 pr-4"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    {suggestions.map(article => (
                        <div 
                            key={article.id}
                            className="p-3 hover:bg-secondary/50 cursor-pointer flex items-center gap-3 transition-colors border-b border-border/50 last:border-0"
                            onClick={() => handleSuggestionClick(article.id)}
                        >
                            {article.image && (
                                <img src={article.image} alt={article.title} className="w-10 h-10 object-cover rounded" />
                            )}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium truncate text-foreground">{article.title}</h4>
                                <p className="text-xs text-muted-foreground truncate">{article.category}</p>
                            </div>
                        </div>
                    ))}
                </div>
              )}
            </form>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item, index) => (
              <div
                key={index}
                className="relative group"
              >
                {item.href.startsWith('/') ? (
                  <Link
                    to={item.href}
                    className={`nav-link flex items-center space-x-1 font-medium text-sm ${
                      item.active ? "text-primary active" : "text-foreground"
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.dropdown && <ChevronDown className="w-4 h-4" />}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className={`nav-link flex items-center space-x-1 font-medium text-sm ${
                      item.active ? "text-primary active" : "text-foreground"
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.dropdown && <ChevronDown className="w-4 h-4" />}
                  </a>
                )}

                {/* Dropdown */}
                {item.dropdown && (
                  <div className="absolute top-full left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-card rounded-lg shadow-lg border border-border">
                      <div className="py-2">
                        {item.dropdown.map((subItem, subIndex) => (
                          subItem.href.startsWith('/') ? (
                            <Link
                              key={subIndex}
                              to={subItem.href}
                              className="block px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                            >
                              {subItem.name}
                            </Link>
                          ) : (
                            <a
                              key={subIndex}
                              href={subItem.href}
                              className="block px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                            >
                              {subItem.name}
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3 z-10">
            {/* Search Button - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => {
                setIsMobileSearchOpen(true);
                setIsMobileMenuOpen(false);
              }}
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* Mobile Menu Toggle - Hidden here, moved to left */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => {
                setIsMobileMenuOpen(true);
                setIsMobileSearchOpen(false);
              }}
            >
              <Menu className="w-5 h-5" />
            </Button> */}

            {/* Theme Toggle */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hidden md:flex">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile?tab=bookmarks" className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BookmarkIcon className="mr-2 h-4 w-4" />
                        Bookmarks
                      </div>
                      {bookmarks.length > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full ml-2">
                          {bookmarks.length}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile?tab=settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2 hidden md:flex">
                <Button
                  variant="outline"
                  className="text-sm font-medium border-2 border-gray-300/30 hover:border-gray-400/50 hover:bg-gray-50 transition-all duration-300"
                  onClick={() => setIsAuthDialogOpen(true)}
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthDialog 
        isOpen={isAuthDialogOpen} 
        onOpenChange={setIsAuthDialogOpen} 
      />

            {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="md:hidden fixed inset-0 top-0 z-50 bg-card flex items-center justify-between px-6 h-16 overflow-x-hidden">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Input
              type="text"
              placeholder="Type and hit enter..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e);
                  setIsMobileSearchOpen(false);
                }
              }}
              className="w-full bg-card text-foreground border-none focus-visible:ring-0 focus-visible:ring-offset-0 pl-0 pr-10"
            />
          </form>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSearchOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}


    </header>
  );
};

export default Navbar;