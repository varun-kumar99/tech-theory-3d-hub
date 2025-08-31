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

      </div>
    </section>
  );
};

export default FeaturedNews;