import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const latestStories = [
    {
      id: 1,
      title: "Apple Vision Pro 2 with Revolutionary Eye Tracking Technology",
      author: "Sarah Johnson",
      publishedDate: "2 hours ago",
      image: "https://images.unsplash.com/photo-1592364395653-83e648b20cc2?w=600&h=400&fit=crop",
      category: "APPLE"
    },
    {
      id: 2,
      title: "Samsung Galaxy S25 Ultra: AI Camera Features That Change Everything",
      author: "Mike Chen",
      publishedDate: "4 hours ago",
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=400&fit=crop",
      category: "SAMSUNG"
    },
    {
      id: 3,
      title: "Tesla's FSD Beta 12.0: Full Self-Driving Finally Here?",
      author: "Alex Rivera",
      publishedDate: "6 hours ago",
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop",
      category: "AUTO"
    },
    {
      id: 4,
      title: "Netflix Announces Breakthrough AR Streaming Platform",
      author: "Emma Wilson",
      publishedDate: "8 hours ago",
      image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&h=400&fit=crop",
      category: "STREAMING"
    },
    {
      id: 5,
      title: "Google Pixel 9 Pro: AI Photography Reaches New Heights",
      author: "David Park",
      publishedDate: "10 hours ago",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop",
      category: "GOOGLE"
    },
    {
      id: 6,
      title: "Microsoft Surface Studio 3: The Creative Professional's Dream",
      author: "Lisa Chang",
      publishedDate: "12 hours ago",
      image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&h=400&fit=crop",
      category: "MICROSOFT"
    },
    {
      id: 7,
      title: "AMD's New Ryzen 9000 Series: Gaming Performance Breakthrough",
      author: "Jordan Martinez",
      publishedDate: "14 hours ago",
      image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&h=400&fit=crop",
      category: "AMD"
    },
    {
      id: 8,
      title: "Meta Quest 4: Virtual Reality Gets Even More Immersive",
      author: "Rachel Kim",
      publishedDate: "16 hours ago",
      image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600&h=400&fit=crop",
      category: "META"
    },
    {
      id: 9,
      title: "SpaceX Starlink Mini: Portable Internet Anywhere on Earth",
      author: "Tony Rodriguez",
      publishedDate: "18 hours ago",
      image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=600&h=400&fit=crop",
      category: "SPACEX"
    },
    {
      id: 10,
      title: "Nintendo Switch 2: What We Know About the Next Generation",
      author: "Kai Tanaka",
      publishedDate: "20 hours ago",
      image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=400&fit=crop",
      category: "NINTENDO"
    },
    {
      id: 11,
      title: "Intel Arc B580: Budget GPU That Actually Competes",
      author: "Marcus Thompson",
      publishedDate: "22 hours ago",
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=400&fit=crop",
      category: "INTEL"
    },
    {
      id: 12,
      title: "MacBook Air M4: Ultra-Thin Design Meets Pro Performance",
      author: "Elena Petrov",
      publishedDate: "1 day ago",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop",
      category: "APPLE"
    }
  ];

  return (
    <section className="relative py-16 px-4">
      <div className="container mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Latest Stories</h2>
          <div className="w-16 h-1 bg-primary rounded-full"></div>
        </div>

        {/* Featured Layout - Large card + 2x2 grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Large Featured Article */}
          <article className="group cursor-pointer">
            <Link to={`/article/${latestStories[0].id}`} className="block">
              <div className="rounded-lg overflow-hidden relative h-[500px] transition-all duration-300 hover:scale-[1.02] bg-card shadow-sm">
                {/* Image Section */}
                <div className="relative h-2/3 overflow-hidden">
                  <img
                    src={latestStories[0].image}
                    alt={latestStories[0].title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Category Badge on Image */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-semibold">
                      {latestStories[0].category}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 h-1/3 flex flex-col bg-card justify-center">
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-xl md:text-2xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
                      {latestStories[0].title}
                    </h3>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2 flex-shrink-0">
                    <span>by {latestStories[0].author}</span>
                    <span className="mx-2">•</span>
                    <span>{latestStories[0].publishedDate}</span>
                  </div>
                </div>
              </div>
            </Link>
          </article>

          {/* 2x2 Grid of smaller cards */}
          <div className="grid grid-cols-2 gap-4">
            {latestStories.slice(1, 5).map((story, index) => (
              <article key={story.id} className="group cursor-pointer">
                <Link to={`/article/${story.id}`} className="block">
                  <div className="rounded-lg overflow-hidden relative h-[240px] transition-all duration-300 hover:scale-[1.02] bg-card shadow-sm">
                    {/* Image Section */}
                    <div className="relative h-2/3 overflow-hidden">
                      <img
                        src={story.image}
                        alt={story.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Category Badge on Image */}
                      <div className="absolute top-2 left-2">
                        <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold">
                          {story.category}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-3 h-1/3 flex flex-col bg-card justify-center">
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="text-sm font-bold leading-tight text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
                          {story.title}
                        </h3>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex-shrink-0">
                        <span>by {story.author}</span>
                        <span className="mx-1">•</span>
                        <span>{story.publishedDate}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>

        {/* Bottom Row - Three Equal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {latestStories.slice(5, 8).map((story, index) => (
            <article key={story.id} className="group cursor-pointer">
              <Link to={`/article/${story.id}`} className="block">
                <div className="rounded-lg overflow-hidden relative h-[400px] transition-all duration-300 hover:scale-[1.02] bg-card shadow-sm">
                  {/* Image Section */}
                  <div className="relative h-2/3 overflow-hidden">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Category Badge on Image */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-semibold">
                        {story.category}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 h-1/3 flex flex-col bg-card justify-center">
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-base font-bold leading-tight text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
                        {story.title}
                      </h3>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2 flex-shrink-0">
                      <span>by {story.author}</span>
                      <span className="mx-2">•</span>
                      <span>{story.publishedDate}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;