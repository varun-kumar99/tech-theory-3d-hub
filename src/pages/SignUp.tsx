import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const SignUp = () => {
  const navigate = useNavigate();

  // Steps: 'details' | 'verify'
  const [step, setStep] = useState<'details' | 'verify'>('details');
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    
    try {
      if (!isSupabaseConfigured()) {
        // Simulation for Demo Mode
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success("Demo Mode: Verification code sent (use 123456)");
        setStep('verify');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        // User is auto-confirmed and logged in
        toast.success("Account created successfully!");
        navigate("/");
      } else if (data.user) {
        // User created but needs verification
        toast.success("Verification code sent to your email");
        setStep('verify');
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      if (isSupabaseConfigured()) setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.otp) {
      toast.error("Please enter the verification code");
      return;
    }

    setIsLoading(true);

    try {
      if (!isSupabaseConfigured()) {
        // Simulation for Demo Mode
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (formData.otp !== "123456") {
          throw new Error("Invalid demo code. Use 123456");
        }

        const mockUser = {
          id: "demo-user-" + Date.now(),
          name: formData.name,
          email: formData.email,
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + formData.name,
          preferences: {
            theme: 'system',
            categories: [],
            emailNotifications: true
          },
          bookmarks: [],
          readingHistory: []
        };
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        toast.success("Email verified! Welcome to Tech Theory.");
        // Force reload to update AuthContext from localStorage
        window.location.href = "/";
        return;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: formData.otp,
        type: 'signup'
      });

      if (error) throw error;

      if (data.session) {
        
        // Create profile entry if needed (though trigger should handle it)
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ 
            id: data.user.id,
            full_name: formData.name,
            username: formData.email.split('@')[0] + Math.floor(Math.random() * 1000)
          });
          
        if (profileError) console.error("Error creating profile:", profileError);

        toast.success("Email verified! Welcome to Tech Theory.");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(error.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Gradient Background */}
      <div className="hidden lg:flex lg:w-[70%] bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 items-center justify-center p-12">
        <div className="text-center text-white w-full flex flex-col items-center">
          <div className="mb-8">
            <img 
              src="/logo.png" 
              alt="Tech Theory" 
              className="h-32 w-auto object-contain mx-auto mb-2 invert"
            />
          </div>
          <div className="flex flex-col items-center max-w-2xl">
            <h2 className="text-4xl font-light mb-6 leading-tight">
              Join the Future of Tech
            </h2>
            <p className="text-xl font-light opacity-90 leading-relaxed">
              Discover cutting-edge articles, connect with authors, and share your own tech theories with our growing community.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Sign Up Form */}
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

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                {step === 'details' ? "Create an account" : "Verify email"}
              </h2>
              <p className="text-muted-foreground">
                {step === 'details' 
                  ? "Enter your details to get started" 
                  : `We've sent a verification code to ${formData.email}`
                }
              </p>
            </div>

            {step === 'details' ? (
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10 h-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    className="h-12 text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Tip: If you received a link instead of a code, please click the link in your email.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700 text-white mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify & Login"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep('details')}
                  disabled={isLoading}
                >
                  Back to details
                </Button>
              </form>
            )}

            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/auth" className="text-blue-600 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
