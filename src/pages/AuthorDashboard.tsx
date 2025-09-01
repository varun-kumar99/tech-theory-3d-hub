import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface UserArticle {
  id: string;
  title: string;
  status: 'published' | 'draft' | 'pending';
  category: string;
  views: number;
  likes: number;
  publishDate: string;
  content: string;
}

const AuthorDashboard = () => {
  const navigate = useNavigate();
  const [userArticles, setUserArticles] = useState<UserArticle[]>([
    {
      id: "1",
      title: "My First Article",
      status: "published",
      category: "Technology",
      views: 1250,
      likes: 45,
      publishDate: "2024-01-10",
      content: "This is my first published article content..."
    },
    {
      id: "2",
      title: "Draft Article",
      status: "draft",
      category: "AI",
      views: 0,
      likes: 0,
      publishDate: "",
      content: "This is a draft article..."
    }
  ]);

  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [editingArticle, setEditingArticle] = useState<UserArticle | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageData, setImageData] = useState({
    url: "",
    altText: "",
    file: null as File | null
  });
  const [newArticle, setNewArticle] = useState({
    title: "",
    category: "",
    content: "",
    status: "draft" as UserArticle['status']
  });

  const [editorState, setEditorState] = useState({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    textColor: "#000000",
    textType: "body" // heading, subheading, body
  });

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

  const handleLogout = () => {
    localStorage.removeItem("admin-auth");
    toast({
      title: "Success",
      description: "Logged out successfully"
    });
    navigate("/admin");
  };

  const handleSaveArticle = () => {
    if (!newArticle.title || !newArticle.content || !newArticle.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const article: UserArticle = {
      id: Date.now().toString(),
      title: newArticle.title,
      category: newArticle.category,
      content: newArticle.content,
      status: newArticle.status,
      views: 0,
      likes: 0,
      publishDate: newArticle.status === 'published' ? new Date().toISOString().split('T')[0] : ""
    };

    setUserArticles([...userArticles, article]);
    setNewArticle({ title: "", category: "", content: "", status: "draft" });
    setIsAddingArticle(false);
    
    toast({
      title: "Success",
      description: "Article saved successfully"
    });
  };

  const handleEditArticle = (article: UserArticle) => {
    setEditingArticle(article);
    setNewArticle({
      title: article.title,
      category: article.category,
      content: article.content,
      status: article.status
    });
    setIsAddingArticle(true);
  };

  const handleUpdateArticle = () => {
    if (!editingArticle) return;

    const updatedArticles = userArticles.map(article => 
      article.id === editingArticle.id 
        ? { ...article, ...newArticle, publishDate: newArticle.status === 'published' ? new Date().toISOString().split('T')[0] : article.publishDate }
        : article
    );

    setUserArticles(updatedArticles);
    setEditingArticle(null);
    setNewArticle({ title: "", category: "", content: "", status: "draft" });
    setIsAddingArticle(false);
    
    toast({
      title: "Success",
      description: "Article updated successfully"
    });
  };

  const handleDeleteArticle = (id: string) => {
    setUserArticles(userArticles.filter(article => article.id !== id));
    toast({
      title: "Success",
      description: "Article deleted successfully"
    });
  };

  const insertText = (text: string) => {
    setNewArticle(prev => ({
      ...prev,
      content: prev.content + text
    }));
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
      
      if (selectedText) {
        const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
        setNewArticle(prev => ({ ...prev, content: newContent }));
      } else {
        setNewArticle(prev => ({
          ...prev,
          content: prev.content + formattedText
        }));
      }
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

  const insertImage = () => {
    if (imageData.file && imageData.altText) {
      // For uploaded files, create a placeholder that can be replaced with actual URL later
      const fileName = imageData.file.name;
      const imageMarkdown = `![${imageData.altText}](uploaded-image-${fileName})`;
      
      setNewArticle(prev => ({
        ...prev,
        content: prev.content + '\n' + imageMarkdown + '\n'
      }));
      
      toast({
        title: "Success",
        description: `Image "${fileName}" inserted successfully. In production, this would upload to your server.`
      });
    } else if (imageData.url && !imageData.file && imageData.altText) {
      // For URL images, use the URL directly
      const imageMarkdown = `![${imageData.altText}](${imageData.url})`;
      setNewArticle(prev => ({
        ...prev,
        content: prev.content + '\n' + imageMarkdown + '\n'
      }));
      
      toast({
        title: "Success",
        description: "Image URL inserted successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Please provide both image (file or URL) and alt text",
        variant: "destructive"
      });
      return;
    }
    
    // Reset image data and close dialog
    setImageData({ url: "", altText: "", file: null });
    setShowImageDialog(false);
  };

  const getStatusColor = (status: UserArticle['status']) => {
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
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Author Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Create and manage your articles</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/admin/create-article')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                New Article
              </Button>
              <Button 
                onClick={() => setIsAddingArticle(true)}
                variant="outline"
                className="text-sm"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Quick Edit
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
                  <User className="h-4 w-4 text-muted-foreground" />
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
                    <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
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
            <div className="grid gap-6">
              {userArticles.map((article) => (
                <Card key={article.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                        <CardDescription>
                          {article.category} • 
                          {article.publishDate && ` Published on ${article.publishDate} • `}
                          {article.views.toLocaleString()} views • {article.likes} likes
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(article.status)}>
                          {article.status}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditArticle(article)}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteArticle(article.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                      {article.content}
                    </p>
                  </CardContent>
                </Card>
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
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue="John Doe" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue="author@techtheory.com" disabled />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" placeholder="Tell us about yourself..." />
                  </div>
                  <Button>Update Profile</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Article Editor Dialog */}
      <Dialog open={isAddingArticle} onOpenChange={setIsAddingArticle}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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
                <Select value={newArticle.category} onValueChange={(value) => setNewArticle(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="AI">AI</SelectItem>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Mobile">Mobile</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Rich Text Editor Toolbar */}
            <div className="border rounded-lg p-3">
              <div className="flex flex-wrap gap-2 mb-4 border-b pb-3">
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
                    <Button variant="outline" size="sm" onClick={() => setShowImageDialog(true)}>
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
                      id="content"
                      value={newArticle.content}
                      onChange={(e) => setNewArticle(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Start writing your article here. Use the toolbar above to format your text..."
                      className="min-h-[400px] font-mono rich-text-editor"
                      style={{
                        color: editorState.textColor,
                        fontWeight: editorState.isBold ? 'bold' : 'normal',
                        fontStyle: editorState.isItalic ? 'italic' : 'normal',
                        textDecoration: editorState.isUnderline ? 'underline' : 'none'
                      }}
                    />
                  </div>
                  
                  {/* Preview */}
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Preview</Label>
                    <div className="min-h-[400px] p-4 border rounded-md bg-gray-50 dark:bg-gray-800 overflow-y-auto">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {newArticle.content.split('\n').map((line, index) => {
                          if (line.startsWith('# ')) {
                            return (
                              <h1 key={index} className="text-2xl font-bold mb-4 mt-6 text-gray-900 dark:text-white">
                                {line.replace('# ', '')}
                              </h1>
                            );
                          } else if (line.startsWith('## ')) {
                            return (
                              <h2 key={index} className="text-xl font-semibold mb-3 mt-5 text-gray-800 dark:text-gray-100">
                                {line.replace('## ', '')}
                              </h2>
                            );
                          } else if (line.startsWith('### ')) {
                            return (
                              <h3 key={index} className="text-lg font-medium mb-2 mt-4 text-gray-700 dark:text-gray-200">
                                {line.replace('### ', '')}
                              </h3>
                            );
                          } else if (line.startsWith('• ')) {
                            return (
                              <li key={index} className="ml-4 text-gray-700 dark:text-gray-300">
                                {line.replace('• ', '')}
                              </li>
                            );
                          } else if (line.includes('![') && line.includes('](')) {
                            const imageMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
                            if (imageMatch) {
                              const [, altText, imageUrl] = imageMatch;
                              
                              // Check if this is an uploaded file placeholder
                              if (imageUrl.startsWith('uploaded-image-')) {
                                // For uploaded files, show a placeholder in preview
                                const fileName = imageUrl.replace('uploaded-image-', '');
                                return (
                                  <div key={index} className="my-4 p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                                    <div className="flex flex-col items-center space-y-2">
                                      <Image className="w-8 h-8 text-blue-500" />
                                      <p className="text-blue-700 dark:text-blue-300 font-medium">
                                        Uploaded Image: {fileName}
                                      </p>
                                      <p className="text-sm text-blue-600 dark:text-blue-400">
                                        Alt text: {altText}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        This image would be uploaded to your server in production
                                      </p>
                                    </div>
                                  </div>
                                );
                              } else {
                                // For URL images, show the actual image
                                return (
                                  <div key={index} className="my-4">
                                    <img 
                                      src={imageUrl} 
                                      alt={altText} 
                                      className="max-w-full h-auto rounded-lg border"
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
                            }
                          } else if (line.includes('**') && line.includes('**')) {
                            const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            return (
                              <p key={index} className="mb-2 text-gray-700 dark:text-gray-300" 
                                 dangerouslySetInnerHTML={{ __html: boldText }} />
                            );
                          } else if (line.includes('*') && line.includes('*')) {
                            const italicText = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
                            return (
                              <p key={index} className="mb-2 text-gray-700 dark:text-gray-300" 
                                 dangerouslySetInnerHTML={{ __html: italicText }} />
                            );
                          } else if (line.includes('[') && line.includes('](')) {
                            const linkText = line.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>');
                            return (
                              <p key={index} className="mb-2 text-gray-700 dark:text-gray-300" 
                                 dangerouslySetInnerHTML={{ __html: linkText }} />
                            );
                          } else if (line.trim() === '') {
                            return <br key={index} />;
                          } else {
                            return (
                              <p key={index} className="mb-2 text-gray-700 dark:text-gray-300">
                                {line}
                              </p>
                            );
                          }
                        })}
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
              <Select value={newArticle.status} onValueChange={(value: UserArticle['status']) => setNewArticle(prev => ({ ...prev, status: value }))}>
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
                  setNewArticle({ title: "", category: "", content: "", status: "draft" });
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
              Upload an image file or provide an image URL
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload File</TabsTrigger>
                <TabsTrigger value="url">Image URL</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4">
                <div>
                  <Label htmlFor="image-upload">Choose Image</Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-1"
                  />
                </div>
                
                {imageData.url && (
                  <div className="mt-4">
                    <Label>Preview</Label>
                    <div className="mt-2 p-2 border rounded-lg">
                      <img 
                        src={imageData.url} 
                        alt="Preview" 
                        className="max-w-full h-32 object-cover rounded"
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="url" className="space-y-4">
                <div>
                  <Label htmlFor="image-url">Image URL</Label>
                  <Input
                    id="image-url"
                    type="url"
                    value={!imageData.file ? imageData.url : ""}
                    onChange={(e) => {
                      setImageData(prev => ({ 
                        ...prev, 
                        url: e.target.value,
                        file: null // Clear file when entering URL
                      }));
                    }}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                {imageData.url && !imageData.file && (
                  <div className="mt-4">
                    <Label>Preview</Label>
                    <div className="mt-2 p-2 border rounded-lg">
                      <img 
                        src={imageData.url} 
                        alt="Preview" 
                        className="max-w-full h-32 object-cover rounded"
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
              </TabsContent>
            </Tabs>
            
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
