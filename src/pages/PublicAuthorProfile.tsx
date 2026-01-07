import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Instagram, Linkedin, Facebook, ArrowLeft, Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { userService, User } from "@/services/userService";
import { articleService, Article } from "@/services/articleService";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const PublicAuthorProfile = () => {
  const { authorName } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState<User | null>(null);
  const [authorArticles, setAuthorArticles] = useState<Article[]>([]);
  const [topCategories, setTopCategories] = useState<string[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  useEffect(() => {
    const loadAuthorData = async () => {
      if (!authorName) return;

      let decodedName = authorName;
      try {
        decodedName = decodeURIComponent(authorName);
      } catch (e) {
        console.error("Failed to decode author name:", e);
      }
      
      // 2. Fetch Author's Articles first to check if author exists in content
      const allArticles = await articleService.getPublishedArticles();
      const articlesByAuthor = allArticles.filter(a => a.author === decodedName);
      setAuthorArticles(articlesByAuthor);

      // 1. Fetch Author Data (Try to find in registered users, otherwise fallback to "ghost" profile if they have articles)
      const users = userService.getAllUsers();
      const foundAuthor = users.find(u => u.name === decodedName);
      
      if (foundAuthor) {
        setAuthor(foundAuthor);
      } else if (articlesByAuthor.length > 0) {
        // Create a virtual profile for authors who have articles but aren't in the user DB
        setAuthor({
          id: `virtual-${Date.now()}`,
          name: decodedName,
          email: "",
          role: 'author',
          status: 'active',
          joinedDate: articlesByAuthor[articlesByAuthor.length - 1].date, // Use oldest article date or fallback
          bio: `Contributor at TechTheory. Author of ${articlesByAuthor.length} article${articlesByAuthor.length !== 1 ? 's' : ''}.`,
          avatar: "" // Will use initial fallback
        });
      } else {
        setAuthor(null);
      }

      // 3. Calculate "Mostly writes in"
      const categoryCounts: Record<string, number> = {};
      articlesByAuthor.forEach(article => {
        categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
      });
      
      const sortedCategories = Object.entries(categoryCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([category]) => category)
        .slice(0, 3); // Top 3 categories
      
      setTopCategories(sortedCategories);

      // 4. Fetch Related Articles (Sidebar) - showing latest articles not by this author
      const otherArticles = allArticles
        .filter(a => a.author !== decodedName)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      setRelatedArticles(otherArticles);
    };

    loadAuthorData();
  }, [authorName]);

  if (!author) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Author not found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Author Profile & Articles */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Author Profile Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  
                  {/* Avatar */}
                  <div className="flex-shrink-0 mx-auto md:mx-0">
                    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
                      {author.avatar ? (
                        <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                      ) : (
                        author.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{author.name}</h1>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                        {topCategories.map(cat => (
                          <Badge key={cat} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Bio */}
                    {author.bio && (
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {author.bio}
                      </p>
                    )}

                    {/* Social Links */}
                {author.socialLinks && (
                  <div className="flex items-center justify-center md:justify-start space-x-4 pt-2">
                    {author.socialLinks.instagram && (
                      <a href={author.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:text-pink-600 hover:bg-pink-50 transition-all">
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {author.socialLinks.linkedin && (
                      <a href={author.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-700 hover:bg-blue-50 transition-all">
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {author.socialLinks.facebook && (
                      <a href={author.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
                  </div>
                </div>
                
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{authorArticles.length}</div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">Articles</div>
                  </div>
                  <div className="text-center border-l border-gray-100 dark:border-gray-700">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {authorArticles.reduce((acc, curr) => acc + curr.views, 0).toLocaleString()}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">Total Views</div>
                  </div>
                  <div className="text-center border-l border-gray-100 dark:border-gray-700">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {new Date(author.joinedDate).getFullYear()}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-gray-500">Member Since</div>
                  </div>
                </div>
              </div>

              {/* Author's Articles List */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
                  Articles by {author.name}
                  <Badge className="ml-3 bg-primary/10 text-primary hover:bg-primary/20 border-0">
                    {authorArticles.length}
                  </Badge>
                </h2>
                
                <div className="grid gap-6">
                  {authorArticles.length > 0 ? (
                    authorArticles.map((article) => (
                      <Card key={article.id} className="group hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex flex-col md:flex-row h-full">
                          <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                            <img 
                              src={article.image} 
                              alt={article.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2 left-2">
                              <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-sm">
                                {article.category}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {article.date}</span>
                                <span>•</span>
                                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {article.readTime}</span>
                              </div>
                              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                <Link to={`/article/${article.id}`}>
                                  {article.title}
                                </Link>
                              </h3>
                              <p className="text-muted-foreground line-clamp-2 mb-4 text-sm">
                                {article.excerpt}
                              </p>
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs font-normal">
                                  {article.views.toLocaleString()} views
                                </Badge>
                                <Badge variant="outline" className="text-xs font-normal">
                                  {article.likes} likes
                                </Badge>
                              </div>
                              <Button variant="ghost" size="sm" className="group/btn" asChild>
                                <Link to={`/article/${article.id}`}>
                                  Read More <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed">
                      <p className="text-muted-foreground">No articles published yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                
                {/* Related Posts (Latest from others) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="font-bold text-lg mb-4 flex items-center">
                    <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                    Trending on TechTheory
                  </h3>
                  <div className="space-y-6">
                    {relatedArticles.map((article) => (
                      <Link key={article.id} to={`/article/${article.id}`} className="group block">
                        <div className="flex gap-4 items-start">
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={article.image} 
                              alt={article.title} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium text-primary mb-1 block">{article.category}</span>
                            <h4 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1">
                              {article.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">{article.date}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Newsletter Box (Optional but nice for sidebar filler) */}
                <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                  <h3 className="font-bold text-lg mb-2">Subscribe to Newsletter</h3>
                  <p className="text-sm text-muted-foreground mb-4">Get the latest tech theories delivered to your inbox.</p>
                  <div className="space-y-2">
                    <input 
                      type="email" 
                      placeholder="Your email address" 
                      className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <Button className="w-full">Subscribe</Button>
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

export default PublicAuthorProfile;
