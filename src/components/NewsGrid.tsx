import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { BookmarkButton } from "./BookmarkButton";

const NewsGrid = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const newsArticles = [
    {
      id: 1,
      title: "AI Revolution in Smartphone Photography: How Machine Learning is Transforming Mobile Cameras",
      category: "AI • TECH",
      excerpt: "Discover how advanced AI algorithms are revolutionizing smartphone photography, making professional-quality shots accessible to everyone through computational photography techniques.",
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&h=400&fit=crop",
      author: "Sarah Chen",
      date: "2 hours ago",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "The Future of Electric Vehicles: Tesla's Latest Autopilot Technology Breaks New Ground",
      category: "AUTO • TECH",
      excerpt: "Tesla's groundbreaking autopilot system represents a major leap forward in autonomous driving technology, bringing us closer to fully self-driving vehicles.",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop",
      author: "Mike Rodriguez",
      date: "4 hours ago",
      readTime: "8 min read"
    },
    {
      id: 3,
      title: "Gaming Laptops That Don't Break the Bank: Budget-Friendly Options for Serious Gamers",
      category: "GAMING • REVIEWS",
      excerpt: "Finding the perfect gaming laptop on a budget doesn't have to be impossible. We've tested the best affordable options that deliver impressive performance.",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop",
      author: "Alex Kim",
      date: "6 hours ago",
      readTime: "6 min read"
    },
    {
      id: 4,
      title: "5G Networks: What's Next? The Evolution Beyond Current Infrastructure",
      category: "NETWORK • TECH",
      excerpt: "As 5G networks mature, researchers are already looking ahead to 6G technology and the revolutionary changes it will bring to connectivity.",
      image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&h=400&fit=crop",
      author: "Emma Thompson",
      date: "8 hours ago",
      readTime: "7 min read"
    },
    {
      id: 5,
      title: "Smart Home Security Essentials: Protecting Your Connected Devices from Cyber Threats",
      category: "SMART HOME • SECURITY",
      excerpt: "With more devices connected to our home networks than ever, understanding smart home security has become crucial for protecting your digital life.",
      image: "https://images.unsplash.com/photo-1581092162384-8987c1d64926?w=600&h=400&fit=crop",
      author: "David Park",
      date: "12 hours ago",
      readTime: "9 min read"
    },
    {
      id: 6,
      title: "Apple's Next Big Thing: What to Expect from the Upcoming September Keynote Event",
      category: "APPLE • RUMORS",
      excerpt: "Industry insiders share their predictions for Apple's most anticipated event of the year, including potential iPhone updates and new product categories.",
      image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&h=400&fit=crop",
      author: "Lisa Wang",
      date: "1 day ago",
      readTime: "4 min read"
    },
    {
      id: 7,
      title: "Sustainable Tech Innovations: Eco-Friendly Gadgets Making a Real Environmental Difference",
      category: "GREEN TECH • ENVIRONMENT",
      excerpt: "From solar-powered devices to biodegradable phone cases, innovative companies are creating technology that helps rather than harms our planet.",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop",
      author: "Jordan Silva",
      date: "1 day ago",
      readTime: "10 min read"
    },
    {
      id: 8,
      title: "VR Headsets Worth Your Money: The Best Virtual Reality Experiences in 2025",
      category: "VR • REVIEWS",
      excerpt: "Virtual reality has come a long way. We review the top VR headsets that offer the most immersive and comfortable experiences for every budget.",
      image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=600&h=400&fit=crop",
      author: "Ryan Mitchell",
      date: "2 days ago",
      readTime: "12 min read"
    },
    {
      id: 9,
      title: "Cryptocurrency Market Analysis: Bitcoin's Latest Rally and What It Means for Investors",
      category: "CRYPTO • FINANCE",
      excerpt: "Bitcoin's recent surge has caught investors' attention. Our analysis breaks down the factors driving this rally and potential future trends.",
      image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600&h=400&fit=crop",
      author: "Marcus Chen",
      date: "2 days ago",
      readTime: "6 min read"
    },
    {
      id: 10,
      title: "Space Technology Breakthrough: NASA's New Propulsion System Could Cut Mars Travel Time in Half",
      category: "SPACE • SCIENCE",
      excerpt: "Revolutionary propulsion technology developed by NASA promises to make interplanetary travel faster and more efficient than ever before.",
      image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=600&h=400&fit=crop",
      author: "Dr. Amanda Foster",
      date: "3 days ago",
      readTime: "8 min read"
    },
    {
      id: 11,
      title: "Quantum Computing Milestone: IBM's Latest Processor Achieves Unprecedented Performance",
      category: "QUANTUM • COMPUTING",
      excerpt: "IBM's breakthrough in quantum computing brings us closer to solving complex problems that are impossible for traditional computers.",
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=400&fit=crop",
      author: "Dr. Kevin Zhang",
      date: "3 days ago",
      readTime: "11 min read"
    },
    {
      id: 12,
      title: "Robotics in Healthcare: How AI-Powered Robots are Revolutionizing Medical Procedures",
      category: "ROBOTICS • HEALTHCARE",
      excerpt: "Advanced robotics technology is transforming healthcare, from surgical procedures to patient care, improving outcomes and reducing costs.",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop",
      author: "Dr. Rachel Martinez",
      date: "4 days ago",
      readTime: "9 min read"
    },
    {
      id: 13,
      title: "Augmented Reality Shopping: How AR is Changing the Way We Buy Products Online",
      category: "AR • COMMERCE",
      excerpt: "Augmented reality is revolutionizing e-commerce by allowing customers to virtually try products before purchasing, reducing returns and increasing satisfaction.",
      image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=600&h=400&fit=crop",
      author: "Sophie Kim",
      date: "4 days ago",
      readTime: "7 min read"
    },
    {
      id: 14,
      title: "Cybersecurity Alert: New Malware Targets Internet of Things Devices in Smart Homes",
      category: "CYBERSECURITY • IOT",
      excerpt: "Security researchers have discovered a sophisticated malware campaign targeting IoT devices, highlighting the importance of device security.",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop",
      author: "James Wilson",
      date: "5 days ago",
      readTime: "5 min read"
    },
    {
      id: 15,
      title: "Edge Computing Revolution: How Processing Data Closer to Source is Transforming Industries",
      category: "EDGE COMPUTING • ENTERPRISE",
      excerpt: "Edge computing is reducing latency and improving performance across industries by processing data closer to where it's generated.",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop",
      author: "Robert Taylor",
      date: "5 days ago",
      readTime: "8 min read"
    },
    {
      id: 16,
      title: "Neural Interfaces: Brain-Computer Technology Reaches New Milestones in Human Trials",
      category: "NEUROTECHNOLOGY • SCIENCE",
      excerpt: "Breakthrough advances in brain-computer interfaces are showing promising results in helping paralyzed patients control devices with their thoughts.",
      image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&h=400&fit=crop",
      author: "Dr. Elena Petrov",
      date: "6 days ago",
      readTime: "10 min read"
    },
    {
      id: 17,
      title: "Renewable Energy Tech: Solar Panel Efficiency Reaches Record-Breaking 47% in Laboratory Tests",
      category: "RENEWABLE • ENERGY",
      excerpt: "Scientists achieve unprecedented solar panel efficiency in lab conditions, bringing us closer to more affordable and effective renewable energy.",
      image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&h=400&fit=crop",
      author: "Dr. Michael Green",
      date: "6 days ago",
      readTime: "6 min read"
    },
    {
      id: 18,
      title: "Biotech Innovation: Gene Therapy Shows Promise in Treating Previously Incurable Diseases",
      category: "BIOTECH • MEDICINE",
      excerpt: "Revolutionary gene therapy techniques are offering hope for patients with genetic disorders that were previously considered untreatable.",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
      author: "Dr. Sarah Johnson",
      date: "1 week ago",
      readTime: "12 min read"
    }
  ];

  const totalPages = Math.ceil(newsArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentArticles = newsArticles.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Trending News</h2>
          <div className="w-16 h-1 bg-primary rounded-full"></div>
        </div>

        {/* Engadget-style article list with alternating layout */}
        <div className="space-y-8">
          {currentArticles.map((article, index) => {
            const isEven = index % 2 === 0;
            
            return (
              <article key={article.id} className={`group cursor-pointer`}>
                <Link to={`/article/${article.id}`} className="block">
                  <div className={`flex flex-col lg:flex-row ${!isEven ? 'lg:flex-row-reverse' : ''} gap-6 bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300`}>
                    {/* Image Section */}
                    <div className="lg:w-2/5 relative overflow-hidden">
                      <div className="aspect-video lg:aspect-[4/3] relative">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        {/* Action Buttons */}
                        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            className="p-2.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                            onClick={(e) => e.preventDefault()}
                          >
                            <Heart className="w-4 h-4 text-white" />
                          </button>
                          <div 
                            className="p-2.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                            onClick={(e) => e.preventDefault()}
                          >
                            <BookmarkButton 
                              article={article} 
                              size="sm" 
                              variant="ghost" 
                              className="p-0 h-4 w-4 hover:bg-transparent text-white hover:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  
                  {/* Content Section */}
                  <div className="lg:w-3/5 p-6 flex flex-col justify-between">
                    <div>
                      <div className="mb-3">
                        <span className="text-sm uppercase tracking-wide text-primary font-medium">
                          {article.category}
                        </span>
                      </div>
                      
                      <h3 className="text-xl md:text-2xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors mb-4">
                        {article.title}
                      </h3>
                      
                      <p className="text-muted-foreground leading-relaxed mb-6 text-base">
                        {article.excerpt}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <span>by {article.author}</span>
                        <span>•</span>
                        <span>{article.date}</span>
                      </div>
                      <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium">
                        {article.readTime}
                      </span>
                    </div>
                  </div>
                </div>
                </Link>
              </article>
            );
          })}
        </div>

        {/* Minimal Pagination */}
        <div className="mt-16 flex items-center justify-center space-x-8">
          {currentPage > 1 && (
            <button
              onClick={prevPage}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>
          )}
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 text-sm font-medium rounded transition-colors duration-200 ${
                  currentPage === page
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          {currentPage < totalPages && (
            <button
              onClick={nextPage}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsGrid;