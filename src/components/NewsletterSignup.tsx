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
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 max-w-2xl mx-auto">
      <CardHeader className="text-center pb-2 pt-6">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
          <Mail className="w-5 h-5 text-primary-foreground" />
        </div>
        <CardTitle className="text-xl">Stay Updated</CardTitle>
        <CardDescription className="text-base">
          Get the latest tech news and insights delivered to your inbox weekly
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-10 text-sm px-4"
              required
            />
            <Button type="submit" disabled={isLoading} className="whitespace-nowrap h-10 px-6 text-sm">
              {isLoading ? "Subscribing..." : "Subscribe"}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            By subscribing, you agree to receive our newsletter and can unsubscribe at any time.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewsletterSignup;
