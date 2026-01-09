import { useState, useEffect } from "react";
import { User, Settings, BookmarkIcon, History, Bell, Shield, Eye, Heart, Calendar, Download, ImageIcon, ArrowRight, Check, ThumbsUp, Upload, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { articleService } from "@/services/articleService";
import { toast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["overview", "bookmarks", "history", "settings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
    firstName: user?.name?.split(' ')[0] || "",
    lastName: user?.name?.split(' ').slice(1).join(' ') || "",
  });

  const PRESET_AVATARS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Christopher",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Mason",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Tyler",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Batman",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Wolverine",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Harry",
  ];

  const [readingStats, setReadingStats] = useState({
    articlesRead: 0,
    totalReadTime: "0 min",
    likedArticles: 0
  });

  const [bookmarkedArticles, setBookmarkedArticles] = useState<any[]>([]);
  const [readingHistory, setReadingHistory] = useState<any[]>([]);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        if (user) {
          setFormData({
            name: user.name || "",
            email: user.email || "",
            avatar: user.avatar || "",
            firstName: user.name?.split(' ')[0] || "",
            lastName: user.name?.split(' ').slice(1).join(' ') || "",
          });
    
          // Process Bookmarks
          // Ensure user.bookmarks is defined and is an array
          const bookmarkIds = Array.isArray(user.bookmarks) ? user.bookmarks : [];
          const bookmarks = await Promise.all(bookmarkIds.map(async (id) => {
            try {
              // If we have an async getter, use it, otherwise use the sync one
              // Assuming articleService.getArticleById is async if it fetches from DB
              const article = await articleService.getArticleById(id);
              return article ? {
                id: article.id,
                title: article.title,
                category: article.category.split(' • ')[0],
                date: article.date,
                readTime: article.readTime?.replace(' read', '') || '5 min',
                image: article.image
              } : null;
            } catch (e) {
              console.error(`Error fetching article ${id}:`, e);
              return null;
            }
          }));
          setBookmarkedArticles(bookmarks.filter(Boolean));
    
          // Process History
          // Ensure user.readingHistory is defined and is an array
          const historyIds = Array.isArray(user.readingHistory) ? user.readingHistory : [];
          const history = await Promise.all(historyIds.map(async (id) => {
            try {
              const article = await articleService.getArticleById(id);
              return article ? {
                id: article.id,
                title: article.title,
                category: article.category.split(' • ')[0],
                date: article.date,
                readTime: article.readTime?.replace(' read', '') || '5 min',
                progress: 100 // Assume read articles are 100% complete
              } : null;
            } catch (e) {
              console.error(`Error fetching history article ${id}:`, e);
              return null;
            }
          }));
          setReadingHistory(history.filter(Boolean));
    
          // Calculate Stats
          const validHistory = history.filter(Boolean);
          const totalMinutes = validHistory.reduce((acc, item) => {
            const minutes = parseInt(item?.readTime || "0");
            return acc + (isNaN(minutes) ? 0 : minutes);
          }, 0);

          // Get Liked Articles Count from Local Storage
          let likedCount = 0;
          try {
            const likedArticles = JSON.parse(localStorage.getItem('liked_articles') || '[]');
            likedCount = Array.isArray(likedArticles) ? likedArticles.length : 0;
          } catch (e) {
            console.error("Error parsing liked articles:", e);
          }
    
          setReadingStats({
            articlesRead: validHistory.length,
            totalReadTime: totalMinutes < 60 ? `${totalMinutes} min` : `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
            likedArticles: likedCount
          });
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };

    loadProfileData();
  }, [user]);

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (1MB = 1024 * 1024 bytes)
      if (file.size > 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 1MB",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData({ ...formData, avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (user) {
      const updatedUser = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        avatar: formData.avatar,
      };
      
      // Update global user state (which handles persistence)
      updateUser(updatedUser);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    }
  };

  const handlePreferenceChange = (key: string, value: string | boolean) => {
    if (user) {
      updateUser({
        preferences: {
          ...user.preferences,
          [key]: value
        }
      });
    }
  };

  const handleRemoveBookmark = (articleId: string | number) => {
    if (!user) return;

    // 1. Update local state
    setBookmarkedArticles(prev => prev.filter(a => String(a.id) !== String(articleId)));

    // 2. Update user context
    // Ensure user.bookmarks is an array
    const currentBookmarks = Array.isArray(user.bookmarks) ? user.bookmarks : [];
    const updatedBookmarks = currentBookmarks.filter(id => String(id) !== String(articleId));
    
    updateUser({
      ...user,
      bookmarks: updatedBookmarks
    });

    toast({
      title: "Bookmark Removed",
      description: "Article removed from your bookmarks."
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Please Sign In</CardTitle>
            <CardDescription>
              You need to be signed in to view your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/auth">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Profile Header */}
          <div className="mb-8">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="pt-6 px-0">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                    <AvatarImage src={formData.avatar || user.avatar} alt={user.name} className="object-cover" />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <BookmarkIcon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{user.bookmarks.length} Bookmarks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{user.readingHistory.length} Articles Read</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                      className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
            <TabsList className="bg-muted/50 p-1 rounded-lg w-full md:w-auto grid grid-cols-4 md:inline-flex">
              <TabsTrigger value="overview" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
              <TabsTrigger value="bookmarks" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Bookmarks</TabsTrigger>
              <TabsTrigger value="history" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">History</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-500">
              {/* Reading Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Articles Read</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{readingStats.articlesRead}</div>
                    <p className="text-xs text-muted-foreground">
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Reading Time</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{readingStats.totalReadTime}</div>
                    <p className="text-xs text-muted-foreground">
                      This month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Liked Articles</CardTitle>
                    <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{readingStats.likedArticles}</div>
                    <p className="text-xs text-muted-foreground">
                      Articles you've liked
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bookmarks</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user.bookmarks.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Saved articles
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest reading activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {readingHistory.slice(0, 3).map((article) => (
                      <div key={article.id} className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{article.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {article.category} • {article.date}
                          </p>
                        </div>
                        <Badge variant={article.progress === 100 ? "default" : "secondary"}>
                          {article.progress}% read
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookmarks" className="space-y-6 animate-in fade-in-50 duration-500">
              <Card className="bg-transparent border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Bookmarked Articles</CardTitle>
                      <CardDescription>
                        Articles you've saved for later
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{bookmarkedArticles.length} results</span>
                      <div className="flex items-center bg-secondary/50 rounded-lg p-1 border border-border/50">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewMode("list")}
                          className={`h-8 w-8 rounded-md ${viewMode === "list" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                        >
                          <List className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewMode("grid")}
                          className={`h-8 w-8 rounded-md ${viewMode === "grid" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-0">
                  {viewMode === "list" ? (
                    <div className="space-y-4">
                      {bookmarkedArticles.map((article) => (
                        <div key={article.id} className="flex items-center justify-between p-4 bg-secondary/20 border border-border/50 rounded-full hover:bg-secondary/40 transition-colors group">
                          <div className="flex-1 px-2">
                            <Link to={`/article/${article.id}`}>
                              <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{article.title}</h4>
                            </Link>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <span className="font-medium text-primary/80">{article.category}</span>
                              <span>•</span>
                              <span>{article.date}</span>
                              <span>•</span>
                              <span>{article.readTime} read</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pr-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-blue-500 hover:text-blue-600 rounded-full"
                              onClick={() => handleRemoveBookmark(article.id)}
                            >
                              <BookmarkIcon className="w-5 h-5 fill-current" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {bookmarkedArticles.map((article) => (
                        <Link key={article.id} to={`/article/${article.id}`} className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-secondary/20">
                          <img 
                            src={article.image} 
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/70">
                               <Heart className="w-4 h-4" />
                             </div>
                             <div className="bg-black/50 backdrop-blur-sm p-2 rounded-full text-blue-500 hover:bg-black/70">
                               <BookmarkIcon className="w-4 h-4 fill-current" />
                             </div>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h4 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-md">
                              {article.title}
                            </h4>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6 animate-in fade-in-50 duration-500">
              <Card>
                <CardHeader>
                  <CardTitle>Reading History</CardTitle>
                  <CardDescription>
                    Track your reading progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {readingHistory.map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <Link to={`/article/${article.id}`}>
                            <h4 className="font-medium hover:text-primary transition-colors">{article.title}</h4>
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            {article.category} • {article.date} • {article.readTime} read
                          </p>
                          <div className="mt-3 w-full max-w-xs">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                                  style={{ width: `${article.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-muted-foreground">{article.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-8 animate-in fade-in-50 duration-500">
              
              {/* Public Information Section */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Public Information
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2 max-w-3xl leading-relaxed">
                    Customize how you appear on the website by setting a public display name and images. 
                    You can choose preset images to personalize.
                  </p>
                </div>

                <div className="space-y-2 max-w-sm">
                  <Label htmlFor="displayName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Display Name</Label>
                  <div className="relative">
                    <Input
                      id="displayName"
                      value={formData.firstName} // Using firstName as display name for now to match UI request
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="bg-secondary/50 border-transparent focus:border-primary h-11 text-base pt-4 pb-1"
                    />
                    <div className="absolute top-1 left-3 text-[10px] text-muted-foreground font-medium pointer-events-none">Display Name</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base font-bold text-foreground">Display Image</h3>
                    <p className="text-sm text-muted-foreground">Upload a custom image or choose from our collection</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex gap-3 flex-wrap items-center">
                      <div className="relative">
                        <Input
                          type="file"
                          id="avatar-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleProfileImageUpload}
                        />
                        <Label
                          htmlFor="avatar-upload"
                          className="flex flex-col items-center justify-center w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/50 hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                          title="Upload custom avatar"
                        >
                          <Upload className="w-5 h-5 text-muted-foreground" />
                        </Label>
                      </div>

                      <div className="w-px h-8 bg-border mx-1" />

                      {PRESET_AVATARS.map((avatar, index) => (
                        <button
                          key={index}
                          onClick={() => setFormData({ ...formData, avatar })}
                          className={`relative rounded-full transition-all group ${
                            formData.avatar === avatar 
                              ? "ring-2 ring-yellow-500 ring-offset-2 ring-offset-background scale-110" 
                              : "hover:scale-110 hover:opacity-90 opacity-70"
                          }`}
                        >
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                            <AvatarFallback>{index + 1}</AvatarFallback>
                          </Avatar>
                          {formData.avatar === avatar && (
                            <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black rounded-full p-0.5 border-2 border-background">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border/50 w-full" />

                {/* Personal Information Section */}
                <div className="space-y-6">
                   <div>
                    <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
                    <p className="text-sm text-muted-foreground mt-2 max-w-3xl leading-relaxed">
                      Manage your personal data. To learn more about our privacy practices, please review our <a href="#" className="text-yellow-500 hover:underline">Privacy Policy</a>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="bg-secondary/50 border-transparent focus:border-primary h-12 pt-5 text-base"
                        />
                        <div className="absolute top-2 left-3 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">First Name</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="relative">
                         <Input
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Last Name"
                          className="bg-secondary/50 border-transparent focus:border-primary h-12 pt-5 text-base placeholder:text-muted-foreground/50"
                        />
                        <div className="absolute top-2 left-3 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Last Name</div>
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <div className="relative">
                        <Input
                          value={formData.email}
                          readOnly
                          className="bg-secondary/30 border-transparent focus:border-primary h-12 pt-5 text-base text-muted-foreground cursor-not-allowed"
                        />
                         <div className="absolute top-2 left-3 text-[10px] uppercase tracking-wider text-muted-foreground font-bold pointer-events-none">Email</div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border/50 w-full max-w-2xl" />

                   <div className="space-y-4 max-w-2xl">
                      <h3 className="text-base font-bold text-foreground">Theme Preference</h3>
                       <div className="flex items-center justify-between bg-secondary/30 p-4 rounded-lg border border-border/50">
                        <div className="space-y-0.5">
                          <Label className="text-base">Theme</Label>
                          <p className="text-sm text-muted-foreground">
                            Choose your preferred theme
                          </p>
                        </div>
                        <Select
                          value={user.preferences.theme}
                          onValueChange={(value) => handlePreferenceChange('theme', value)}
                        >
                          <SelectTrigger className="w-32 bg-background border-input">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                   </div>
                </div>

              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-8">
                <Button 
                  onClick={handleSaveProfile}
                  className="bg-white text-black hover:bg-gray-200 font-bold h-12 px-8 rounded-lg flex items-center gap-2 text-base transition-transform hover:translate-x-1"
                >
                  Save Changes
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>

            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;
