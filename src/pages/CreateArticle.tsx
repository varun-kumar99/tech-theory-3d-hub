import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  BookOpen,
  Sparkles,
  Loader2,
  Underline,
  Heading1,
  Heading2,
  Table as TableIcon
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { aiService } from "@/services/aiService";
import { articleService, Article } from "@/services/articleService";
import { NAV_CATEGORIES } from "@/constants/categories";

interface ArticleFormData {
  title: string;
  category: string;
  subCategory?: string;
  content: string;
  excerpt: string;
  tags: string[];
  status: 'draft' | 'published';
  coverImage: string;
  readTime: string;
  localImages: Record<string, string>;
  isTrending: boolean;
  priority: 'high' | 'medium' | 'low';
}

const CreateArticle = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [originalArticle, setOriginalArticle] = useState<Article | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [article, setArticle] = useState<ArticleFormData>({
    title: "",
    category: "",
    subCategory: "",
    content: "",
    excerpt: "",
    tags: [],
    status: "draft",
    coverImage: "",
    readTime: "5 min read",
    localImages: {},
    isTrending: false,
    priority: "medium"
  });
  
  const [newTag, setNewTag] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Quick Edit States
  const [editorState, setEditorState] = useState({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    textColor: "#000000",
    textType: "body" // heading, subheading, body
  });
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageData, setImageData] = useState({
    url: "",
    altText: "",
    file: null as File | null
  });

  const [showAiDialog, setShowAiDialog] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<'Ben' | 'Gwen' | 'Max'>('Ben');

  const API_KEYS = {
    Ben: import.meta.env.VITE_GEMINI_API_KEY || "",
    Gwen: import.meta.env.VITE_GEMINI_API_KEY_GWEN || "",
    Max: import.meta.env.VITE_GEMINI_API_KEY_MAX || ""
  };

  const apiKey = API_KEYS[selectedPersona];
  const tavilyApiKey = import.meta.env.VITE_TAVILY_API_KEY || "";
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentUser, setCurrentUser] = useState<{name: string, email: string} | null>(null);

  // Load current user
  useEffect(() => {
    const auth = localStorage.getItem("admin-auth");
    if (auth) {
      try {
        const authData = JSON.parse(auth);
        if (authData?.user) {
          setCurrentUser(authData.user);
        }
      } catch (error) {
        console.error("Error parsing auth data:", error);
      }
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (article.title || article.content) {
        localStorage.setItem('draft-article', JSON.stringify(article));
      }
    }, 2000);

    return () => clearTimeout(autoSave);
  }, [article]);

  // Load draft or existing article on mount
  useEffect(() => {
    const loadArticle = async () => {
      const editId = searchParams.get('edit');
      if (editId) {
        const foundArticle = await articleService.getArticleById(editId);
        if (foundArticle) {
          setOriginalArticle(foundArticle);
          setArticle({
            title: foundArticle.title,
            category: foundArticle.category,
            subCategory: foundArticle.subCategory,
            content: foundArticle.content,
            excerpt: foundArticle.excerpt,
            tags: foundArticle.tags || [],
            status: foundArticle.status as 'draft' | 'published',
            coverImage: foundArticle.image || "",
            readTime: foundArticle.readTime || "5 min read",
            localImages: foundArticle.localImages || {},
            isTrending: foundArticle.isTrending || false,
            priority: foundArticle.priority || 'medium'
          });
          return;
        }
      }

      const savedDraft = localStorage.getItem('draft-article');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setArticle(draft);
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    };
    
    loadArticle();
  }, [searchParams]);

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

  // Enhanced Text Insertion and Formatting Logic
  const insertText = (text: string) => {
    const textarea = contentRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const content = article.content;
      
      const newContent = content.substring(0, start) + text + content.substring(end);
      
      setArticle(prev => ({
        ...prev,
        content: newContent
      }));
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    } else {
      setArticle(prev => ({
        ...prev,
        content: prev.content + text
      }));
    }
  };

  const insertTextType = (type: 'heading' | 'subheading' | 'body') => {
    const textarea = contentRef.current;
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
      setArticle(prev => ({ ...prev, content: newContent }));
      
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + formattedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
    
    setEditorState(prev => ({ ...prev, textType: type }));
  };

  const formatText = (format: string) => {
    const textarea = contentRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      
      if (selectedText) {
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
        setArticle(prev => ({ ...prev, content: newContent }));
      } else {
        // No text selected, just insert markers
         let marker = '';
         switch (format) {
            case 'Bold': marker = '**'; break;
            case 'Italic': marker = '*'; break;
            case 'Underline': marker = '<u></u>'; break; // Special case, maybe just tag
         }
         // For now, let's just stick to wrapping if selected, or toggle state (simulated)
         // If no selection, we could insert placeholders or just toggle the state visually
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
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageData({
          file: file,
          url: result,
          altText: imageData.altText
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const insertImage = () => {
    if (imageData.url && imageData.altText) {
      const cleanAltText = imageData.altText.replace(/\[/g, '').replace(/\]/g, '').replace(/\s+/g, '-');
      
      let imageUrl = imageData.url;
      let newStateUpdate = {};

      if (imageUrl.startsWith('data:')) {
        const uniqueId = `local-image-${Date.now()}-${cleanAltText}`;
        newStateUpdate = {
          localImages: {
            ...article.localImages,
            [uniqueId]: imageUrl
          }
        };
        imageUrl = uniqueId;
      }

      const imageMarkdown = `![${cleanAltText}](${imageUrl})`;
      
      setArticle(prev => {
        const content = prev.content;
        const insertPos = (cursorPosition !== null && cursorPosition >= 0 && cursorPosition <= content.length) 
                          ? cursorPosition 
                          : content.length;
        
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
            const cleanFileName = file.name.replace(/\[/g, '').replace(/\]/g, '').replace(/\s+/g, '-');
            const uniqueId = `local-image-${Date.now()}-${cleanFileName}`;
            const imageMarkdown = `\n![${cleanFileName}](${uniqueId})\n`;
            
            setArticle(prev => {
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
              title: "Image Added",
              description: "Image added to content successfully.",
            });
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

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

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    try {
      const generatedData = await aiService.generateArticle({
        topic: aiTopic,
        type: 'blog-post',
        geminiApiKey: apiKey,
        tavilyApiKey: tavilyApiKey
      });

      setArticle(prev => ({
        ...prev,
        title: generatedData.title,
        content: generatedData.content,
        excerpt: generatedData.excerpt,
        tags: [...prev.tags, ...generatedData.tags],
        category: generatedData.category || prev.category,
        subCategory: generatedData.subCategory || ""
      }));

      setShowAiDialog(false);
      toast({
        title: "Content Generated!",
        description: `The AI has successfully researched and written your draft.${tavilyApiKey ? ' (Research included)' : ''}`,
      });
    } catch (error: unknown) {
      console.error("Full generation error:", error);
      const message = error instanceof Error ? error.message : "There was an error generating the article.";
      toast({
        title: "Generation Failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
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
      // Filter out unused images
      const usedLocalImages: Record<string, string> = {};
      if (article.localImages) {
        Object.keys(article.localImages).forEach(key => {
          if (article.content.includes(key)) {
            usedLocalImages[key] = article.localImages[key];
          }
        });
      }

      const savedArticle: Article = {
        id: originalArticle ? originalArticle.id : Date.now().toString(),
        title: article.title,
        content: article.content,
        category: article.category,
        subCategory: article.subCategory,
        excerpt: article.excerpt || articleService.generateExcerpt(article.content),
        status: status,
        date: originalArticle ? originalArticle.date : new Date().toISOString().split('T')[0],
        author: originalArticle ? originalArticle.author : (currentUser?.name || "Author"),
        authorEmail: originalArticle?.authorEmail || currentUser?.email,
        views: originalArticle ? originalArticle.views : 0,
        likes: originalArticle ? originalArticle.likes : 0,
        readTime: article.readTime,
        tags: article.tags,
        image: article.coverImage || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
        localImages: usedLocalImages,
        comments: originalArticle ? originalArticle.comments : [],
        isTrending: article.isTrending,
        priority: article.priority
      };

      await articleService.saveArticle(savedArticle);
      
      localStorage.removeItem('draft-article');
      
      toast({
        title: status === 'published' ? (originalArticle ? "Article Updated!" : "Article Published!") : "Draft Saved!",
        description: status === 'published' 
          ? "Your article is now live and visible to readers"
          : "Your article has been saved as a draft"
      });

      if (originalArticle) {
        navigate(`/article/${originalArticle.id}`);
      } else {
        navigate('/admin/author-dashboard');
      }
      
    } catch (error: any) {
      console.error("Save error:", error);
      let errorMessage = "There was an error saving your article. Please try again.";
      
      if (error.name === 'QuotaExceededError' || error.message?.includes('quota') || error.code === 22) {
        errorMessage = "Storage full! Your article contains too many large images. Please try removing some images or compressing them.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreview = () => {
    if (!article.content) return <p className="text-muted-foreground">Start writing to see preview...</p>;
    
    const formatTextContent = (text: string) => {
      let content = text;
      // Handle bold (**text**)
      content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Handle italic (*text*)
      content = content.replace(/\*(.+?)\*/g, '<em>$1</em>');
      // Handle inline code (`text`)
      content = content.replace(/`(.+?)`/g, '<code class="bg-muted px-1 rounded">$1</code>');
      // Handle links ([text](url))
      content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline" target="_blank" rel="noopener noreferrer">$1</a>');
      return content;
    };

    return (
      <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-blockquote:text-foreground prose-code:text-foreground">
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        {article.excerpt && (
          <p className="text-lg text-muted-foreground mb-6 italic">{article.excerpt}</p>
        )}
        <div>
          {(() => {
            const lines = article.content.split('\n');
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
                while (j < lines.length && lines[j].trim().startsWith('|')) {
                  tableLines.push(lines[j]);
                  j++;
                }
                
                const headers = tableLines[0].split('|').filter(c => c.trim() !== '').map(c => c.trim());
                const rows = tableLines.slice(2).map(rowLine => 
                  rowLine.split('|').filter(c => c.trim() !== '').map(c => c.trim())
                );
                
                elements.push(
                  <div key={`table-${key}`} className="overflow-x-auto my-4">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          {headers.map((header, hIdx) => (
                            <th key={hIdx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r last:border-r-0">
                              <span dangerouslySetInnerHTML={{ __html: formatTextContent(header) }} />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 border-r last:border-r-0">
                                <span dangerouslySetInnerHTML={{ __html: formatTextContent(cell) }} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
                
                i = j - 1;
                continue;
              }

              // Regex for headings to handle variable spacing
              const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
              
              if (headingMatch) {
                const level = headingMatch[1].length;
                const content = headingMatch[2];
                const formattedContent = formatTextContent(content);
                
                if (level === 1) {
                  elements.push(<h1 key={key} className="text-3xl font-bold mt-8 mb-4" dangerouslySetInnerHTML={{ __html: formattedContent }} />);
                } else if (level === 2) {
                  elements.push(<h2 key={key} className="text-2xl font-bold mt-6 mb-3" dangerouslySetInnerHTML={{ __html: formattedContent }} />);
                } else if (level === 3) {
                  elements.push(<h3 key={key} className="text-xl font-bold mt-4 mb-2" dangerouslySetInnerHTML={{ __html: formattedContent }} />);
                }
              } else if (line.startsWith('• ') || line.startsWith('- ')) {
                elements.push(<li key={key} className="ml-4" dangerouslySetInnerHTML={{ __html: formatTextContent(line.replace(/^(\•|-)\s/, '')) }} />);
              } else if (line.startsWith('> ')) {
                elements.push(<blockquote key={key} className="border-l-4 border-primary pl-4 italic" dangerouslySetInnerHTML={{ __html: formatTextContent(line.replace('> ', '')) }} />);
              } else if (line.includes('![') && line.includes('](')) {

                const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
                if (imageMatch) {
                  const [, altText, imageUrl] = imageMatch;
                  let displayUrl = imageUrl;
                  if (imageUrl.startsWith('local-image-') && article.localImages && article.localImages[imageUrl]) {
                    displayUrl = article.localImages[imageUrl];
                  }
                  elements.push(
                    <img key={key} src={displayUrl} alt={altText} className="w-full h-auto max-h-[600px] object-contain rounded-lg my-8 shadow-md bg-black/5 dark:bg-white/5" />
                  );
                }
              } else if (line.trim().startsWith('<iframe') && line.trim().endsWith('</iframe>')) {
                // Support for HTML embeds (like YouTube)
                elements.push(<div key={key} className="my-8 aspect-video" dangerouslySetInnerHTML={{ __html: line }} />);
              } else {
                 if (line.trim() === '') {
                   elements.push(<br key={key} />);
                 } else {
                   elements.push(<p key={key} dangerouslySetInnerHTML={{ __html: formatTextContent(line) }} />);
                 }
              }
            }
            return elements;
          })()}
        </div>
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
            
            <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2 gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30">
                  <Sparkles className="h-4 w-4" />
                  AI Writer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>AI Article Writer</DialogTitle>
                  <DialogDescription>
                    Enter your instructions for the AI. You can specify the topic, tone, structure, or ask to include specific elements like YouTube video embeds.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ai-topic">Instructions / Prompt</Label>
                    <Textarea
                      id="ai-topic"
                      placeholder="E.g. Write a comprehensive guide about the latest iPhone 16 features. Include a YouTube video review and compare it with the previous model."
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAiDialog(false)}>Cancel</Button>
                  <Button onClick={handleAiGenerate} disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Draft
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Select value={selectedPersona} onValueChange={(value: 'Ben' | 'Gwen' | 'Max') => setSelectedPersona(value)}>
              <SelectTrigger className="w-[100px] h-9 ml-2">
                <SelectValue placeholder="Persona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ben">Ben</SelectItem>
                <SelectItem value="Gwen">Gwen</SelectItem>
                <SelectItem value="Max">Max</SelectItem>
              </SelectContent>
            </Select>
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
                  {/* Rich Text Toolbar - Updated with Quick Edit features */}
                  <TooltipProvider>
                    <div className="sticky top-0 z-10 bg-background flex flex-wrap gap-2 mb-4 border-b pb-3 pt-2">
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

                      <Separator orientation="vertical" className="h-8" />

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={editorState.textType === 'heading' ? "default" : "outline"}
                            size="sm"
                            onClick={() => insertTextType('heading')}
                          >
                            <Heading1 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Heading 1</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={editorState.textType === 'subheading' ? "default" : "outline"}
                            size="sm"
                            onClick={() => insertTextType('subheading')}
                          >
                            <Heading2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Heading 2</p>
                        </TooltipContent>
                      </Tooltip>

                      <Separator orientation="vertical" className="h-8" />
                      
                      <Tooltip>
                         <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => insertTextType('body')}>
                               <Type className="w-4 h-4" />
                            </Button>
                         </TooltipTrigger>
                         <TooltipContent>
                            <p>Body Text</p>
                         </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => insertText('\n- ')}>
                            <List className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Bullet List</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => insertText('\n> ')}>
                            <Quote className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Blockquote</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => insertText('`', '`')}>
                            <Code className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Inline Code</p>
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
                              const textarea = contentRef.current;
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
                            <TableIcon className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Insert Table</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>

                  {/* Content Textarea */}
                  <Textarea
                    ref={contentRef}
                    value={article.content}
                    onChange={(e) => setArticle(prev => ({ ...prev, content: e.target.value }))}
                    onPaste={handlePaste}
                    placeholder="Start writing your article here..."
                    className="min-h-[500px] font-mono text-sm leading-relaxed resize-none bg-background text-foreground"
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
                <Select 
                  value={article.category} 
                  onValueChange={(value) => {
                    setArticle(prev => ({ ...prev, category: value, subCategory: "" }));
                  }}
                >
                  <SelectTrigger className="mt-1">
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

                {article.category && NAV_CATEGORIES.find(c => c.name === article.category)?.subcategories.length! > 0 && (
                  <div className="mt-3">
                    <Label htmlFor="subCategory">Sub Category (Optional)</Label>
                    <Select 
                      value={article.subCategory} 
                      onValueChange={(value) => setArticle(prev => ({ ...prev, subCategory: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select sub category" />
                      </SelectTrigger>
                      <SelectContent>
                        {NAV_CATEGORIES.find(c => c.name === article.category)?.subcategories.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={article.priority}
                    onValueChange={(value: Article['priority']) => setArticle(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isTrending"
                    checked={article.isTrending}
                    onChange={(e) => setArticle(prev => ({ ...prev, isTrending: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="isTrending" className="cursor-pointer">Trending</Label>
                </div>
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
                {article.coverImage && (
                  <div className="mt-2 relative group">
                    <img 
                      src={article.coverImage} 
                      alt="Cover Preview" 
                      className="h-32 w-full object-contain bg-muted rounded-md border"
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

      {/* Image Upload Dialog - Added from Quick Edit */}
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

export default CreateArticle;
