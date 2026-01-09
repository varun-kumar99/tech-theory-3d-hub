import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Instagram, Linkedin, Facebook, Brain, Heart, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { userService, User } from "@/services/userService";
import { articleService, Article } from "@/services/articleService";
import { Badge } from "@/components/ui/badge";

const PublicAuthorProfile = () => {
  const { authorName } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState<User | null>(null);
  const [authorArticles, setAuthorArticles] = useState<Article[]>([]);
  const [topCategories, setTopCategories] = useState<string[]>([]);

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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Author Profile Card */}
          <div className="bg-gray-900 rounded-md p-8 mb-12 border border-gray-800">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* Avatar */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center text-4xl font-bold text-blue-500 overflow-hidden border-4 border-gray-800 shadow-xl">
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
                  <h1 className="text-3xl font-bold text-white mb-2">{author.name}</h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                    {topCategories.map(cat => (
                      <Badge key={cat} className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-0 rounded-full px-3">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                {author.bio && (
                  <p className="text-gray-400 leading-relaxed">
                    {author.bio}
                  </p>
                )}

                {/* Social Links */}
                {author.socialLinks && (
                  <div className="flex items-center justify-center md:justify-start space-x-4 pt-2">
                    {author.socialLinks.instagram && (
                      <a href={author.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-pink-500 hover:bg-gray-700 transition-all">
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {author.socialLinks.linkedin && (
                      <a href={author.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-700 transition-all">
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {author.socialLinks.facebook && (
                      <a href={author.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-blue-600 hover:bg-gray-700 transition-all">
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-800">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{authorArticles.length}</div>
                <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">Articles</div>
              </div>
              <div className="text-center border-l border-gray-800">
                <div className="text-2xl font-bold text-white">
                  {authorArticles.reduce((acc, curr) => acc + curr.views, 0).toLocaleString()}
                </div>
                <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">Total Views</div>
              </div>
              <div className="text-center border-l border-gray-800">
                <div className="text-2xl font-bold text-white">
                  {new Date(author.joinedDate).getFullYear()}
                </div>
                <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">Member Since</div>
              </div>
            </div>
          </div>

          {/* Articles List */}
          <div className="space-y-8">
            {authorArticles.length > 0 ? (
              authorArticles.map((article) => (
                <div key={article.id} className="flex flex-col md:flex-row gap-6 group">
                  {/* Article Image */}
                  <Link to={`/article/${article.id}`} className="block w-full md:w-[300px] flex-shrink-0">
                    <div className="relative aspect-video md:aspect-[4/2.5] rounded-md overflow-hidden bg-gray-800">
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Overlay Icons */}
                      <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm p-1.5 rounded text-white">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div className="absolute top-3 right-3 flex gap-2">
                        {/* <div className="bg-black/50 backdrop-blur-sm p-1.5 rounded-lg text-white hover:bg-black/70 cursor-pointer">
                          <Heart className="w-4 h-4" />
                        </div>
                        <div className="bg-black/50 backdrop-blur-sm p-1.5 rounded-lg text-white hover:bg-black/70 cursor-pointer">
                          <Bookmark className="w-4 h-4" />
                        </div> */}
                      </div>
                    </div>
                  </Link>

                  {/* Article Content */}
                  <div className="flex-1 py-1 flex flex-col">
                    <div className="flex items-center gap-3 text-xs font-bold tracking-wider mb-2">
                      <span className="text-blue-500 uppercase">{article.category}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-500">{article.date}</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3 leading-tight group-hover:text-blue-400 transition-colors">
                      <Link to={`/article/${article.id}`}>
                        {article.title}
                      </Link>
                    </h3>
                    
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                      {article.excerpt}
                    </p>
                    
                    <div className="mt-auto flex items-center text-xs font-medium text-gray-500">
                      <span className="text-gray-300">By {article.author}</span>
                      <span className="mx-2">•</span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-gray-900 rounded-md border border-gray-800 border-dashed">
                <p className="text-gray-500">No articles published yet.</p>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicAuthorProfile;
