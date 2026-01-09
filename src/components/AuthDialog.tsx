import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function AuthDialog({ 
  isOpen, 
  onOpenChange,
  title = "Log in or Create an Account",
  description
}: AuthDialogProps) {
  const { login, loginWithGoogle, register } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<"options" | "email">("options");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setView("options");
      setIsSignUp(false);
      setFormData({ name: "", email: "", password: "" });
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Google sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        // Sign Up Logic
        const success = await register(formData.name, formData.email, formData.password);
        if (success) {
           // Depending on auth flow, might need verification or auto-login
           // For now assuming register logs in or shows success toast via context
           onOpenChange(false);
        }
      } else {
        // Login Logic
        const success = await login(formData.email, formData.password);
        if (success) {
          onOpenChange(false);
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[340px] p-0 overflow-hidden bg-card border-border">
        <div className="p-5">
          <DialogHeader className="mb-5">
            <div className="mx-auto mb-3 w-fit">
              <img 
                src="/logo.png" 
                alt="Tech Theory" 
                className="h-10 w-auto object-contain dark:invert"
              />
            </div>
            <DialogTitle className="text-center text-lg font-bold">{title}</DialogTitle>
            {description && (
              <DialogDescription className="text-center text-muted-foreground text-xs">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>

          {view === "options" ? (
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-10 text-sm font-medium justify-start px-4 relative"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <Button
                variant="outline"
                className="w-full h-10 text-sm font-medium justify-start px-4"
                onClick={() => setView("email")}
              >
                <Mail className="w-4 h-4 mr-3" />
                Continue with Email
              </Button>
              
              <div className="text-xs text-center text-muted-foreground mt-4 px-4">
                By creating an account, you agree to our Terms of Use and Privacy Policy.
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mb-2 -ml-2 text-muted-foreground"
                onClick={() => setView("options")}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required 
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSignUp ? "Create Account" : "Sign In"}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    {isSignUp ? "Already have an account? " : "Don't have an account? "}
                  </span>
                  <Button 
                    type="button"
                    variant="link" 
                    className="p-0 h-auto font-semibold"
                    onClick={() => setIsSignUp(!isSignUp)}
                  >
                    {isSignUp ? "Sign in" : "Sign up"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
