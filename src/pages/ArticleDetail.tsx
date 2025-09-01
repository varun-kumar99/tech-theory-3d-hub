import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Clock, Eye, Heart, Share2, MessageCircle, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookmarkButton } from "@/components/BookmarkButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Article {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  views: number;
  likes: number;
  tags: string[];
}

interface RelatedArticle {
  id: number;
  title: string;
  image: string;
  date: string;
  category: string;
}

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [hasAd, setHasAd] = useState(false); // Control ad visibility

  // Mock article data - replace with API call

  useEffect(() => {
    // Mock article data - replace with API call
    const mockArticle: Article = {
      id: parseInt(id || "1"),
      title: "AI Revolution in Smartphone Photography: How Machine Learning is Transforming Mobile Cameras",
      category: "AI • TECH",
      excerpt: "Discover how advanced AI algorithms are revolutionizing smartphone photography, making professional-quality shots accessible to everyone through computational photography techniques.",
      content: `
        <p>The landscape of mobile photography has undergone a dramatic transformation in recent years, largely driven by advances in artificial intelligence and machine learning. What once required expensive DSLR cameras and years of technical expertise can now be achieved with the smartphone in your pocket.</p>
        
        <h2>The AI Photography Revolution</h2>
        <p>Modern smartphones use sophisticated AI algorithms to analyze scenes in real-time, automatically adjusting camera settings for optimal results. These systems can identify subjects, lighting conditions, and even predict the photographer's intent.</p>
        
        <h3>Computational Photography Techniques</h3>
        <p>Computational photography combines multiple exposures, advanced image processing, and machine learning to create images that surpass what traditional cameras can capture in a single shot.</p>
        
        <ul>
          <li><strong>HDR Processing:</strong> Combines multiple exposures for balanced lighting</li>
          <li><strong>Night Mode:</strong> AI-enhanced low-light photography</li>
          <li><strong>Portrait Mode:</strong> Machine learning-based background blur</li>
          <li><strong>Scene Recognition:</strong> Automatic optimization for different environments</li>
        </ul>
        
        <h2>The Future of Mobile Photography</h2>
        <p>As AI continues to evolve, we can expect even more sophisticated features that will further democratize professional-quality photography. From real-time video enhancement to advanced creative filters, the possibilities are limitless.</p>
        
        <p>The integration of AI in smartphone cameras represents just the beginning of a broader transformation in how we capture and share our visual stories.</p>
      `,
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&h=600&fit=crop",
      author: "Sarah Chen",
      date: "2 hours ago",
      readTime: "5 min read",
      views: 1247,
      likes: 89,
      tags: ["AI", "Photography", "Technology", "Machine Learning", "Smartphones"]
    };
    
    setArticle(mockArticle);

    // Mock related articles data
    const mockRelatedArticles: RelatedArticle[] = [
      {
        id: 2,
        title: "The Future of 5G Technology in Smart Cities",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
        date: "August 31, 2025",
        category: "Technology"
      },
      {
        id: 3,
        title: "Blockchain Applications Beyond Cryptocurrency",
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=300&h=200&fit=crop",
        date: "August 30, 2025",
        category: "Blockchain"
      },
      {
        id: 4,
        title: "Quantum Computing: Breaking Traditional Barriers",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop",
        date: "August 29, 2025",
        category: "Quantum"
      },
      {
        id: 5,
        title: "Sustainable Tech: Green Innovation in 2025",
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop",
        date: "August 28, 2025",
        category: "Green Tech"
      },
      {
        id: 6,
        title: "Virtual Reality in Education and Training",
        image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=300&h=200&fit=crop",
        date: "August 27, 2025",
        category: "VR/AR"
      },
      {
        id: 7,
        title: "Machine Learning Algorithms in Healthcare",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop",
        date: "August 26, 2025",
        category: "AI & Health"
      },
      {
        id: 8,
        title: "Cybersecurity Trends for Modern Enterprises",
        image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop",
        date: "August 25, 2025",
        category: "Security"
      },
      {
        id: 9,
        title: "Edge Computing: Processing Data at the Source",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop",
        date: "August 24, 2025",
        category: "Cloud"
      }
    ];
    
    setRelatedArticles(mockRelatedArticles);
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

  if (!article) return <div>Loading...</div>;

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

      <main className="pt-20">
        {/* Back Button */}
        <div className="container mx-auto px-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
        </div>

        {/* Article Header */}
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <article>
                <header className="mb-8">
                  <div className="mb-4">
                    <span className="text-sm uppercase tracking-wide text-primary font-medium">
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
                      <span>by <strong>{article.author}</strong></span>
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
                    className="w-full h-64 md:h-96 object-cover rounded-lg"
                  />
                </div>

                {/* Article Content */}
                <div 
                  id="article-content"
                  className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Tags */}
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

                {/* Article Actions */}
                <div className="mt-8 pt-8 border-t border-border flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsLiked(!isLiked)}
                      className={isLiked ? "border-red-500 text-red-500" : ""}
                    >
                      <ThumbsUp className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                      Like ({article.likes + (isLiked ? 1 : 0)})
                    </Button>
                    
                    <Button variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Comment
                    </Button>
                  </div>
                  
                  <Button onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Article
                  </Button>
                </div>
              </article>
            </div>

            {/* Sidebar - Related Articles */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <div className="bg-background border border-border rounded-lg p-6">
                  <div className="mb-6">
                    <h2 className="inline-block text-lg font-bold text-background bg-foreground px-3 py-2 text-sm uppercase tracking-wide rounded">
                      RELATED POSTS
                    </h2>
                  </div>
                  
                  <div className="space-y-6">
                    {relatedArticles.map((relatedArticle) => (
                      <article 
                        key={relatedArticle.id}
                        className="group cursor-pointer"
                        onClick={() => navigate(`/article/${relatedArticle.id}`)}
                      >
                        <div className="flex space-x-4">
                          <div className="flex-shrink-0">
                            <img
                              src={relatedArticle.image}
                              alt={relatedArticle.title}
                              className="w-20 h-20 object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-3 leading-tight">
                              {relatedArticle.title}
                            </h3>
                            <div className="mt-2 flex items-center text-xs text-muted-foreground">
                              <span className="text-primary font-medium">{relatedArticle.category}</span>
                              <span className="mx-2">•</span>
                              <span>{relatedArticle.date}</span>
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
    </div>
  );
};

export default ArticleDetail;
