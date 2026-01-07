import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Clock, Eye, Heart, Share2, MessageCircle, ThumbsUp, Instagram, Linkedin, Facebook, Globe, Send, Edit, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/BookmarkButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { articleService, Article, Comment } from "@/services/articleService";
import { userService, User } from "@/services/userService";
import AdUnit from "@/components/AdUnit";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/AuthDialog";

interface RelatedArticle {
  id: string | number;
  title: string;
  image: string;
  date: string;
  category: string;
}

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [authorData, setAuthorData] = useState<User | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [hasAd, setHasAd] = useState(false); // Control ad visibility
  const { toast } = useToast();
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogMessage, setAuthDialogMessage] = useState({ title: "", description: "" });
  const commentsRef = useRef<HTMLDivElement>(null);
  const [newComment, setNewComment] = useState("");

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    if (!article) return;

    if (!user) {
      setAuthDialogMessage({
        title: "Sign in to comment",
        description: "Join the discussion by signing in to your account."
      });
      setShowAuthDialog(true);
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      author: user.name || "Anonymous",
      content: newComment,
      date: new Date().toLocaleDateString(),
      avatar: user.avatar
    };

    const updatedArticle = await articleService.addComment(article.id, comment);
    if (updatedArticle) {
      setArticle(updatedArticle);
      setNewComment("");
      toast({
        title: "Success",
        description: "Comment posted successfully.",
      });
    }
  };

  const handleCommentClick = () => {
    if (!user) {
      setAuthDialogMessage({
        title: "Sign in to comment",
        description: "Join the discussion by signing in to your account."
      });
      setShowAuthDialog(true);
      return;
    }
    commentsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLike = async () => {
    if (!article) return;
    
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    
    // Update article stats
    const change = newIsLiked ? 1 : -1;
    const updated = await articleService.updateLikes(article.id, change);
    if (updated) {
      setArticle(updated);
    }

    // Persist user like state locally
    const likedArticles = JSON.parse(localStorage.getItem('liked_articles') || '[]');
    if (newIsLiked) {
      if (!likedArticles.includes(String(article.id))) {
        localStorage.setItem('liked_articles', JSON.stringify([...likedArticles, String(article.id)]));
      }
    } else {
      localStorage.setItem('liked_articles', JSON.stringify(likedArticles.filter((id: string) => id !== String(article.id))));
    }
  };

  useEffect(() => {
    const fetchArticleData = async () => {
      if (!id) return;
      
      // Check if user already liked this article
      const likedArticles = JSON.parse(localStorage.getItem('liked_articles') || '[]');
      if (likedArticles.includes(String(id))) {
        setIsLiked(true);
      }

      // Increment views if not already viewed in this session
      const sessionKey = `viewed-article-${id}`;
      let foundArticle = await articleService.getArticleById(id);
      
      if (foundArticle && !sessionStorage.getItem(sessionKey)) {
        const updated = await articleService.incrementViews(id);
        if (updated) {
          foundArticle = updated;
          sessionStorage.setItem(sessionKey, 'true');
        }
      }

      if (foundArticle) {
        setArticle(foundArticle);
        
        // Fetch author data
        const users = userService.getAllUsers();
        const author = users.find(u => u.name === foundArticle!.author);
        setAuthorData(author || null);
        
        // Get related articles (exclude current one)
        const allArticles = await articleService.getPublishedArticles();
      const otherArticles = allArticles.filter(a => String(a.id) !== String(id));
      
      // Filter by tags first, then category
      let related = otherArticles.filter(a => 
        a.tags?.some(tag => foundArticle.tags?.includes(tag))
      );

      // If not enough tag matches, add category matches
      if (related.length < 5) {
        const categoryMatches = otherArticles.filter(a => 
          a.category === foundArticle.category && !related.find(r => r.id === a.id)
        );
        related = [...related, ...categoryMatches];
      }

      // If still not enough, add random articles to fill up
      if (related.length < 10) {
        const remaining = otherArticles.filter(a => !related.find(r => r.id === a.id));
        const shuffled = [...remaining].sort(() => 0.5 - Math.random());
        related = [...related, ...shuffled.slice(0, 10 - related.length)];
      }

      // Map to RelatedArticle format
      const selected = related.map(a => ({
        id: a.id,
        title: a.title,
        image: a.image || "",
        date: a.date,
        category: a.category
      }));
      
      setRelatedArticles(selected);
    } else {
      // Article not found handling
      console.log("Article not found with ID:", id);
      setArticle(null); // Ensure it's null
    }
  };
  fetchArticleData();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const articleElement = document.getElementById('article-content');
      if (articleElement) {
        const scrollTop = window.scrollY;
        const articleTop = articleElement.offsetTop;
        const articleHeight = articleElement.offsetHeight;
        const windowHeight = window.innerHeight;
        
        const progress = Math.min(100, Math.max(0, 
          ((scrollTop - articleTop + windowHeight) / articleHeight) * 100
        ));
        setReadingProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };

  if (!article) {
    // If we've tried to load and it's still null, and we have an ID, it means not found
    if (id) {
       return (
         <div className="min-h-screen flex flex-col items-center justify-center">
           <Navbar />
           <div className="text-center pt-20">
             <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
             <p className="mb-4">We couldn't find the article you're looking for.</p>
             <Button onClick={() => navigate('/')}>Go Home</Button>
           </div>
           <Footer />
         </div>
       );
    }
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-secondary z-50">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <main className="pt-6">
        {/* Article Header */}
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <article>
                <header className="mb-8">
                  <div className="mb-4 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(-1)}
                      className="flex items-center space-x-1 px-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="text-base font-medium">Back</span>
                    </Button>
                    <span className="text-muted-foreground text-base">/</span>
                    <span className="text-base font-bold uppercase tracking-tight text-blue-500">
                      {article.category}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-foreground mb-6">
                    {article.title}
                  </h1>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {article.excerpt}
                  </p>

                  {/* Article Meta */}
                  <div className="flex flex-wrap items-center justify-between border-y border-border py-4 mb-8">
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                      <span>by <Link to={`/author/${encodeURIComponent(article.author)}`} className="font-bold text-primary hover:underline">{article.author}</Link></span>
                      <span>{article.date}</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{article.readTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{article.views.toLocaleString()} views</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsLiked(!isLiked)}
                        className={isLiked ? "text-red-500" : ""}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                        <span className="ml-1">{article.likes + (isLiked ? 1 : 0)}</span>
                      </Button>
                      
                      <BookmarkButton 
                        article={{
                          id: article.id,
                          title: article.title,
                          category: article.category,
                          image: article.image,
                          author: article.author,
                          date: article.date,
                        }}
                        variant="minimal"
                        className="text-muted-foreground hover:text-foreground"
                      />
                      
                      <Button variant="ghost" size="sm" onClick={handleShare}>
                        <Share2 className="w-4 h-4" />
                        <span className="ml-1">Share</span>
                      </Button>
                    </div>
                  </div>
                </header>

                {/* Featured Image */}
                <div className="mb-8">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-auto max-h-[700px] object-contain rounded-lg bg-black/5 dark:bg-white/5"
                  />
                </div>

                {/* Article Content */}
                <div 
                  id="article-content"
                  className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-blockquote:text-foreground prose-code:text-foreground"
                >
                  {(() => {
                    try {
                      if (!article.content) return null;
                      
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
                          
                          const parseCell = (text: string) => {
                            let content = text;
                            content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
                            content = content.replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded">$1</code>');
                            content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>');
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
                          
                          i = j - 1;
                          continue;
                        }

                        if (line.startsWith('# ')) {
                          elements.push(<h1 key={key} className="text-3xl font-bold mt-8 mb-4">{line.replace('# ', '')}</h1>);
                        } else if (line.startsWith('## ')) {
                          elements.push(<h2 key={key} className="text-2xl font-bold mt-6 mb-3">{line.replace('## ', '')}</h2>);
                        } else if (line.startsWith('### ')) {
                          elements.push(<h3 key={key} className="text-xl font-bold mt-4 mb-2">{line.replace('### ', '')}</h3>);
                        } else if (line.startsWith('• ') || line.startsWith('- ')) {
                          elements.push(<li key={key} className="ml-4">{line.replace(/^(\•|-)\s/, '')}</li>);
                        } else if (line.startsWith('> ')) {
                          elements.push(<blockquote key={key} className="border-l-4 border-primary pl-4 italic">{line.replace('> ', '')}</blockquote>);
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
                        } else {
                           // Fallback for paragraph with inline formatting
                           let content = line;
                           content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                           content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
                           content = content.replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded">$1</code>');
                           content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>');
                           
                           if (line.trim() === '') {
                             elements.push(<br key={key} />);
                           } else {
                             elements.push(<p key={key} dangerouslySetInnerHTML={{ __html: content }} />);
                           }
                        }
                      }
                      return elements;
                    } catch (error) {
                      console.error("Error rendering article content:", error);
                      return (
                        <div className="p-4 border border-red-200 bg-red-50 text-red-800 rounded-md">
                          <p className="font-bold">Error rendering content</p>
                          <p className="text-sm">There was an issue displaying this article. Please try editing it to fix any formatting issues.</p>
                        </div>
                      );
                    }
                  })()}
                </div>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-border">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Article Actions */}
                <div className="mt-8 pt-8 border-t border-border flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={handleLike}
                      className={isLiked ? "border-red-500 text-red-500" : ""}
                    >
                      <ThumbsUp className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                      Like ({article.likes})
                    </Button>
                    
                    <Button variant="outline" onClick={handleCommentClick}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Comment
                    </Button>
                  </div>
                  
                  <Button onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Article
                  </Button>
                </div>

                {/* Author Bio Section */}
                {authorData && (authorData.bio || authorData.socialLinks) && (
                  <div className="mt-8 pt-8 border-t border-border">
                    <div className="flex flex-col md:flex-row gap-6 items-start bg-secondary/30 p-6 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-2xl font-bold text-primary">
                          {authorData.avatar ? (
                            <img src={authorData.avatar} alt={authorData.name} className="w-full h-full object-cover" />
                          ) : (
                            authorData.name.charAt(0).toUpperCase()
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2 text-foreground">About {authorData.name}</h3>
                        {authorData.bio && (
                          <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                            {authorData.bio}
                          </p>
                        )}
                        
                        {authorData.socialLinks && (
                          <div className="flex items-center space-x-4">
                            {authorData.socialLinks.instagram && (
                              <a href={authorData.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-pink-600 transition-colors">
                                <Instagram className="w-5 h-5" />
                              </a>
                            )}
                            {authorData.socialLinks.linkedin && (
                              <a href={authorData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-700 transition-colors">
                                <Linkedin className="w-5 h-5" />
                              </a>
                            )}
                            {authorData.socialLinks.twitter && (
                              <a href={authorData.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Twitter className="w-5 h-5" />
                              </a>
                            )}
                            {authorData.socialLinks.facebook && (
                              <a href={authorData.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-600 transition-colors">
                                <Facebook className="w-5 h-5" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Comments Section */}
                <div className="mt-8 pt-8 border-t border-border" ref={commentsRef}>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Comments ({article.comments?.length || 0})
                  </h3>

                  {/* Comment Form */}
                  <div className="mb-8 bg-secondary/30 p-6 rounded-lg">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        {user && (
                          <Avatar>
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1">
                          <Textarea 
                            placeholder="Share your thoughts..." 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[100px] mb-2"
                          />
                          <div className="flex justify-end">
                            <Button onClick={handleCommentSubmit} disabled={!newComment.trim()}>
                              <Send className="w-4 h-4 mr-2" />
                              Post Comment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comment List */}
                  <div className="space-y-6">
                    {article.comments && article.comments.length > 0 ? (
                      article.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                          <Avatar>
                            <AvatarImage src={comment.avatar} />
                            <AvatarFallback>{comment.author.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-background border border-border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-sm">{comment.author}</span>
                                <span className="text-xs text-muted-foreground">{comment.date}</span>
                              </div>
                              <p className="text-sm text-foreground">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8 italic">
                        No comments yet. Be the first to share your thoughts!
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Ad Unit */}
                <AdUnit slot="1234567890" className="mt-8" />
              </article>
            </div>

            {/* Sidebar - Related Articles */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-background border border-border rounded-lg p-6">
                  <div className="mb-6">
                    <h2 className="inline-block text-lg font-bold text-background bg-foreground px-3 py-2 text-sm uppercase tracking-wide rounded">
                      RELATED POSTS
                    </h2>
                  </div>
                  
                  <div className="divide-y divide-border">
                    {relatedArticles.map((relatedArticle) => (
                      <article 
                        key={relatedArticle.id}
                        className="py-4 group cursor-pointer first:pt-0 last:pb-0"
                        onClick={() => navigate(`/article/${relatedArticle.id}`)}
                      >
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <img
                              src={relatedArticle.image}
                              alt={relatedArticle.title}
                              className="w-28 h-20 object-contain bg-muted rounded-md group-hover:opacity-80 transition-opacity"
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1">
                              {relatedArticle.title}
                            </h3>
                            <div className="text-xs text-muted-foreground">
                              <span>Published: {relatedArticle.date}</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-border">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/search')}
                    >
                      View All Articles
                    </Button>
                  </div>
                </div>
                
                {/* Ad Space - Only show when hasAd is true */}
                {hasAd && (
                  <div className="bg-muted border border-border rounded-lg p-6 text-center">
                    <div className="text-muted-foreground text-sm mb-2">Advertisement</div>
                    <div className="bg-background border-2 border-dashed border-border rounded-lg p-8">
                      <p className="text-muted-foreground text-xs">Ad Space Available</p>
                      <p className="text-muted-foreground text-xs mt-1">300x250</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Spacer before footer */}
      <div className="py-16"></div>
      
      <Footer />
      
      <AuthDialog 
        isOpen={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        title={authDialogMessage.title || "Sign in required"}
        description={authDialogMessage.description || "You need to be signed in to perform this action."}
      />
    </div>
  );
};

export default ArticleDetail;
