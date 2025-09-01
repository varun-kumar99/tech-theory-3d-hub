import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import NewsGrid from "@/components/NewsGrid";
import NewsletterSignup from "@/components/NewsletterSignup";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <NewsGrid />
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <NewsletterSignup />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
