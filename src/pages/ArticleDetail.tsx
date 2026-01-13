import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Clock, Eye, Heart, Share2, MessageCircle, ThumbsUp, Instagram, Linkedin, Facebook, Globe, Send, Edit, Twitter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/BookmarkButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { articleService, Article, Comment } from "@/services/articleService";
import { userService, User } from "@/services/userService";
import AdUnit from "@/components/AdUnit";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "@/components/AuthDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface RelatedArticle {
  id: string | number;
  title: string;
  image: string;
  date: string;
  category: string;
}

const ArticleDetailSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-6 flex-1">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-8">
                <Skeleton className="h-6 w-32 mb-4" /> {/* Back button */}
                <Skeleton className="h-12 w-3/4 mb-6" /> {/* Title */}
                <Skeleton className="h-6 w-full mb-6" /> {/* Excerpt line 1 */}
                <Skeleton className="h-6 w-11/12 mb-6" /> {/* Excerpt line 2 */}
                <div className="flex items-center justify-between border-y border-border py-4 mb-8">
                  <div className="flex items-center space-x-6">
                    <Skeleton className="h-4 w-24" /> {/* Author */}
                    <Skeleton className="h-4 w-20" /> {/* Date */}
                    <Skeleton className="h-4 w-20" /> {/* Read time */}
                    <Skeleton className="h-4 w-20" /> {/* Views */}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-16 rounded-md" /> {/* Like button */}
                    <Skeleton className="h-8 w-16 rounded-md" /> {/* Bookmark button */}
                    <Skeleton className="h-8 w-16 rounded-md" /> {/* Share button */}
                  </div>
                </div>
                <Skeleton className="w-full h-[400px] rounded-lg mb-8" /> {/* Featured Image */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-11/12" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-10/12" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-9/12" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div>
                <Skeleton className="h-8 w-full mb-4" /> {/* Ad Unit */}
                <div className="border border-border rounded-lg p-6 mb-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <Skeleton className="size-12 rounded-full" /> {/* Author Avatar */}
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" /> {/* Author Name */}
                      <Skeleton className="h-4 w-1/2" /> {/* Author Title */}
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" /> {/* Author Bio line 1 */}
                  <Skeleton className="h-4 w-11/12 mb-4" /> {/* Author Bio line 2 */}
                  <div className="flex space-x-2">
                    <Skeleton className="size-8 rounded-full" /> {/* Social Icon */}
                    <Skeleton className="size-8 rounded-full" /> {/* Social Icon */}
                    <Skeleton className="size-8 rounded-full" /> {/* Social Icon */}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4">
                  <Skeleton className="h-6 w-48" /> {/* Related Articles Title */}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="size-20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="size-20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="size-20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [article, setArticle] = useState<Article | null>(location.state?.article || null);
  const [loading, setLoading] = useState(!location.state?.article);
  const [authorData, setAuthorData] = useState<User | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [hasAd, setHasAd] = useState(false); // Control ad visibility
  const { toast } = useToast();
  const { user, addToReadingHistory } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogMessage, setAuthDialogMessage] = useState({ title: "", description: "" });
  const commentsRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stickyTop, setStickyTop] = useState(84);
  const lastScrollY = useRef(0);
  const currentTop = useRef(84);

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

    setIsSubmitting(true);
    const comment: Comment = {
      id: Date.now().toString(),
      author: user.name || "Anonymous",
      content: newComment,
      date: new Date().toLocaleDateString(),
      avatar: user.avatar
    };

    try {
      setNewComment("");
      setArticle(prev => {
        if (!prev) return prev;
        const existing = prev.comments ?? [];
        return { ...prev, comments: [...existing, comment] };
      });

      const updatedArticle = await articleService.addComment(article.id, comment);

      if (updatedArticle) {
        setArticle(updatedArticle);
      }

      toast({
        title: "Success",
        description: "Comment posted successfully.",
      });
    } catch (error: unknown) {
      console.error("Comment post failed:", error);
      const err = error as { message?: unknown } | null;
      const message = typeof err?.message === "string" ? err.message : "";
      const isTimeout = message.endsWith("_timeout");

      // Rollback optimistic update on ANY error (including timeout)
      setArticle(prev => {
        if (!prev) return prev;
        const nextComments = (prev.comments ?? []).filter(c => c.id !== comment.id);
        return { ...prev, comments: nextComments };
      });
      // Restore the comment content so user can retry
      setNewComment(comment.content);

      let errorDescription = "Could not post comment. Please try again.";
      if (isTimeout) {
        if (message.includes("profile_check")) errorDescription = "Timed out checking user profile.";
        else if (message.includes("profile_upsert")) errorDescription = "Timed out creating user profile.";
        else if (message.includes("comment_insert")) errorDescription = "Timed out posting comment to database.";
        else errorDescription = "Network timed out. Please check your connection.";
      } else if (message.startsWith("comment_insert:")) {
        errorDescription = `Database rejected comment: ${message.split(':')[1]}`;
      }

      toast({
        title: "Error",
        description: errorDescription,
        variant: "destructive"
      });

    } finally {
      setIsSubmitting(false);
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

    console.log("[ArticleDetail] Like button clicked", { currentLikes: article.likes, isLiked });

    // Optimistic update of count and state
    const newIsLiked = !isLiked;
    const change = newIsLiked ? 1 : -1;
    setIsLiked(newIsLiked);
    setArticle(prev => prev ? { ...prev, likes: Math.max(0, prev.likes + change) } : null);

    // Update article stats in DB
    const updated = await articleService.updateLikes(article.id, change);

    if (updated) {
      setArticle(updated);
    } else {
      // Revert optimistic update if failed
      setIsLiked(!newIsLiked);
      setArticle(prev => prev ? { ...prev, likes: Math.max(0, prev.likes - change) } : null);
      toast({
        title: "Update Failed",
        description: "Failed to update likes. Please try again.",
        variant: "destructive"
      });
    }

    // Persist user like state locally using a normalized id.
    if (updated) {
      const likedArticles = JSON.parse(localStorage.getItem('liked_articles') || '[]');
      // Prefer numeric id when available (handles "15-article-title" cases)
      const rawId = updated.id ?? article.id;
      const numeric = typeof rawId === 'string' ? parseInt(rawId, 10) : rawId;
      const storedId = !isNaN(Number(numeric)) ? String(numeric) : String(rawId);

      if (newIsLiked) {
        if (!likedArticles.includes(storedId)) {
          localStorage.setItem('liked_articles', JSON.stringify([...likedArticles, storedId]));
        }
      } else {
        // Remove any possible variants (numeric or raw) to avoid stale entries
        const rawIdStr = String(rawId);
        const numericStr = !isNaN(Number(numeric)) ? String(numeric) : null;
        const filtered = likedArticles.filter((id: string) => id !== storedId && id !== rawIdStr && id !== numericStr);
        localStorage.setItem('liked_articles', JSON.stringify(filtered));
      }
    }
  };

  useEffect(() => {
    const fetchArticleData = async () => {
      if (!id) return;

      // Only show full page loader if we don't have article data from navigation state
      if (!location.state?.article) {
        setLoading(true);
      }

      try {
        // Quick session cache: show cached article immediately on refresh
        const cacheKey = `cached_article_${id}`;
        const cacheTTL = 5 * 60 * 1000; // 5 minutes
        try {
          const cachedRaw = sessionStorage.getItem(cacheKey);
          if (cachedRaw) {
            const parsed = JSON.parse(cachedRaw);
            if (parsed?.ts && (Date.now() - parsed.ts) < cacheTTL && parsed.article) {
              setArticle(parsed.article as Article);
              setLoading(false);
              // continue to refresh in background
            }
          }
        } catch (e) {
          console.warn('Failed to read article cache', e);
        }

        // Check if user already liked this article.
        // Route `id` may include a slug (e.g. "15-article-title"), so parse numeric id too.
        const likedArticles = JSON.parse(localStorage.getItem('liked_articles') || '[]');
        const routeNumeric = typeof id === 'string' ? parseInt(id, 10) : id;
        const routeNumericStr = !isNaN(Number(routeNumeric)) ? String(routeNumeric) : null;
        if (likedArticles.includes(String(id)) || (routeNumericStr && likedArticles.includes(routeNumericStr))) {
          setIsLiked(true);
        }

        // Increment views if not already viewed in this session
        const sessionKey = `viewed-article-${id}`;

        // Retry logic for fetching article
        let foundArticle = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts && !foundArticle) {
          attempts++;
          try {
            foundArticle = await articleService.getArticleById(id);
            if (!foundArticle && attempts < maxAttempts) {
              // Wait before retrying (exponential backoff: 300ms, 600ms, 1200ms)
              await new Promise(resolve => setTimeout(resolve, 300 * attempts));
            }
          } catch (e) {
            console.warn(`Attempt ${attempts} failed:`, e);
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 300 * attempts));
            }
          }
        }

        if (foundArticle) {
          // update cache with fresh article data
          try {
            const cacheKey = `cached_article_${id}`;
            sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), article: foundArticle }));
          } catch (e) {
            console.warn('Failed to write article cache', e);
          }
          // Render the article immediately so the user sees content fast.
          // We'll perform non-critical network work (increment views,
          // author lookup, related articles) asynchronously in the
          // background so the page feels snappy.

          // Ensure likes reflect local optimistic state
          const foundIdStr = String(foundArticle.id);
          if ((likedArticles.includes(String(id)) || (routeNumericStr && likedArticles.includes(routeNumericStr)) || likedArticles.includes(foundIdStr)) && foundArticle.likes === 0) {
            foundArticle = { ...foundArticle, likes: 1 };
          }

          setArticle(foundArticle);

          // Add to reading history
          if (user && foundArticle.id) {
            const sessionViewKey = `viewed_article_session_${foundArticle.id}`;
            if (!sessionStorage.getItem(sessionViewKey)) {
              addToReadingHistory(foundArticle.id);
              sessionStorage.setItem(sessionViewKey, 'true');
            }
          }

          // Fire-and-forget increment views (do not block rendering)
          if (!sessionStorage.getItem(sessionKey)) {
            articleService.incrementViews(id)
              .then(updated => {
                if (updated) {
                  setArticle(prev => {
                    const next = prev ? { ...prev, views: updated.views } : prev;
                    try {
                      sessionStorage.setItem(`cached_article_${id}`, JSON.stringify({ ts: Date.now(), article: next }));
                    } catch (e) {
                      // ignore cache write failures
                    }
                    return next;
                  });
                  sessionStorage.setItem(sessionKey, 'true');
                }
              })
              .catch(e => console.warn('incrementViews failed', e));
          }

          // Parallel background tasks: author lookup and related articles
          (async () => {
            try {
              const [author, allArticles] = await Promise.all([
                userService.getUserById(foundArticle.authorId!), // Use authorId
                articleService.getPublishedArticles()
              ]);

              setAuthorData(author || null);

              const otherArticles = (allArticles || []).filter((a: Article) => String(a.id) !== String(id));

              // Filter by tags first, then category
              let related = otherArticles.filter((a: Article) =>
                a.tags?.some(tag => foundArticle.tags?.includes(tag))
              );

              if (related.length < 5) {
                const categoryMatches = otherArticles.filter(a =>
                  a.category === foundArticle.category && !related.find(r => r.id === a.id)
                );
                related = [...related, ...categoryMatches];
              }

              if (related.length < 10) {
                const remaining = otherArticles.filter(a => !related.find(r => r.id === a.id));
                const shuffled = [...remaining].sort(() => 0.5 - Math.random());
                related = [...related, ...shuffled.slice(0, 10 - related.length)];
              }

              const selected = related.map(a => ({
                id: a.id,
                title: a.title,
                image: a.image || "",
                date: a.date,
                category: a.category
              }));

              setRelatedArticles(selected);
            } catch (bgErr) {
              console.warn('Background fetch for author/related failed', bgErr);
            }
          })();

        } else {
          // Article not found handling
          console.log("Article not found with ID:", id);
          setArticle(null); // Ensure it's null
        }
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticleData();
  }, [id]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollDelta = scrollY - lastScrollY.current;
      lastScrollY.current = scrollY;

      // Update reading progress
      if (articleRef.current) {
        const element = articleRef.current;
        const totalHeight = element.clientHeight;
        const windowHeight = window.innerHeight;
        const elementTop = element.offsetTop;

        if (scrollY > elementTop) {
          const progress = ((scrollY - elementTop) / (totalHeight - windowHeight + 400)) * 100;
          setReadingProgress(Math.min(100, Math.max(0, progress)));
        } else {
          setReadingProgress(0);
        }
      }

      // Sliding sticky sidebar logic
      if (sidebarRef.current) {
        const navbarHeight = 84;
        const viewportHeight = window.innerHeight;
        const sidebarHeight = sidebarRef.current.offsetHeight;
        const padding = 20;

        if (sidebarHeight <= viewportHeight - navbarHeight - padding) {
          // If sidebar is shorter than viewport, keep it stuck to the top
          currentTop.current = navbarHeight;
        } else {
          // If sidebar is taller than viewport, slide it
          const minTop = viewportHeight - sidebarHeight - padding;
          const maxTop = navbarHeight;

          let newTop = currentTop.current - scrollDelta;
          newTop = Math.max(minTop, Math.min(maxTop, newTop));
          currentTop.current = newTop;
        }
        setStickyTop(currentTop.current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [relatedArticles]); // Re-run when related articles change as height might change

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

  if (loading) {
    return <ArticleDetailSkeleton />;
  }

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
      <SEO 
        title={article.title}
        description={article.excerpt}
        keywords={article.tags?.join(', ')}
        ogTitle={article.title}
        ogDescription={article.excerpt}
        ogImage={article.image}
        ogUrl={window.location.href}
        type="article"
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "NewsArticle",
              "headline": article.title,
              "image": [article.image],
              "datePublished": article.date ? (isNaN(new Date(article.date).getTime()) ? new Date().toISOString() : new Date(article.date).toISOString()) : new Date().toISOString(),
              "dateModified": article.date ? (isNaN(new Date(article.date).getTime()) ? new Date().toISOString() : new Date(article.date).toISOString()) : new Date().toISOString(),
              "author": [{
                "@type": "Person",
                "name": article.author,
                "url": `${window.location.origin}/author/${article.authorId}`
              }],
              "publisher": {
                "@type": "Organization",
                "name": "TECH Theory",
                "logo": {
                  "@type": "ImageObject",
                  "url": `${window.location.origin}/logo.png`
                }
              },
              "description": article.excerpt
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": window.location.origin
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": article.category,
                  "item": `${window.location.origin}/category/${article.category.toLowerCase()}`
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": article.title,
                  "item": window.location.href
                }
              ]
            }
          ]
        }}
      />
      <Navbar />

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-secondary z-50">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <main className="pt-6 pb-12">
        {/* Article Header */}
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <article ref={articleRef}>
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
                    <span className="text-base font-bold uppercase tracking-tight text-primary">
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
                        onClick={handleLike}
                        className={cn("px-2 md:px-3", isLiked ? "text-red-500" : "")}
                      >
                        <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                        <span className="ml-1 text-xs md:text-sm hidden md:inline">{article.likes}</span>
                      </Button>

                      <BookmarkButton
                        article={article}
                        variant="minimal"
                        className="text-muted-foreground hover:text-foreground px-2 md:px-3"
                      />

                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleShare}
                        className="px-2 md:px-3"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="ml-1 text-xs md:text-sm hidden md:inline">Share</span>
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
                  className="prose md:prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-blockquote:text-foreground prose-code:text-foreground"
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
                          lines[i + 1].trim().startsWith('|') &&
                          (lines[i + 1].includes('---') || lines[i + 1].includes('-'))) {

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
                          elements.push(<li key={key} className="ml-4">{line.replace(/^(•|-)\s/, '')}</li>);
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
                      className={`px-3 md:px-4 ${isLiked ? "border-red-500 text-red-500" : ""}`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-current" : ""} md:mr-2`} />
                      <span className="hidden md:inline">Like ({article.likes})</span>
                      <span className="md:hidden ml-1 text-xs">{article.likes}</span>
                    </Button>

                    <Button variant="outline" onClick={handleCommentClick} className="px-3 md:px-4">
                      <MessageCircle className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Comment</span>
                    </Button>
                  </div>

                  <Button onClick={handleShare} className="px-3 md:px-4">
                    <Share2 className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Share Article</span>
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
                      <div className="flex flex-col md:flex-row gap-4">
                        {user && (
                          <Avatar className="hidden md:flex">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1 flex flex-col gap-3">
                          <Textarea
                            placeholder="Share your thoughts..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[100px]"
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {user && (
                                <Avatar className="h-7 w-7 md:hidden">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                            <Button onClick={handleCommentSubmit} disabled={!newComment.trim() || isSubmitting}>
                              {isSubmitting ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4 mr-2" />
                              )}
                              {isSubmitting ? "Posting..." : "Post Comment"}
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
              </article>
            </div>

            <div className="lg:col-span-1">
              <div
                ref={sidebarRef}
                className="sticky space-y-6"
                style={{ top: `${stickyTop}px` }}
              >
                <div
                  className="bg-background border border-border rounded-lg p-6"
                >
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
