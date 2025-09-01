import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail("");
    }, 1000);
  };

  if (isSubscribed) {
    return (
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Successfully Subscribed!</h3>
            <p className="text-muted-foreground">
              Thank you for joining our newsletter. You'll receive the latest tech insights in your inbox.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl">Stay Updated</CardTitle>
        <CardDescription className="text-lg">
          Get the latest tech news and insights delivered to your inbox weekly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 max-w-4xl mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 text-base px-4"
              required
            />
            <Button type="submit" disabled={isLoading} className="whitespace-nowrap h-12 px-6">
              {isLoading ? "Subscribing..." : "Subscribe"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            By subscribing, you agree to receive our newsletter and can unsubscribe at any time.
          </p>
        </form>
        
        {/* Newsletter Benefits */}
        <div className="mt-4 max-w-lg mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="text-center">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-primary font-bold">📧</span>
              </div>
              <p className="font-medium">Weekly Digest</p>
              <p className="text-muted-foreground text-xs">Top stories curated</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-primary font-bold">🚀</span>
              </div>
              <p className="font-medium">Early Access</p>
              <p className="text-muted-foreground text-xs">Exclusive content</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-primary font-bold">💡</span>
              </div>
              <p className="font-medium">Expert Insights</p>
              <p className="text-muted-foreground text-xs">Industry analysis</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsletterSignup;
