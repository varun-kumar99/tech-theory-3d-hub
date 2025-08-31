import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const latestStories = [
    {
      id: 1,
      title: "Apple Vision Pro 2 Release Date: What We Know So Far",
      author: "Sarah Johnson",
      publishedDate: "September 1, 2025",
      image: "https://images.unsplash.com/photo-1592364395653-83e648b20cc2?w=600&h=400&fit=crop",
      category: "APPLE"
    },
    {
      id: 2,
      title: "Samsung Galaxy S25 Ultra: Revolutionary AI Camera Features",
      author: "Mike Chen",
      publishedDate: "August 31, 2025",
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=400&fit=crop",
      category: "SAMSUNG"
    },
    {
      id: 3,
      title: "Tesla's New Autopilot 3.0: The Future of Self-Driving",
      author: "Alex Rivera",
      publishedDate: "August 31, 2025",
      image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop",
      category: "AUTO"
    },
    {
      id: 4,
      title: "Netflix Announces Revolutionary AR Streaming Experience",
      author: "Emma Wilson",
      publishedDate: "August 30, 2025",
      image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&h=400&fit=crop",
      category: "ENTERTAINMENT"
    }
  ];

  return (
    <section className="relative py-16 px-6">
      <div className="container mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Latest Stories</h2>
          <div className="w-16 h-1 bg-primary rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestStories.map((story) => (
            <article key={story.id} className="group cursor-pointer">
              <div className="card-3d rounded-xl overflow-hidden relative h-64 mb-4">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    {story.category}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-2">
                  {story.title}
                </h3>
                <div className="text-sm text-muted-foreground">
                  <span>by {story.author}</span>
                  <span className="mx-2">•</span>
                  <span>Published: {story.publishedDate}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;