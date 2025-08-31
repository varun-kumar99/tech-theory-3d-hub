import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedNews from "@/components/FeaturedNews";
import NewsGrid from "@/components/NewsGrid";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedNews />
        <NewsGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
