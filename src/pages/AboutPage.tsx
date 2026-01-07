import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Mail, Github, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-grow pt-8 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="mb-12 space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              About Tech Theory
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          </div>

          {/* Main Content */}
          <article className="prose prose-lg dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed animate-fade-in delay-100">
            
            <p className="text-xl text-foreground font-medium">
              We decode the future. <span className="text-primary">Tech Theory</span> sits at the intersection of digital innovation and automotive engineering, bringing clarity to the complex world of modern technology.
            </p>

            <p>
              In an era of rapid advancement, we believe in quality over noise. Our mission is to curate and analyze the developments that truly matter—from the intricacies of 3D rendering engines to the next generation of electric mobility.
            </p>

            <div className="pl-6 border-l-2 border-primary/30 my-8 italic text-foreground/80">
              "Technology is best when it brings people together."
            </div>

            <p>
              We are a collective of engineers, developers, and enthusiasts passionate about the mechanics of the future. Whether it's a deep dive into software architecture or a hands-on review of the latest EV, our goal is to empower you with knowledge that is both accurate and actionable.
            </p>

            {/* Team/Connect Section */}
            <div className="mt-16 pt-8 border-t border-border/50">
              <h3 className="text-2xl font-bold text-foreground mb-6">Connect With Us</h3>
              <p className="mb-8">
                We thrive on community interaction. Have a tip, a question, or a project to share? 
                <Link to="/contact" className="text-primary hover:underline ml-1 font-medium">Get in touch</Link>.
              </p>

              {/* Share Buttons - Minimalist Redesign */}
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-[#1877F2] hover:bg-[#1877F2]/10 transition-all">
                  <Facebook className="w-5 h-5" />
                </Button>
                
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-all">
                  <Twitter className="w-5 h-5" />
                </Button>
                
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-[#0077b5] hover:bg-[#0077b5]/10 transition-all">
                  <Linkedin className="w-5 h-5" />
                </Button>
                
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-all">
                  <Github className="w-5 h-5" />
                </Button>

                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                  <Mail className="w-5 h-5" />
                </Button>
              </div>
            </div>

          </article>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
