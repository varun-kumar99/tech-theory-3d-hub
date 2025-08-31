import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative py-16 px-6">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                Latest Tech News
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Latest Tech News
                <br />
                <span className="text-primary">Tech News</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum accumsan
              </p>
            </div>
            
            <Button className="btn-primary">
              See more
            </Button>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="card-3d rounded-2xl overflow-hidden relative">
              <img
                src="/lovable-uploads/da3d6b76-7c52-4fb5-b6bc-0f5539b776ed.png"
                alt="Latest Tech News"
                className="w-full h-64 lg:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            
            {/* Floating 3D Badges */}
            <div className="absolute -top-4 -right-4 tech-badge">
              3D
            </div>
            <div className="absolute bottom-6 -left-6 tech-badge green">
              3D
            </div>
            <div className="absolute top-1/2 -right-8 tech-badge">
              3D
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;