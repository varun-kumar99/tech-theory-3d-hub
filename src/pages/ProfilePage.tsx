import { useState, useEffect } from "react";
import { User, Settings, BookmarkIcon, History, Bell, Shield, Eye, Heart, TrendingUp, Calendar, Download } from "lucide-react";
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
import { Link, useNavigate } from "react-router-dom";
import { articleService } from "@/services/articleService";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
  });

  const MALE_AVATARS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Christopher",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Mason",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Tyler",
  ];

  const FEMALE_AVATARS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
  ];

  const [readingStats, setReadingStats] = useState({
    articlesRead: 0,
    totalReadTime: "0 min",
    streak: 0,
    favoriteCategories: [] as string[]
  });

  const [bookmarkedArticles, setBookmarkedArticles] = useState<any[]>([]);
  const [readingHistory, setReadingHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      // Process Bookmarks
      const bookmarks = user.bookmarks.map(id => {
        const article = articleService.getArticleById(id);
        return article ? {
          id: article.id,
          title: article.title,
          category: article.category.split(' • ')[0],
          date: article.date,
          readTime: article.readTime?.replace(' read', '') || '5 min'
        } : null;
      }).filter(Boolean);
      setBookmarkedArticles(bookmarks);

      // Process History
      const history = user.readingHistory.map(id => {
        const article = articleService.getArticleById(id);
        return article ? {
          id: article.id,
          title: article.title,
          category: article.category.split(' • ')[0],
          date: article.date,
          readTime: article.readTime?.replace(' read', '') || '5 min',
          progress: 100 // Assume read articles are 100% complete
        } : null;
      }).filter(Boolean);
      setReadingHistory(history);

      // Calculate Stats
      const totalMinutes = history.reduce((acc, item) => {
        const minutes = parseInt(item?.readTime || "0");
        return acc + (isNaN(minutes) ? 0 : minutes);
      }, 0);

      // Calculate favorite categories
      const categories: Record<string, number> = {};
      history.forEach(item => {
        if (item?.category) {
          categories[item.category] = (categories[item.category] || 0) + 1;
        }
      });
      const topCategories = Object.entries(categories)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([cat]) => cat);

      setReadingStats({
        articlesRead: history.length,
        totalReadTime: totalMinutes < 60 ? `${totalMinutes} min` : `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
        streak: 0, // Placeholder as we don't track dates yet
        favoriteCategories: topCategories
      });
    }
  }, [user]);

  const handleSaveProfile = () => {
    if (user) {
      const updatedUser = {
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar,
      };
      
      // Update global user state (which handles persistence)
      updateUser(updatedUser);
      
      // Force UI update by ensuring we're no longer editing
      setIsEditing(false);
      
      // Force refresh of formData to match new user state
      setFormData({
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
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
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Profile Header */}
          <div className="mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
                    <AvatarFallback className="text-2xl">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <BookmarkIcon className="w-4 h-4" />
                        <span className="text-sm">{user.bookmarks.length} Bookmarks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4" />
                        <span className="text-sm">{user.readingHistory.length} Articles Read</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">{readingStats.streak} Day Streak</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFormData({
                          name: user.name || "",
                          email: user.email || "",
                          avatar: user.avatar || "",
                        });
                        setIsEditing(true);
                        setActiveTab("settings");
                      }}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
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
                    <CardTitle className="text-sm font-medium">Streak</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{readingStats.streak} days</div>
                    <p className="text-xs text-muted-foreground">
                      Keep it up!
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

              {/* Favorite Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Categories</CardTitle>
                  <CardDescription>
                    Your most read topics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {readingStats.favoriteCategories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

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

            <TabsContent value="bookmarks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bookmarked Articles</CardTitle>
                  <CardDescription>
                    Articles you've saved for later
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookmarkedArticles.map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <Link to={`/article/${article.id}`}>
                            <h4 className="font-medium hover:text-primary">{article.title}</h4>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {article.category} • {article.date} • {article.readTime} read
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <BookmarkIcon className="w-4 h-4 fill-current" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
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
                      <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <Link to={`/article/${article.id}`}>
                            <h4 className="font-medium hover:text-primary">{article.title}</h4>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {article.category} • {article.date} • {article.readTime} read
                          </p>
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-secondary rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${article.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">{article.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-4">
                        <Label>Profile Picture</Label>
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar className="w-20 h-20">
                            <AvatarImage src={formData.avatar} alt={formData.name} className="object-cover" />
                            <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="text-sm text-muted-foreground">
                            Select an avatar from the list below
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs text-muted-foreground mb-2 block">Male Avatars</Label>
                            <div className="flex gap-3 flex-wrap">
                              {MALE_AVATARS.map((avatar, index) => (
                                <button
                                  key={index}
                                  onClick={() => setFormData({ ...formData, avatar })}
                                  className={`relative rounded-full p-1 transition-all ${
                                    formData.avatar === avatar 
                                      ? "ring-2 ring-primary ring-offset-2" 
                                      : "hover:ring-2 hover:ring-muted ring-offset-1"
                                  }`}
                                >
                                  <Avatar className="w-12 h-12">
                                    <AvatarImage src={avatar} alt={`Male Avatar ${index + 1}`} />
                                    <AvatarFallback>M{index + 1}</AvatarFallback>
                                  </Avatar>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground mb-2 block">Female Avatars</Label>
                            <div className="flex gap-3 flex-wrap">
                              {FEMALE_AVATARS.map((avatar, index) => (
                                <button
                                  key={index}
                                  onClick={() => setFormData({ ...formData, avatar })}
                                  className={`relative rounded-full p-1 transition-all ${
                                    formData.avatar === avatar 
                                      ? "ring-2 ring-primary ring-offset-2" 
                                      : "hover:ring-2 hover:ring-muted ring-offset-1"
                                  }`}
                                >
                                  <Avatar className="w-12 h-12">
                                    <AvatarImage src={avatar} alt={`Female Avatar ${index + 1}`} />
                                    <AvatarFallback>F{index + 1}</AvatarFallback>
                                  </Avatar>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile}>Save Changes</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label>Name</Label>
                        <p className="text-sm text-muted-foreground">{user.name}</p>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Customize your reading experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Theme</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred theme
                      </p>
                    </div>
                    <Select
                      value={user.preferences.theme}
                      onValueChange={(value) => handlePreferenceChange('theme', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates about new articles
                      </p>
                    </div>
                    <Switch
                      checked={user.preferences.emailNotifications}
                      onCheckedChange={(value) => handlePreferenceChange('emailNotifications', value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>
                    Manage your account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    <Shield className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Bell className="w-4 h-4 mr-2" />
                    Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;
