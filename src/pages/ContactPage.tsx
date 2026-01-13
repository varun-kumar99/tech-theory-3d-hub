import { useNavigate, Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const ContactPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Contact Us"
        description="Get in touch with the TECH Theory team. We welcome your tips, feedback, and inquiries."
        keywords="contact tech theory, tech news tips, advertising inquiries"
      />
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-12">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>»</span>
            <span className="text-foreground">Contact Us</span>
          </div>

          <div className="text-center max-w-2xl mx-auto">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-8">
              Contact Us
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              We love hearing from our readers! Whether you have a tech tip, feedback on our content, 
              or just want to say hello, feel free to reach out. Our team is ready to connect with you.
            </p>

            {/* Social Icons */}
            <div className="flex items-center justify-center gap-8 text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                <Youtube className="w-7 h-7" />
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
