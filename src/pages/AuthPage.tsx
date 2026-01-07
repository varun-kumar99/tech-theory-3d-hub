import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthPage = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Login state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(loginData.email, loginData.password);
      if (success) {
        toast.success("Welcome back!");
        navigate("/");
      } else {
        toast.error("Invalid credentials. Try demo@example.com / password");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setLoginData({
      email: "demo@example.com",
      password: "password",
      rememberMe: false
    });
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        toast.success("Successfully signed in with Google!");
        navigate("/");
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error("Google sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Gradient Background with Welcome Text */}
      <div className="hidden lg:flex lg:w-[70%] bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 items-center justify-center p-12">
        <div className="text-center text-white w-full flex flex-col items-center">
          <div className="mb-4">
            <img 
              src="/logo.png" 
              alt="Tech Theory" 
              className="h-32 w-auto object-contain mx-auto mb-2 invert"
            />
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-4xl font-light mb-6 leading-tight">
              Welcome to Tech Theory
            </h2>
            <p className="text-xl font-light opacity-90 leading-relaxed max-w-lg">
              Create an account and join the community
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="w-full lg:w-[30%] flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8 flex justify-center">
            <img 
              src="/logo.png" 
              alt="Tech Theory" 
              className="h-8 w-auto object-contain dark:invert"
            />
          </div>

          {/* Sign In Form */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Sign In</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="varunkumar99984@gmail.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="h-12 text-base"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="h-12 text-base pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={loginData.rememberMe}
                    onCheckedChange={(checked) => 
                      setLoginData({ ...loginData, rememberMe: checked as boolean })
                    }
                  />
                  <Label htmlFor="remember-me" className="text-sm text-muted-foreground">
                    Stay signed in
                  </Label>
                </div>
                
                <Button variant="link" className="p-0 text-sm text-primary hover:underline">
                  Forgot username?
                </Button>
              </div>

              {/* Sign In Button */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 rounded-lg p-[3px] opacity-75 hover:opacity-100 transition-opacity duration-300">
                  <div className="w-full h-full bg-transparent rounded-lg"></div>
                </div>
                <Button 
                  type="submit" 
                  className="relative w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white border-2 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg overflow-hidden group"
                  disabled={isLoading}
                >
                  <span className="relative z-10">{isLoading ? "Signing in..." : "Next"}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </div>

              {/* Demo Account Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base font-medium"
                onClick={fillDemoCredentials}
              >
                Try Demo Account
              </Button>

              {/* Create Account Link */}
              <div className="text-center">
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-base font-medium border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                  onClick={() => navigate("/signup")}
                >
                  Create an account
                </Button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-4 text-muted-foreground">or</span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base font-medium"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
