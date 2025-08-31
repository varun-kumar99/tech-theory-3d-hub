import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedNews from "@/components/FeaturedNews";
import NewsGrid from "@/components/NewsGrid";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedNews />
        <NewsGrid />
      </main>
    </div>
  );
};

export default Index;
