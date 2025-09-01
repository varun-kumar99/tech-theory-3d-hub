import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  LogOut,
  Settings,
  PlusCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface Article {
  id: string;
  title: string;
  author: string;
  status: 'published' | 'draft' | 'pending';
  category: string;
  views: number;
  likes: number;
  publishDate: string;
  isTrending: boolean;
  priority: 'high' | 'medium' | 'low';
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([
    {
      id: "1",
      title: "The Future of AI in Web Development",
      author: "John Doe",
      status: "published",
      category: "AI",
      views: 15420,
      likes: 234,
      publishDate: "2024-01-15",
      isTrending: true,
      priority: "high"
    },
    {
      id: "2",
      title: "Understanding React Server Components",
      author: "Jane Smith",
      status: "published",
      category: "React",
      views: 8900,
      likes: 156,
      publishDate: "2024-01-12",
      isTrending: false,
      priority: "medium"
    },
    {
      id: "3",
      title: "CSS Grid vs Flexbox: When to Use Which",
      author: "Mike Johnson",
      status: "draft",
      category: "CSS",
      views: 0,
      likes: 0,
      publishDate: "",
      isTrending: false,
      priority: "low"
    }
  ]);

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    const checkAuthFunction = () => {
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
    
    checkAuthFunction();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin-auth");
    toast({
      title: "Success",
      description: "Logged out successfully"
    });
    navigate("/admin");
  };

  const updateArticleStatus = (id: string, status: Article['status']) => {
    setArticles(articles.map(article => 
      article.id === id ? { ...article, status } : article
    ));
    toast({
      title: "Success",
      description: `Article status updated to ${status}`
    });
  };

  const updateArticleTrending = (id: string, isTrending: boolean) => {
    setArticles(articles.map(article => 
      article.id === id ? { ...article, isTrending } : article
    ));
    toast({
      title: "Success",
      description: `Article ${isTrending ? 'added to' : 'removed from'} trending`
    });
  };

  const updateArticlePriority = (id: string, priority: Article['priority']) => {
    setArticles(articles.map(article => 
      article.id === id ? { ...article, priority } : article
    ));
    toast({
      title: "Success",
      description: `Article priority updated to ${priority}`
    });
  };

  const deleteArticle = (id: string) => {
    setArticles(articles.filter(article => article.id !== id));
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
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
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
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Article
              </Button>
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
                            value={article.priority}
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
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteArticle(article.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
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
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage authors and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">User management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>View detailed analytics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
