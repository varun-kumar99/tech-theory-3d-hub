import { Heart, BookmarkPlus } from "lucide-react";

const NewsGrid = () => {
  const newsArticles = [
    {
      id: 1,
      title: "Nading Chain",
      category: "Category 29.01.2023",
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&h=400&fit=crop",
      large: false
    },
    {
      id: 2,
      title: "Ratticet Dodis",
      category: "Category 1.30.2023",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop",
      large: false
    },
    {
      id: 3,
      title: "Bold Polle Seving",
      category: "Category 3.50.2018",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop",
      large: false
    },
    {
      id: 4,
      title: "Bold Tove Battiegh",
      category: "Category 30.02.2023",
      image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&h=400&fit=crop",
      large: false
    },
    {
      id: 5,
      title: "Molon Cheniels",
      category: "Category 13.03.2011",
      image: "https://images.unsplash.com/photo-1581092162384-8987c1d64926?w=600&h=400&fit=crop",
      large: false
    },
    {
      id: 6,
      title: "Meestion Bakground",
      category: "Category 20.08.2023",
      image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&h=400&fit=crop",
      large: false
    }
  ];

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Trending News</h2>
          <div className="w-16 h-1 bg-primary rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsArticles.map((article) => (
            <article key={article.id} className="group">
              <div className="card-3d rounded-xl overflow-hidden relative h-64">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 news-card-overlay" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-xs uppercase tracking-wide mb-2 opacity-80">
                    {article.category}
                  </p>
                  <h3 className="text-xl font-bold leading-tight mb-3">
                    {article.title}
                  </h3>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                    <Heart className="w-4 h-4 text-white" />
                  </button>
                  <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                    <BookmarkPlus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsGrid;