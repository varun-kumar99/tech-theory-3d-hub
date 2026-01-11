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
  PlusCircle,
  Upload
} from "lucide-react";
import Papa from "papaparse";
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


  const [isImporting, setIsImporting] = useState(false);

  const handleImportCSV = async () => {
    setIsImporting(true);
    
    // Get current user name for author field
    let currentAuthorName = 'Admin';
    if (authUser?.user_metadata?.full_name) {
        currentAuthorName = authUser.user_metadata.full_name;
    } else {
        const localAuth = localStorage.getItem("admin-auth");
        if (localAuth) {
            try {
                const parsed = JSON.parse(localAuth);
                if (parsed.user && parsed.user.name) {
                    currentAuthorName = parsed.user.name;
                }
            } catch (e) {
                console.error("Error parsing admin-auth", e);
            }
        }
    }

    try {
      const response = await fetch('/Article%20data.csv');
      if (!response.ok) throw new Error('Failed to fetch CSV file');
      
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          let successCount = 0;
          let failCount = 0;

          for (const [index, row] of (results.data as any[]).entries()) {
            try {
              // Parse complex fields
              let tags: string[] = [];
              if (row.tags) {
                if (row.tags.startsWith('{')) { // Postgres array format {tag1,tag2}
                  tags = row.tags.replace(/^\{|\}$/g, '').split(',').map((t: string) => t.replace(/"/g, ''));
                } else if (row.tags.startsWith('[')) { // JSON format
                  try { tags = JSON.parse(row.tags); } catch { tags = [row.tags]; }
                } else {
                  tags = row.tags.split(',').map((t: string) => t.trim());
                }
              }

              let localImages = {};
              if (row.local_images) {
                try { localImages = JSON.parse(row.local_images); } catch { console.warn('Failed to parse local_images'); }
              }

              const article: Article = {
                id: String(Date.now() + index), // Generate unique ID for each article
                title: row.title,
                content: row.content,
                excerpt: row.excerpt,
                category: row.category,
                subCategory: row.subcategory,
                status: row.status as any || 'draft',
                author: currentAuthorName,
                date: row.created_at || new Date().toISOString(),
                image: row.image_url,
                views: parseInt(row.views || '0'),
                likes: parseInt(row.likes || '0'),
                readTime: row.read_time,
                tags: tags,
                localImages: localImages,
                isTrending: row.is_trending === 'true' || row.is_trending === true,
                priority: row.priority as any || 'medium',
                comments: []
              };

              await articleService.saveArticle(article);
              successCount++;
            } catch (err) {
              console.error('Failed to import article:', row.title, err);
              failCount++;
            }
          }

          setArticles(await articleService.getAllArticles());
          setIsImporting(false);
          
          toast({
            title: "Import Complete",
            description: `Successfully imported ${successCount} articles. ${failCount > 0 ? `${failCount} failed.` : ''}`,
            variant: failCount > 0 ? "destructive" : "default"
          });
        },
        error: (error: any) => {
          console.error('CSV Parse Error:', error);
          setIsImporting(false);
          toast({
            title: "Import Failed",
            description: "Failed to parse CSV file",
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      console.error('Import Error:', error);
      setIsImporting(false);
      toast({
        title: "Import Failed",
        description: "Failed to load CSV file",
        variant: "destructive"
      });
    }
  };

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

  const handleLogout = () => {
    if (authUser) {
      logout();
    } else {
      localStorage.removeItem("admin-auth");
    }
    toast({
      title: "Success",
      description: "Logged out successfully"
    });
    navigate("/admin");
  };

  const updateArticleStatus = async (id: string | number, status: Article['status']) => {
    const article = articles.find(a => String(a.id) === String(id));
    if (article) {
      const updatedArticle = { ...article, status };
      await articleService.saveArticle(updatedArticle);
      const allArticles = await articleService.getAllArticles();
      setArticles(allArticles);
      toast({
        title: "Success",
        description: `Article status updated to ${status}`
      });
    }
  };

  const updateArticleTrending = async (id: string | number, isTrending: boolean) => {
    const article = articles.find(a => String(a.id) === String(id));
    if (article) {
      const updatedArticle = { ...article, isTrending };
      await articleService.saveArticle(updatedArticle);
      const allArticles = await articleService.getAllArticles();
      setArticles(allArticles);
      toast({
        title: "Success",
        description: `Article ${isTrending ? 'added to' : 'removed from'} trending`
      });
    }
  };

  const updateArticlePriority = async (id: string | number, priority: Article['priority']) => {
    const article = articles.find(a => String(a.id) === String(id));
    if (article) {
      const updatedArticle = { ...article, priority };
      await articleService.saveArticle(updatedArticle);
      const allArticles = await articleService.getAllArticles();
      setArticles(allArticles);
      toast({
        title: "Success",
        description: `Article priority updated to ${priority}`
      });
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
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your content and users</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/credentials')}>
                <Shield className="w-4 h-4 mr-2" />
                Credentials
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
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
                  {articles.slice(0, 3).map((article) => (
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
                <Button variant="outline" onClick={handleImportCSV} disabled={isImporting}>
                  <Upload className="w-4 h-4 mr-2" />
                  {isImporting ? 'Importing...' : 'Import CSV'}
                </Button>
                <Button onClick={() => navigate('/admin/create-article')}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Article
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
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
                            <SelectTrigger className="w-20">
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
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                >
                                  <Trash2 className="w-3 h-3" />
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
