import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  TrendingUp, 
  Users, 
  FileText, 
  Star, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff,
  LogOut,
  Settings,
  Shield,
  PlusCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { userService, User } from "@/services/userService";

import { articleService, Article } from "@/services/articleService";

import { useAuth } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user: authUser, logout, isLoading: authLoading, isUserFullyLoaded } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // User Management State
  const [users, setUsers] = useState<User[]>([]);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'author',
    status: 'active',
    password: ''
  });
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (authLoading || !isUserFullyLoaded) {
      // Still loading authentication state or user data, do nothing yet
      return;
    }

    const loadData = async () => {
      // Load users
      setUsers(await userService.getAllUsers());
      
      // Load articles
      setArticles(await articleService.getAllArticles());
    };

    const checkAuthFunction = () => {
      // 1. Check Supabase Auth
      if (authUser) {
        // You might want to check for admin role here if you have roles in Supabase
        return true;
      }

      // 2. Fallback to legacy Admin Auth
      const auth = localStorage.getItem("admin-auth");
      if (!auth) {
        navigate("/admin");
        return false;
      }
      
      const authData = JSON.parse(auth);
      if (authData.role !== "admin") {
        navigate("/admin");
        return false;
      }
      
      return true;
    };
    
    if (checkAuthFunction()) {
      loadData();
    }
  }, [navigate, authUser, authLoading, isUserFullyLoaded]);

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Success",
      description: "Logged out successfully"
    });
    navigate("/admin");
  };

  const updateArticleStatus = async (id: string | number, status: Article['status']) => {
    const article = articles.find(a => String(a.id) === String(id));
    if (article) {
      try {
        const updatedArticle = { ...article, status };
        await articleService.saveArticle(updatedArticle);
        const allArticles = await articleService.getAllArticles();
        setArticles(allArticles);
        toast({
          title: "Success",
          description: `Article status updated to ${status}`
        });
      } catch (error) {
        console.error("Failed to update article status:", error);
        toast({
          title: "Error",
          description: "Failed to update article status. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const updateArticleTrending = async (id: string | number, isTrending: boolean) => {
    const article = articles.find(a => String(a.id) === String(id));
    if (article) {
      try {
        const updatedArticle = { ...article, isTrending };
        await articleService.saveArticle(updatedArticle);
        
        // Refresh local state
        const allArticles = await articleService.getAllArticles();
        setArticles(allArticles);
        
        // Verify the update
        const verifiedArticle = allArticles.find(a => String(a.id) === String(id));
        if (verifiedArticle?.isTrending === isTrending) {
          toast({
            title: "Success",
            description: `Article ${isTrending ? 'added to' : 'removed from'} trending`
          });
        } else {
          throw new Error("Update not reflected in fetched data");
        }
      } catch (error) {
        console.error("Failed to update trending status:", error);
        toast({
          title: "Error",
          description: "Failed to update trending status. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const updateArticlePriority = async (id: string | number, priority: Article['priority']) => {
    const article = articles.find(a => String(a.id) === String(id));
    if (article) {
      try {
        const updatedArticle = { ...article, priority };
        await articleService.saveArticle(updatedArticle);
        
        // Refresh local state
        const allArticles = await articleService.getAllArticles();
        setArticles(allArticles);

        // Verify the update
        const verifiedArticle = allArticles.find(a => String(a.id) === String(id));
        if (verifiedArticle?.priority === priority) {
          toast({
            title: "Success",
            description: `Article priority updated to ${priority}`
          });
        } else {
          throw new Error("Update not reflected in fetched data");
        }
      } catch (error) {
        console.error("Failed to update article priority:", error);
        toast({
          title: "Error",
          description: "Failed to update article priority. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const deleteArticle = async (id: string | number) => {
    await articleService.deleteArticle(id);
    const allArticles = await articleService.getAllArticles();
    setArticles(allArticles);
    toast({
      title: "Success",
      description: "Article deleted successfully"
    });
  };

  const getStatusColor = (status: Article['status']) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Article['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalArticles: articles.length,
    publishedArticles: articles.filter(a => a.status === 'published').length,
    draftArticles: articles.filter(a => a.status === 'draft').length,
    totalViews: articles.reduce((sum, article) => sum + article.views, 0),
    trendingArticles: articles.filter(a => a.isTrending).length
  };

  const handleSaveUser = async () => {
    if (isEditingUser && currentUser.id) {
      await userService.updateUser(currentUser as User);
      toast({ title: "Success", description: "User updated successfully" });
    } else {
      if (!currentUser.name || !currentUser.email || !currentUser.password) {
        toast({ variant: "destructive", title: "Error", description: "Name, Email and Password are required" });
        return;
      }
      await userService.addUser(currentUser as Omit<User, 'id' | 'joinedDate'>);
      toast({ title: "Success", description: "User added successfully" });
    }
    setUsers(await userService.getAllUsers());
    setIsUserDialogOpen(false);
    resetUserForm();
  };

  const handleDeleteUser = async (id: string) => {
    await userService.deleteUser(id);
    setUsers(await userService.getAllUsers());
    toast({ title: "Success", description: "User deleted successfully" });
  };

  const openAddUserDialog = () => {
    setIsEditingUser(false);
    resetUserForm();
    setIsUserDialogOpen(true);
  };

  const openEditUserDialog = (user: User) => {
    setIsEditingUser(true);
    setCurrentUser(user);
    setIsUserDialogOpen(true);
  };

  const resetUserForm = () => {
    setShowPassword(false);
    setCurrentUser({
      name: '',
      email: '',
      role: 'author',
      status: 'active',
      password: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your content and users</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/credentials')}>
                <Shield className="w-4 h-4 mr-2" />
                <span className="whitespace-nowrap">Credentials</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span className="whitespace-nowrap">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalArticles}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.publishedArticles} published
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +12.5% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Trending Articles</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.trendingArticles}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently trending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Draft Articles</CardTitle>
                  <Edit3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.draftArticles}</div>
                  <p className="text-xs text-muted-foreground">
                    Pending review
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Articles */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Articles</CardTitle>
                <CardDescription>Latest articles from your authors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...articles]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 3)
                    .map((article) => (
                    <div key={article.id} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{article.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          by {article.author} • {article.views.toLocaleString()} views
                        </p>
                      </div>
                      <Badge className={getStatusColor(article.status)}>
                        {article.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="articles" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Article Management</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage all articles, trending status, and priorities</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => navigate('/admin/create-article')}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Article
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0 border-none bg-transparent">
                {/* Desktop View: Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Trending</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {articles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium">{article.title}</TableCell>
                          <TableCell>{article.author}</TableCell>
                          <TableCell>
                            <Select
                              value={article.status}
                              onValueChange={(value: Article['status']) => 
                                updateArticleStatus(article.id, value)
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{article.category}</TableCell>
                          <TableCell>{article.views.toLocaleString()}</TableCell>
                          <TableCell>
                            <Button
                              variant={article.isTrending ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateArticleTrending(article.id, !article.isTrending)}
                            >
                              <Star className="w-3 h-3 mr-1" />
                              {article.isTrending ? "Trending" : "Set Trending"}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={article.priority || 'medium'}
                              onValueChange={(value: Article['priority']) => 
                                updateArticlePriority(article.id, value)
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/article/${article.id}`)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/edit-article/${article.id}`)}>
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the article.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteArticle(article.id)} className="bg-red-600 hover:bg-red-700">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile/Tablet View: Image-focused grid cards */}
                <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                  {articles.map((article) => (
                    <div key={article.id} className="group flex flex-col">
                      {/* Image-focused card */}
                      <div 
                        className="relative aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 cursor-pointer"
                        onClick={() => navigate(`/admin/edit-article/${article.id}`)}
                      >
                        <img 
                          src={article.image || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop"} 
                          alt={article.title} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Gradient Overlay for Title */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4">
                          <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 mb-2">
                            {article.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-300 text-xs">
                            <span className="font-medium text-blue-400">{article.author}</span>
                            <span>•</span>
                            <span>{article.category}</span>
                            <span>•</span>
                            <span>{article.views.toLocaleString()} views</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar below image */}
                      <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
                        {/* Status and Priority Controls */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 px-1">Status</span>
                            <Select
                              value={article.status}
                              onValueChange={(value: Article['status']) => updateArticleStatus(article.id, value)}
                            >
                              <SelectTrigger className={`h-8 text-xs ${getStatusColor(article.status)} border-none`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400 px-1">Priority</span>
                            <Select
                              value={article.priority || 'medium'}
                              onValueChange={(value: Article['priority']) => updateArticlePriority(article.id, value)}
                            >
                              <SelectTrigger className={`h-8 text-xs ${getPriorityColor(article.priority || 'medium')} border-none`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Bottom Icons Row */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-700">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 px-2 text-xs ${article.isTrending ? 'text-yellow-600 bg-yellow-50' : 'text-gray-400'}`}
                            onClick={() => updateArticleTrending(article.id, !article.isTrending)}
                          >
                            <Star className={`w-4 h-4 mr-1 ${article.isTrending ? 'fill-yellow-600' : ''}`} />
                            {article.isTrending ? 'Trending' : 'Set Trending'}
                          </Button>
                          
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-500"
                              onClick={() => navigate(`/article/${article.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-500"
                              onClick={() => navigate(`/admin/edit-article/${article.id}`)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteArticle(article.id)} className="bg-red-600">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">User Management</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage authors and their permissions</p>
              </div>
              <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddUserDialog}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{isEditingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogDescription>
                      {isEditingUser ? 'Update user details and permissions.' : 'Create a new user account with specific permissions.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={currentUser.name}
                        onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={currentUser.email}
                        onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                    {!isEditingUser && (
                      <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={currentUser.password}
                            onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                            placeholder="••••••••"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={currentUser.role}
                          onValueChange={(value: any) => setCurrentUser({ ...currentUser, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="author">Author</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={currentUser.status}
                          onValueChange={(value: any) => setCurrentUser({ ...currentUser, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveUser}>{isEditingUser ? 'Update User' : 'Create User'}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {user.name.charAt(0)}
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'outline' : 'destructive'} className={user.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.joinedDate}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => openEditUserDialog(user)}>
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the user account.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-red-600 hover:bg-red-700">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
