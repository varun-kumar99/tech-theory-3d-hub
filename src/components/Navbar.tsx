import { useState } from "react";
import { ChevronDown, Search, Moon, Sun, User, LogOut, Settings, BookmarkIcon, Menu, X } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [logoError, setLogoError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const { user, logout } = useAuth();
  const { bookmarks } = useBookmarks();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: "Home", href: "/", active: true },
    { name: "Reviews", href: "#" },
    { name: "Opinions", href: "#" },
    {
      name: "Tech",
      href: "#",
      dropdown: ["Android", "Apple", "Hardware", "AI"]
    },
    {
      name: "Automobile",
      href: "#",
      dropdown: ["Bikes", "Cars", "EV"]
    },
    {
      name: "Entertainment",
      href: "#",
      dropdown: ["Games", "Movies", "Marvel", "DC", "Netflix", "Amazon Prime", "Hotstar"]
    },
    {
      name: "More",
      href: "#",
      dropdown: ["About", "Contact", "Newsletter"]
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
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
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
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
                          <a
                            key={subIndex}
                            href="#"
                            className="block px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                          >
                            {subItem}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* Search Button - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => navigate('/search')}
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
                    <Link to="/bookmarks" className="flex items-center justify-between">
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
                    <Link to="/profile" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth">
                  <Button variant="outline" className="text-sm font-medium border-2 border-gray-300/30 hover:border-gray-400/50 hover:bg-gray-50 transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-md">
          <div className="flex flex-col h-full">
            {/* Mobile Search */}
            <div className="p-6 border-b border-border">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4"
                />
              </form>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 overflow-y-auto">
              <div className="py-2">
                {navItems.map((item, index) => (
                  <div key={index} className="border-b border-border/50">
                    {item.href.startsWith('/') ? (
                      <Link
                        to={item.href}
                        className={`flex items-center justify-between px-6 py-4 text-lg font-medium ${
                          item.active ? "text-primary bg-primary/10" : "text-foreground"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span>{item.name}</span>
                        {item.dropdown && (
                          <ChevronDown 
                            className={`w-5 h-5 transition-transform ${
                              activeDropdown === item.name ? 'rotate-180' : ''
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveDropdown(activeDropdown === item.name ? null : item.name);
                            }}
                          />
                        )}
                      </Link>
                    ) : (
                      <button
                        className={`w-full flex items-center justify-between px-6 py-4 text-lg font-medium text-left ${
                          item.active ? "text-primary bg-primary/10" : "text-foreground"
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
                          <a
                            key={subIndex}
                            href="#"
                            className="block px-12 py-3 text-base text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {subItem}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </nav>

            {/* Mobile User Section */}
            <div className="border-t border-border p-6">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/profile">Profile</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/bookmarks">Bookmarks</Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      Log out
                    </Button>
                  </div>
                </div>
              ) : (
                <Link to="/auth">
                  <Button className="w-full">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;