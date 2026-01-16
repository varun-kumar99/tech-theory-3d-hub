import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  FileText, 
  Edit3, 
  Trash2, 
  Eye, 
  LogOut,
  PlusCircle,
  Bold,
  Italic,
  Underline,
  List,
  Link,
  Image,
  Table,
  Type,
  Palette,
  Save,
  User as UserIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { articleService, Article } from "@/services/articleService";
import { userService, User } from "@/services/userService";
import { NAV_CATEGORIES } from "@/constants/categories";
import { useAuth } from "@/contexts/AuthContext";

const AuthorDashboard = () => {
  const navigate = useNavigate();
  const [userArticles, setUserArticles] = useState<Article[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Load current user from local storage
    const auth = localStorage.getItem("admin-auth");
    if (auth) {
      try {
        const authData = JSON.parse(auth);
        if (authData?.user?.email) {
          // We need to fetch the latest user data from userService to ensure we have the correct ID and details
          const fetchUser = async () => {
             const allUsers = await userService.getAllUsers();
             // Try to find by email which is unique
             const user = allUsers.find(u => u.email === authData.user.email);
             if (user) {
               setCurrentUser(user);
             } else {
                // Fallback to auth data if user not found in DB (e.g. demo user)
                setCurrentUser({
                    id: 'demo',
                    name: authData.user.name || 'Author',
                    username: authData.user.username || authData.user.email.split('@')[0],
                    email: authData.user.email,
                    role: authData.role || 'author',
                    status: 'active',
                    joinedDate: new Date().toISOString()
                });
             }
          };
          fetchUser();
        }
      } catch (error) {
        console.error("Error parsing auth data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      if (currentUser) {
        const allArticles = await articleService.getAllArticles();
        const myArticles = allArticles.filter(article => {
          const isByUsername = article.authorId && currentUser.username && article.authorId === currentUser.username;
          const isByName = article.author === currentUser.name;
          return isByUsername || isByName;
        });
        setUserArticles(myArticles);
      }
    };
    fetchArticles();
  }, [currentUser]);

  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageData, setImageData] = useState({
    url: "",
    altText: "",
    file: null as File | null
  });
  const [newArticle, setNewArticle] = useState({
    title: "",
    category: "",
    subCategory: "",
    content: "",
    excerpt: "",
    status: "draft" as Article['status'],
    image: "",
    localImages: {} as Record<string, string>,
    isTrending: false,
    priority: 'medium' as Article['priority']
  });

  const [editorState, setEditorState] = useState({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    textColor: "inherit",
    textType: "body" // heading, subheading, body
  });
  
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const checkAuth = () => {
    const auth = localStorage.getItem("admin-auth");
    if (!auth) {
      navigate("/admin");
      return false;
    }
    
    const authData = JSON.parse(auth);
    if (authData.role !== "author") {
      navigate("/admin");
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    const checkAuthFunction = () => {
      const auth = localStorage.getItem("admin-auth");
      if (!auth) {
        navigate("/admin");
        return false;
      }
      
      const authData = JSON.parse(auth);
      if (authData.role !== "author") {
        navigate("/admin");
        return false;
      }
      
      return true;
    };
    
    checkAuthFunction();
  }, [navigate]);

  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Success",
      description: "Logged out successfully"
    });
    navigate("/admin");
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!currentUser.email || !currentUser.name) {
         toast({
            title: "Error",
            description: "Name and Email are required",
            variant: "destructive"
         });
         return;
    }

    // Update in database
    if (currentUser.id !== 'demo') {
        userService.updateUser(currentUser);
        
        // Update local session
        localStorage.setItem("admin-auth", JSON.stringify({
            role: currentUser.role,
            user: { name: currentUser.name, email: currentUser.email }
        }));
    }

    toast({
        title: "Success",
        description: "Profile updated successfully"
    });
  };

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
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            avatar: result
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialLinkChange = (platform: keyof NonNullable<User['socialLinks']>, value: string) => {
    if (!currentUser) return;
    setCurrentUser({
        ...currentUser,
        socialLinks: {
            ...currentUser.socialLinks,
            [platform]: value
        }
    });
  };

  const handleSaveArticle = async () => {
    if (!newArticle.title || !newArticle.content || !newArticle.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const article: Article = {
        id: Date.now().toString(),
        title: newArticle.title,
        category: newArticle.category,
        subCategory: newArticle.subCategory,
        content: newArticle.content,
        status: newArticle.status,
        views: 0,
        likes: 0,
        date: newArticle.status === 'published' ? new Date().toISOString().split('T')[0] : "",
        author: currentUser?.name || "Author",
        excerpt: newArticle.excerpt || articleService.generateExcerpt(newArticle.content),
        readTime: articleService.calculateReadTime(newArticle.content),
        image: newArticle.image || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
        localImages: newArticle.localImages,
        isTrending: newArticle.isTrending,
        priority: newArticle.priority
      };

      await articleService.saveArticle(article);
      if (currentUser) {
        const allArticles = await articleService.getAllArticles();
        const myArticles = allArticles.filter(a => {
          const isByUsername = a.authorId && currentUser.username && a.authorId === currentUser.username;
          const isByName = a.author === currentUser.name;
          return isByUsername || isByName;
        });
        setUserArticles(myArticles);
      }
      
      setNewArticle({ title: "", category: "", subCategory: "", content: "", status: "draft", image: "", localImages: {} });
      setIsAddingArticle(false);
      
      toast({
        title: "Success",
        description: "Article saved successfully"
      });
    } catch (error: any) {
       console.error("Save error:", error);
       toast({
         title: "Save Failed",
         description: error.message || "There was an error saving your article. Please try again.",
         variant: "destructive"
       });
    }
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setNewArticle({
      title: article.title,
      category: article.category,
      subCategory: article.subCategory || "",
      content: article.content,
      excerpt: article.excerpt || "",
      status: article.status,
      image: article.image || "",
      localImages: article.localImages || {},
      isTrending: article.isTrending || false,
      priority: article.priority || 'medium'
    });
    setIsAddingArticle(true);
  };

  const handleUpdateArticle = async () => {
    if (!editingArticle) return;

    const updatedArticle: Article = {
      ...editingArticle,
      ...newArticle,
      date: newArticle.status === 'published' ? new Date().toISOString().split('T')[0] : editingArticle.date,
      excerpt: newArticle.excerpt || articleService.generateExcerpt(newArticle.content),
      readTime: articleService.calculateReadTime(newArticle.content),
      localImages: newArticle.localImages
    };

    try {
      await articleService.saveArticle(updatedArticle);
      if (currentUser) {
        const allArticles = await articleService.getAllArticles();
        const myArticles = allArticles.filter(a => {
          const isByUsername = a.authorId && currentUser.username && a.authorId === currentUser.username;
          const isByName = a.author === currentUser.name;
          return isByUsername || isByName;
        });
        setUserArticles(myArticles);
      }
      
      setEditingArticle(null);
      setNewArticle({ 
        title: "", 
        category: "", 
        subCategory: "", 
        content: "", 
        excerpt: "",
        status: "draft", 
        image: "", 
        localImages: {},
        isTrending: false,
        priority: 'medium'
      });
      setIsAddingArticle(false);
      
      toast({
        title: "Success",
        description: "Article updated successfully"
      });
    } catch (error: any) {
      console.error("Update error:", error);
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating your article. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteArticle = async (id: string | number) => {
    await articleService.deleteArticle(id);
    if (currentUser) {
      const allArticles = await articleService.getAllArticles();
      const myArticles = allArticles.filter(a => {
        const isByUsername = a.authorId && currentUser.username && a.authorId === currentUser.username;
        const isByName = a.author === currentUser.name;
        return isByUsername || isByName;
      });
      setUserArticles(myArticles);
    }
    
    toast({
      title: "Success",
      description: "Article deleted successfully"
    });
  };

  const insertText = (text: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const content = newArticle.content;
      
      const newContent = content.substring(0, start) + text + content.substring(end);
      
      setNewArticle(prev => ({
        ...prev,
        content: newContent
      }));
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    } else {
      setNewArticle(prev => ({
        ...prev,
        content: prev.content + text
      }));
    }
  };

  const insertTextType = (type: 'heading' | 'subheading' | 'body') => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      
      let prefix = '';
      let formattedText = '';
      
      switch (type) {
        case 'heading':
          prefix = selectedText ? '' : '\n# ';
          formattedText = selectedText ? `# ${selectedText}` : prefix;
          break;
        case 'subheading':
          prefix = selectedText ? '' : '\n## ';
          formattedText = selectedText ? `## ${selectedText}` : prefix;
          break;
        case 'body':
          prefix = selectedText ? '' : '\n';
          formattedText = selectedText ? `${selectedText}` : prefix;
          break;
      }
      
      const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      setNewArticle(prev => ({ ...prev, content: newContent }));
      
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + formattedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
    
    setEditorState(prev => ({ ...prev, textType: type }));
  };

  const formatText = (format: string) => {
    // Apply formatting to the entire content or selected text
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      
      if (selectedText) {
        // Format selected text
        let formattedText = selectedText;
        switch (format) {
          case 'Bold':
            formattedText = `**${selectedText}**`;
            break;
          case 'Italic':
            formattedText = `*${selectedText}*`;
            break;
          case 'Underline':
            formattedText = `<u>${selectedText}</u>`;
            break;
        }
        
        const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
        setNewArticle(prev => ({ ...prev, content: newContent }));
      }
    }
    
    setEditorState(prev => ({
      ...prev,
      [`is${format}`]: !prev[`is${format}` as keyof typeof prev]
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a preview URL for the uploaded file
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Store the data URL for preview only, and keep track of the file
        setImageData({
          file: file,
          url: result, // This is only for preview in the dialog
          altText: imageData.altText
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            // Sanitize filename to avoid markdown parsing issues
            const cleanFileName = file.name.replace(/\[/g, '').replace(/\]/g, '').replace(/\s+/g, '-');
            const uniqueId = `local-image-${Date.now()}-${cleanFileName}`;
            const imageMarkdown = `\n![${cleanFileName}](${uniqueId})\n`;
            
            setNewArticle(prev => {
              // We reconstruct using the captured text to ensure insertion at the correct cursor position
              // Note: This assumes the content hasn't changed significantly during the file read
              const newContent = text.substring(0, start) + imageMarkdown + text.substring(end);
              return { 
                ...prev, 
                content: newContent,
                localImages: {
                  ...prev.localImages,
                  [uniqueId]: result
                }
              };
            });
            
            toast({
              title: "Success",
              description: "Image added successfully.",
            });
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const insertImage = () => {
    if (imageData.url && imageData.altText) {
      // Use the URL (Data URL for files, or direct URL for links)
      // Sanitize alt text
      const cleanAltText = imageData.altText.replace(/\[/g, '').replace(/\]/g, '').replace(/\s+/g, '-');
      
      let imageUrl = imageData.url;
      let newStateUpdate = {};

      // If it's a data URL (uploaded file), store it locally and use a reference
      if (imageUrl.startsWith('data:')) {
        const uniqueId = `local-image-${Date.now()}-${cleanAltText}`;
        newStateUpdate = {
          localImages: {
            ...newArticle.localImages,
            [uniqueId]: imageUrl
          }
        };
        imageUrl = uniqueId;
      }

      const imageMarkdown = `![${cleanAltText}](${imageUrl})`;
      
      setNewArticle(prev => {
        const content = prev.content;
        const insertPos = (cursorPosition !== null && cursorPosition >= 0 && cursorPosition <= content.length) 
                          ? cursorPosition 
                          : content.length;
        
        // Ensure proper spacing around the image
        const prefix = insertPos > 0 && content[insertPos-1] !== '\n' ? '\n' : '';
        const suffix = insertPos < content.length && content[insertPos] !== '\n' ? '\n' : '';
        
        const newContent = content.substring(0, insertPos) + 
                           prefix + imageMarkdown + suffix + 
                           content.substring(insertPos);

        return {
          ...prev,
          content: newContent,
          ...newStateUpdate
        };
      });
      
      toast({
        title: "Success",
        description: "Image inserted successfully."
      });
      
      setShowImageDialog(false);
      setImageData({ url: "", altText: "", file: null });
      setCursorPosition(null);
    }
  };

  const getStatusColor = (status: Article['status']) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalArticles: userArticles.length,
    publishedArticles: userArticles.filter(a => a.status === 'published').length,
    draftArticles: userArticles.filter(a => a.status === 'draft').length,
    totalViews: userArticles.reduce((sum, article) => sum + article.views, 0),
    totalLikes: userArticles.reduce((sum, article) => sum + article.likes, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Author Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, <span className="font-medium text-gray-900 dark:text-white">{currentUser?.name || "Author"}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <Button 
                onClick={() => navigate('/admin/create-article')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                <span className="whitespace-nowrap">New Article</span>
              </Button>
              <Button 
                onClick={() => setIsAddingArticle(true)}
                variant="outline"
                className="text-sm"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                <span className="whitespace-nowrap">Quick Edit</span>
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
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="articles">My Articles</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalArticles}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Published</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.publishedArticles}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                  <Edit3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.draftArticles}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLikes}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Articles */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Articles</CardTitle>
                <CardDescription>Your latest articles and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userArticles.slice(0, 3).map((article) => (
                    <div 
                      key={article.id} 
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => handleEditArticle(article)}
                    >
                      <div>
                        <h4 className="font-medium">{article.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {article.category} • {article.views.toLocaleString()} views • {article.likes} likes
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
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-6">
              {userArticles.map((article) => (
                <div key={article.id} className="group">
                  {/* Mobile View: Image-focused card (based on second image) */}
                  <div className="block sm:hidden relative aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 mb-2">
                    <img 
                      src={article.image || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop"} 
                      alt={article.title} 
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient Overlay for Title */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                      <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-gray-300 text-xs">
                        <span>{article.category}</span>
                        <span>•</span>
                        <span>{article.views.toLocaleString()} views</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop View: Original Card layout */}
                  <Card 
                    className="hidden sm:block cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => handleEditArticle(article)}
                  >
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate sm:whitespace-normal">{article.title}</CardTitle>
                          <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                            <span>{article.category}</span>
                            <span className="hidden sm:inline">•</span>
                            {article.date && (
                              <>
                                <span className="whitespace-nowrap">Published on {article.date}</span>
                                <span className="hidden sm:inline">•</span>
                              </>
                            )}
                            <span className="whitespace-nowrap">{article.views.toLocaleString()} views</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="whitespace-nowrap">{article.likes} likes</span>
                          </CardDescription>
                        </div>
                        
                        {/* Desktop Actions */}
                        <div className="hidden sm:flex items-center gap-2 self-start">
                          <Badge className={`${getStatusColor(article.status)} whitespace-nowrap`}>
                            {article.status}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/article/${article.id}`);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditArticle(article);
                              }}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the article.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteArticle(article.id);
                                    }}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="hidden sm:block text-gray-600 dark:text-gray-400 line-clamp-3">
                        {article.excerpt || article.content}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Mobile Actions Row: Icon-only bar below image */}
                  <div className="flex sm:hidden items-center justify-between px-2 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                    <Badge className={`${getStatusColor(article.status)} text-[10px] h-5 px-2`}>
                      {article.status}
                    </Badge>
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/article/${article.id}`);
                        }}
                      >
                        <Eye className="w-5 h-5 text-gray-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditArticle(article);
                        }}
                      >
                        <Edit3 className="w-5 h-5 text-gray-500" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteArticle(article.id);
                              }}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Author Profile</CardTitle>
                <CardDescription>Manage your author information</CardDescription>
              </CardHeader>
              <CardContent>
                {currentUser && (
                    <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-4xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="flex flex-col items-center space-y-4 mb-6">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 shadow-sm relative group">
                              {currentUser.avatar ? (
                                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                  <UserIcon className="w-12 h-12" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <label htmlFor="avatar-upload" className="cursor-pointer text-white text-xs font-medium flex flex-col items-center w-full h-full justify-center">
                                  <Image className="w-6 h-6 mb-1" />
                                  <span>Change</span>
                                </label>
                              </div>
                            </div>
                            <div className="text-center">
                              <Input 
                                id="avatar-upload" 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleProfileImageUpload}
                              />
                              <Label htmlFor="avatar-upload" className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                                Upload Profile Picture
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">Max size 1MB</p>
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="profile-name">Name</Label>
                            <Input
                              id="profile-name"
                              value={currentUser.name}
                              onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="profile-bio">Bio (Max 100 words)</Label>
                            <Textarea
                              id="profile-bio"
                              placeholder="Tell us about yourself..."
                              className="h-32"
                              value={currentUser.bio || ''}
                              onChange={(e) => {
                                const text = e.target.value;
                                const wordCount = text.trim().split(/\s+/).filter(w => w).length;
                                if (text === '' || wordCount <= 100) {
                                  setCurrentUser({ ...currentUser, bio: text });
                                }
                              }}
                            />
                            <p className="text-xs text-gray-500 text-right">
                              {(currentUser.bio || '').trim().split(/\s+/).filter(w => w).length}/100 words
                            </p>
                          </div>

                          <div className="grid gap-2">
                            <Label>Social Links</Label>
                            <div className="grid gap-3">
                              <div className="flex items-center space-x-2">
                                <span className="w-20 text-sm">Instagram</span>
                                <Input 
                                  placeholder="https://instagram.com/username" 
                                  value={currentUser.socialLinks?.instagram || ''} 
                                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)} 
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="w-20 text-sm">LinkedIn</span>
                                <Input 
                                  placeholder="https://linkedin.com/in/username" 
                                  value={currentUser.socialLinks?.linkedin || ''} 
                                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)} 
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="w-20 text-sm">X (Twitter)</span>
                                <Input 
                                  placeholder="https://x.com/username" 
                                  value={currentUser.socialLinks?.twitter || ''} 
                                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)} 
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="w-20 text-sm">Facebook</span>
                                <Input 
                                  placeholder="https://facebook.com/username" 
                                  value={currentUser.socialLinks?.facebook || ''} 
                                  onChange={(e) => handleSocialLinkChange('facebook', e.target.value)} 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button type="submit">Save Changes</Button>
                    </form>
                 )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Article Editor Dialog */}
      <Dialog open={isAddingArticle} onOpenChange={setIsAddingArticle}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? 'Edit Article' : 'Create New Article'}</DialogTitle>
            <DialogDescription>
              {editingArticle ? 'Update your article content' : 'Write your new article with the rich text editor and live preview'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Article Meta */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter article title"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={newArticle.category} 
                  onValueChange={(value) => {
                    setNewArticle(prev => ({ ...prev, category: value, subCategory: "" }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {NAV_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {newArticle.category && NAV_CATEGORIES.find(c => c.name === newArticle.category)?.subcategories.length! > 0 && (
                  <div className="mt-3">
                    <Label htmlFor="subCategory">Sub Category (Optional)</Label>
                    <Select 
                      value={newArticle.subCategory} 
                      onValueChange={(value) => setNewArticle(prev => ({ ...prev, subCategory: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub category" />
                      </SelectTrigger>
                      <SelectContent>
                        {NAV_CATEGORIES.find(c => c.name === newArticle.category)?.subcategories.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt (Optional)</Label>
              <Textarea
                id="excerpt"
                value={newArticle.excerpt || ""}
                onChange={(e) => setNewArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Write a brief excerpt or summary..."
                className="mt-2 resize-none"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newArticle.priority || 'medium'}
                  onValueChange={(value: Article['priority']) => setNewArticle(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="isTrending"
                  checked={newArticle.isTrending || false}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, isTrending: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="isTrending" className="cursor-pointer">Mark as Trending</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="cover-image">Cover Image URL</Label>
              <Input
                id="cover-image"
                value={newArticle.image || ""}
                onChange={(e) => setNewArticle(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
              {newArticle.image && (
                <div className="mt-2 relative group">
                  <img 
                    src={newArticle.image} 
                    alt="Cover Preview" 
                    className="h-32 w-full object-cover rounded-md border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }} 
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.display = 'block';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Rich Text Editor Toolbar */}
            <div className="border rounded-lg p-3">
              <div className="sticky top-0 z-10 bg-background flex flex-wrap gap-2 mb-4 border-b pb-3 pt-2 -mt-2">
                {/* Text Formatting */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editorState.isBold ? "default" : "outline"}
                      size="sm"
                      onClick={() => formatText('Bold')}
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bold text</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editorState.isItalic ? "default" : "outline"}
                      size="sm"
                      onClick={() => formatText('Italic')}
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Italic text</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editorState.isUnderline ? "default" : "outline"}
                      size="sm"
                      onClick={() => formatText('Underline')}
                    >
                      <Underline className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Underline text</p>
                  </TooltipContent>
                </Tooltip>

                {/* Separator */}
                <div className="w-px h-6 bg-gray-300 mx-2" />

                {/* Text Types */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editorState.textType === 'heading' ? "default" : "outline"}
                      size="sm"
                      onClick={() => insertTextType('heading')}
                    >
                      <Type className="w-4 h-4" />
                      <span className="ml-1 text-xs">H1</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Main Heading (H1)</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editorState.textType === 'subheading' ? "default" : "outline"}
                      size="sm"
                      onClick={() => insertTextType('subheading')}
                    >
                      <Type className="w-4 h-4" />
                      <span className="ml-1 text-xs">H2</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sub Heading (H2)</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editorState.textType === 'body' ? "default" : "outline"}
                      size="sm"
                      onClick={() => insertTextType('body')}
                    >
                      <Type className="w-4 h-4" />
                      <span className="ml-1 text-xs">P</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Body Text (Paragraph)</p>
                  </TooltipContent>
                </Tooltip>

                {/* Separator */}
                <div className="w-px h-6 bg-gray-300 mx-2" />

                {/* Text Color */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <input
                      type="color"
                      value={editorState.textColor}
                      onChange={(e) => setEditorState(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Text Color</p>
                  </TooltipContent>
                </Tooltip>

                {/* Separator */}
                <div className="w-px h-6 bg-gray-300 mx-2" />

                {/* Insert Elements */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => insertText('\n• ')}>
                      <List className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bullet List</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => insertText('[Link](https://)')}>
                      <Link className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Insert Link</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          setCursorPosition(textarea.selectionStart);
                        }
                        setShowImageDialog(true);
                      }}
                    >
                      <Image className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Insert Image</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => insertText('\n| Header | Header |\n|--------|--------|\n| Cell   | Cell   |\n')}>
                      <Table className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Insert Table</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Content Editor with Preview */}
              <div>
                <Label htmlFor="content">Content *</Label>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Editor */}
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Editor</Label>
                    <Textarea
                      ref={textareaRef}
                      id="content"
                      value={newArticle.content}
                      onChange={(e) => setNewArticle(prev => ({ ...prev, content: e.target.value }))}
                      onPaste={handlePaste}
                      placeholder="Start writing your article here. Use the toolbar above to format your text..."
                      className="h-[600px] w-full p-4 font-mono text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto bg-background text-foreground"
                      style={{
                        color: editorState.textColor !== "inherit" ? editorState.textColor : undefined,
                        fontWeight: editorState.isBold ? 'bold' : 'normal',
                        fontStyle: editorState.isItalic ? 'italic' : 'normal',
                        textDecoration: editorState.isUnderline ? 'underline' : 'none'
                      }}
                    />
                  </div>
                  
                  {/* Preview */}
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Preview</Label>
                    <div className="h-[600px] p-4 border rounded-md bg-gray-50 dark:bg-gray-800 overflow-y-auto">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {(() => {
                          const lines = newArticle.content.split('\n');
                          const elements = [];
                          
                          for (let i = 0; i < lines.length; i++) {
                            const line = lines[i];
                            const key = i;

                            // Table Detection
                            if (line.trim().startsWith('|') && 
                                i + 1 < lines.length && 
                                lines[i+1].trim().startsWith('|') && 
                                (lines[i+1].includes('---') || lines[i+1].includes('-'))) {
                              
                              const tableLines = [];
                              let j = i;
                              // Collect all consecutive lines that look like table rows (start with |)
                              while (j < lines.length && lines[j].trim().startsWith('|')) {
                                tableLines.push(lines[j]);
                                j++;
                              }
                              
                              // Parse table
                              // Filter out empty strings that result from split if there are leading/trailing pipes
                              const headers = tableLines[0].split('|').filter(c => c.trim() !== '').map(c => c.trim());
                              // Skip the separator row (index 1)
                              const rows = tableLines.slice(2).map(rowLine => 
                                rowLine.split('|').filter(c => c.trim() !== '').map(c => c.trim())
                              );

                              const parseCell = (text: string) => {
                                let content = text;
                                content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
                                content = content.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">$1</code>');
                                content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>');
                                return <span dangerouslySetInnerHTML={{ __html: content }} />;
                              };
                              
                              elements.push(
                                <div key={`table-${key}`} className="overflow-x-auto my-4">
                                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                      <tr>
                                        {headers.map((header, hIdx) => (
                                          <th key={hIdx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r last:border-r-0">
                                            {parseCell(header)}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                      {rows.map((row, rIdx) => (
                                        <tr key={rIdx}>
                                          {row.map((cell, cIdx) => (
                                            <td key={cIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border-r last:border-r-0">
                                              {parseCell(cell)}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              );
                              
                              i = j - 1; // Move index to the end of the table
                              continue;
                            }

                            if (line.startsWith('# ')) {
                              elements.push(
                                <h1 key={key} className="text-2xl font-bold mb-4 mt-6 text-gray-900 dark:text-white">
                                  {line.replace('# ', '')}
                                </h1>
                              );
                            } else if (line.startsWith('## ')) {
                              elements.push(
                                <h2 key={key} className="text-xl font-semibold mb-3 mt-5 text-gray-800 dark:text-gray-100">
                                  {line.replace('## ', '')}
                                </h2>
                              );
                            } else if (line.startsWith('### ')) {
                              elements.push(
                                <h3 key={key} className="text-lg font-medium mb-2 mt-4 text-gray-700 dark:text-gray-200">
                                  {line.replace('### ', '')}
                                </h3>
                              );
                            } else if (line.startsWith('• ') || line.startsWith('- ')) {
                              elements.push(
                                <li key={key} className="ml-4 text-gray-700 dark:text-gray-300">
                                  {line.replace(/^(\•|-)\s/, '')}
                                </li>
                              );
                            } else if (line.includes('![') && line.includes('](')) {
                              const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
                              if (imageMatch) {
                                const [, altText, imageUrl] = imageMatch;
                                
                                // Resolve local image reference
                                let displayUrl = imageUrl;
                                if (imageUrl.startsWith('local-image-') && newArticle.localImages?.[imageUrl]) {
                                  displayUrl = newArticle.localImages[imageUrl];
                                }
                                
                                elements.push(
                                  <div key={key} className="my-8">
                                    <img 
                                      src={displayUrl} 
                                      alt={altText} 
                                      className="w-full h-auto max-h-[600px] object-contain rounded-lg border shadow-md bg-black/5 dark:bg-white/5"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const errorDiv = document.createElement('div');
                                        errorDiv.className = 'p-4 border-2 border-dashed border-red-300 rounded-lg text-center text-red-500 bg-red-50 dark:bg-red-900/20';
                                        errorDiv.innerHTML = `<p>Failed to load image</p><p className="text-xs mt-1">Alt text: ${altText}</p>`;
                                        target.parentNode?.insertBefore(errorDiv, target);
                                      }}
                                    />
                                    <p className="text-sm text-gray-500 mt-2 italic">{altText}</p>
                                  </div>
                                );
                              }
                            } else if (line.includes('**') && line.includes('**')) {
                              const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                              elements.push(
                                <p key={key} className="mb-2 text-gray-700 dark:text-gray-300" 
                                   dangerouslySetInnerHTML={{ __html: boldText }} />
                              );
                            } else if (line.includes('*') && line.includes('*')) {
                              const italicText = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
                              elements.push(
                                <p key={key} className="mb-2 text-gray-700 dark:text-gray-300" 
                                   dangerouslySetInnerHTML={{ __html: italicText }} />
                              );
                            } else if (line.includes('[') && line.includes('](')) {
                              const linkText = line.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>');
                              elements.push(
                                <p key={key} className="mb-2 text-gray-700 dark:text-gray-300" 
                                   dangerouslySetInnerHTML={{ __html: linkText }} />
                              );
                            } else if (line.trim() === '') {
                              elements.push(<br key={key} />);
                            } else {
                              elements.push(
                                <p key={key} className="mb-2 text-gray-700 dark:text-gray-300">
                                  {line}
                                </p>
                              );
                            }
                          }
                          return elements;
                        })()}
                        {newArticle.content === '' && (
                          <p className="text-gray-500 italic">Start writing to see preview...</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Selection */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={newArticle.status} onValueChange={(value: Article['status']) => setNewArticle(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Save as Draft</SelectItem>
                  <SelectItem value="pending">Submit for Review</SelectItem>
                  <SelectItem value="published">Publish Now</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddingArticle(false);
                  setEditingArticle(null);
                  setNewArticle({ title: "", category: "", content: "", status: "draft", image: "", localImages: {} });
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingArticle ? handleUpdateArticle : handleSaveArticle}>
                <Save className="w-4 h-4 mr-2" />
                {editingArticle ? 'Update Article' : 'Save Article'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>
              Provide an image URL
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                type="url"
                value={imageData.url}
                onChange={(e) => {
                  setImageData(prev => ({ 
                    ...prev, 
                    url: e.target.value,
                    file: null
                  }));
                }}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            {imageData.url && (
              <div className="mt-4">
                <Label>Preview</Label>
                <div className="mt-2 p-2 border rounded-lg">
                  <img 
                    src={imageData.url} 
                    alt="Preview" 
                    className="max-w-full h-32 object-contain bg-muted rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const errorDiv = target.nextElementSibling as HTMLElement;
                      if (!errorDiv || !errorDiv.classList.contains('error-message')) {
                        const newErrorDiv = document.createElement('div');
                        newErrorDiv.className = 'error-message text-red-500 text-sm mt-2';
                        newErrorDiv.textContent = 'Failed to load image. Please check the URL.';
                        target.parentNode?.appendChild(newErrorDiv);
                      }
                    }}
                    onLoad={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'block';
                      const errorDiv = target.parentNode?.querySelector('.error-message');
                      if (errorDiv) {
                        errorDiv.remove();
                      }
                    }}
                  />
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="alt-text">Alt Text (Required)</Label>
              <Input
                id="alt-text"
                value={imageData.altText}
                onChange={(e) => setImageData(prev => ({ ...prev, altText: e.target.value }))}
                placeholder="Describe the image for accessibility"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowImageDialog(false);
                  setImageData({ url: "", altText: "", file: null });
                }}
              >
                Cancel
              </Button>
              <Button onClick={insertImage}>
                Insert Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthorDashboard;
