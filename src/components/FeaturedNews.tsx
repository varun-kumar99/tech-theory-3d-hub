import { Button } from "@/components/ui/button";

const FeaturedNews = () => {
  return (
    <section className="py-16 px-6">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Featured Article */}
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground font-medium">
              SAMSUNG
            </div>
            <h2 className="text-4xl font-bold leading-tight">
              Revolutionary<br />
              Samsung Galaxy AI
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Discover the groundbreaking artificial intelligence features that are 
              revolutionizing smartphone photography and user experience in Samsung's 
              latest flagship device lineup.
            </p>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              See more
            </Button>
          </div>

          {/* Product Showcase */}
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 h-80 flex items-center justify-center">
              <div className="flex space-x-4">
                <div className="w-32 h-56 bg-gradient-to-b from-purple-900 to-black rounded-3xl shadow-2xl transform rotate-12 relative overflow-hidden">
                  <div className="absolute inset-2 bg-gradient-to-b from-purple-600 to-purple-900 rounded-2xl" />
                </div>
                <div className="w-32 h-56 bg-gradient-to-b from-gray-700 to-gray-900 rounded-3xl shadow-2xl transform -rotate-6 relative overflow-hidden">
                  <div className="absolute inset-2 bg-gradient-to-b from-gray-500 to-gray-700 rounded-2xl" />
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-600 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="card-3d rounded-xl overflow-hidden relative h-48">
            <img
              src="https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=300&fit=crop"
              alt="Tech News"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/80 to-red-500/80" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-2xl font-bold uppercase">TECH TO NEWS</h3>
            </div>
          </div>

          <div className="card-3d rounded-xl overflow-hidden relative h-48">
            <img
              src="https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=600&h=300&fit=crop"
              alt="Tech Werfins"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/80 to-purple-500/80" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-2xl font-bold uppercase">TECH Werfins</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedNews;