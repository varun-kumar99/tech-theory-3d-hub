import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  FileText, 
  Image, 
  Bold, 
  Italic, 
  List, 
  Link,
  Quote,
  Code,
  Type,
  Palette,
  Upload,
  Tag,
  Calendar,
  Clock,
  BookOpen
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Article {
  title: string;
  category: string;
  content: string;
  excerpt: string;
  tags: string[];
  status: 'draft' | 'published';
  coverImage: string;
  readTime: string;
}

const CreateArticle = () => {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [article, setArticle] = useState<Article>({
    title: "",
    category: "",
    content: "",
    excerpt: "",
    tags: [],
    status: "draft",
    coverImage: "",
    readTime: "5 min read"
  });
  
  const [newTag, setNewTag] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (article.title || article.content) {
        localStorage.setItem('draft-article', JSON.stringify(article));
      }
    }, 2000);

    return () => clearTimeout(autoSave);
  }, [article]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('draft-article');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setArticle(draft);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  // Update word and character count
  useEffect(() => {
    const words = article.content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const chars = article.content.length;
    setWordCount(words);
    setCharCount(chars);
    
    // Estimate read time (200 words per minute)
    const readTime = Math.max(1, Math.ceil(words / 200));
    setArticle(prev => ({ ...prev, readTime: `${readTime} min read` }));
  }, [article.content]);

  const insertText = (before: string, after: string = '') => {
    if (!contentRef.current) return;

    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = article.content.substring(start, end);
    const newText = article.content.substring(0, start) + before + selectedText + after + article.content.substring(end);
    
    setArticle(prev => ({ ...prev, content: newText }));
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const formatToolbar = [
    { icon: Bold, label: "Bold", action: () => insertText("**", "**") },
    { icon: Italic, label: "Italic", action: () => insertText("*", "*") },
    { icon: Quote, label: "Quote", action: () => insertText("> ") },
    { icon: Code, label: "Code", action: () => insertText("`", "`") },
    { icon: List, label: "List", action: () => insertText("- ") },
    { icon: Link, label: "Link", action: () => insertText("[", "](url)") },
  ];

  const addTag = () => {
    if (newTag.trim() && !article.tags.includes(newTag.trim())) {
      setArticle(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setArticle(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!article.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please add a title to your article",
        variant: "destructive"
      });
      return;
    }

    if (!article.content.trim()) {
      toast({
        title: "Content Required", 
        description: "Please add content to your article",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedArticle = {
        ...article,
        status,
        id: Date.now().toString(),
        publishDate: status === 'published' ? new Date().toISOString() : undefined
      };

      // Here you would normally send to your backend
      console.log('Saving article:', savedArticle);
      
      // Clear draft
      localStorage.removeItem('draft-article');
      
      toast({
        title: status === 'published' ? "Article Published!" : "Draft Saved!",
        description: status === 'published' 
          ? "Your article is now live and visible to readers"
          : "Your article has been saved as a draft"
      });

      // Navigate back to dashboard
      navigate('/admin/author-dashboard');
      
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "There was an error saving your article. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreview = () => {
    if (!article.content) return <p className="text-muted-foreground">Start writing to see preview...</p>;
    
    return (
      <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-blockquote:text-foreground prose-code:text-foreground">
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        {article.excerpt && (
          <p className="text-lg text-muted-foreground mb-6 italic">{article.excerpt}</p>
        )}
        <div dangerouslySetInnerHTML={{ 
          __html: article.content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded">$1</code>')
            .replace(/^> (.+)/gm, '<blockquote class="border-l-4 border-primary pl-4 italic">$1</blockquote>')
            .replace(/^- (.+)/gm, '<li>$1</li>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>')
            .replace(/\n/g, '<br>')
        }} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Create Article</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Type className="h-4 w-4" />
                <span>{wordCount} words</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{article.readTime}</span>
              </div>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="outline"
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">{isPreview ? 'Edit' : 'Preview'}</span>
            </Button>
            <Button
              onClick={() => handleSave('draft')}
              variant="outline"
              disabled={isSaving}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save Draft</span>
            </Button>
            <Button
              onClick={() => handleSave('published')}
              disabled={isSaving}
              className="flex items-center space-x-2"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Publish</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Article Meta */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-base font-medium">Article Title</Label>
                <Input
                  id="title"
                  value={article.title}
                  onChange={(e) => setArticle(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your article title..."
                  className="text-lg h-12 mt-2"
                />
              </div>

              <div>
                <Label htmlFor="excerpt" className="text-base font-medium">Excerpt (Optional)</Label>
                <Textarea
                  id="excerpt"
                  value={article.excerpt}
                  onChange={(e) => setArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Write a brief excerpt or summary..."
                  className="mt-2 resize-none"
                  rows={2}
                />
              </div>
            </div>

            {/* Content Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Content</Label>
                <div className="text-sm text-muted-foreground">
                  {charCount} characters • {wordCount} words
                </div>
              </div>

              {!isPreview ? (
                <div className="space-y-3">
                  {/* Formatting Toolbar */}
                  <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-lg border">
                    {formatToolbar.map((tool, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={tool.action}
                        className="h-8 w-8 p-0"
                        title={tool.label}
                      >
                        <tool.icon className="h-4 w-4" />
                      </Button>
                    ))}
                    <Separator orientation="vertical" className="h-6 mx-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertText("![Alt text](image-url)")}
                      className="h-8 px-2"
                      title="Insert Image"
                    >
                      <Image className="h-4 w-4 mr-1" />
                      <span className="text-xs">Image</span>
                    </Button>
                  </div>

                  {/* Content Textarea */}
                  <Textarea
                    ref={contentRef}
                    value={article.content}
                    onChange={(e) => setArticle(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Start writing your article...

You can use markdown formatting:
**Bold text**
*Italic text*
> Quote
`Code`
- List item
[Link text](url)"
                    className="min-h-[500px] font-mono text-sm leading-relaxed resize-none"
                  />
                </div>
              ) : (
                <div className="min-h-[500px] p-6 bg-muted/30 rounded-lg border">
                  {renderPreview()}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="font-semibold flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Publish Settings</span>
              </h3>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={article.category} onValueChange={(value) => setArticle(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="AI">Artificial Intelligence</SelectItem>
                    <SelectItem value="Web Development">Web Development</SelectItem>
                    <SelectItem value="Mobile">Mobile Development</SelectItem>
                    <SelectItem value="Design">Design & UX</SelectItem>
                    <SelectItem value="DevOps">DevOps</SelectItem>
                    <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                    <SelectItem value="Cloud">Cloud Computing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cover-image">Cover Image URL (Optional)</Label>
                <Input
                  id="cover-image"
                  value={article.coverImage}
                  onChange={(e) => setArticle(prev => ({ ...prev, coverImage: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="font-semibold flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>Tags</span>
              </h3>
              
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1"
                />
                <Button onClick={addTag} size="sm">Add</Button>
              </div>
              
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Article Stats */}
            <div className="p-4 border rounded-lg space-y-3">
              <h3 className="font-semibold">Article Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Words:</span>
                  <span className="font-medium">{wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Characters:</span>
                  <span className="font-medium">{charCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Read time:</span>
                  <span className="font-medium">{article.readTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                    {article.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Auto-save Indicator */}
            <div className="text-xs text-muted-foreground text-center py-2">
              Auto-saving draft...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateArticle;
