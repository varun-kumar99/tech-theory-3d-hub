import { useState } from "react";
import { Eye, EyeOff, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const AdminAuth = () => {
  const navigate = useNavigate();
  
  // Admin state
  const [adminData, setAdminData] = useState({
    email: "",
    password: "",
  });

  // Author state
  const [authorData, setAuthorData] = useState({
    email: "",
    password: "",
  });

  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showAuthorPassword, setShowAuthorPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminData.email || !adminData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Mock admin authentication
      if (adminData.email === "admin@techtheory.com" && adminData.password === "admin123") {
        localStorage.setItem("admin-auth", JSON.stringify({
          role: "admin",
          user: { name: "Admin", email: adminData.email }
        }));
        toast({
          title: "Success",
          description: "Welcome Admin!"
        });
        navigate("/admin/dashboard");
      } else {
        toast({
          title: "Error",
          description: "Invalid admin credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authorData.email || !authorData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Mock author authentication
      if (authorData.email === "author@techtheory.com" && authorData.password === "author123") {
        localStorage.setItem("admin-auth", JSON.stringify({
          role: "author",
          user: { name: "Author", email: authorData.email }
        }));
        toast({
          title: "Success",
          description: "Welcome Author!"
        });
        navigate("/admin/author-dashboard");
      } else {
        toast({
          title: "Error",
          description: "Invalid author credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'admin' | 'author') => {
    if (role === 'admin') {
      setAdminData({
        email: "admin@techtheory.com",
        password: "admin123"
      });
    } else {
      setAuthorData({
        email: "author@techtheory.com",
        password: "author123"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="Tech Theory" 
            className="h-12 w-auto object-contain mx-auto mb-4 invert"
          />
          <h2 className="text-2xl font-semibold text-white">Admin Portal</h2>
          <p className="text-gray-300 mt-2">
            Access admin panel or author dashboard
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Administrator Access</CardTitle>
            <CardDescription className="text-gray-300">
              Choose your role to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/20">
                <TabsTrigger value="admin" className="text-white data-[state=active]:bg-white/30">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="author" className="text-white data-[state=active]:bg-white/30">
                  <User className="w-4 h-4 mr-2" />
                  Author
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="admin" className="space-y-4 mt-6">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-white">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@techtheory.com"
                      value={adminData.email}
                      onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                      className="bg-white/20 border-white/30 text-white placeholder-gray-300"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="text-white">Password</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showAdminPassword ? "text" : "password"}
                        placeholder="Enter admin password"
                        value={adminData.password}
                        onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                        className="bg-white/20 border-white/30 text-white placeholder-gray-300 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in as Admin"}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10"
                    onClick={() => fillDemoCredentials('admin')}
                  >
                    Use Demo Admin
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="author" className="space-y-4 mt-6">
                <form onSubmit={handleAuthorLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="author-email" className="text-white">Email</Label>
                    <Input
                      id="author-email"
                      type="email"
                      placeholder="author@techtheory.com"
                      value={authorData.email}
                      onChange={(e) => setAuthorData({ ...authorData, email: e.target.value })}
                      className="bg-white/20 border-white/30 text-white placeholder-gray-300"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="author-password" className="text-white">Password</Label>
                    <div className="relative">
                      <Input
                        id="author-password"
                        type={showAuthorPassword ? "text" : "password"}
                        placeholder="Enter author password"
                        value={authorData.password}
                        onChange={(e) => setAuthorData({ ...authorData, password: e.target.value })}
                        className="bg-white/20 border-white/30 text-white placeholder-gray-300 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAuthorPassword(!showAuthorPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                      >
                        {showAuthorPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in as Author"}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10"
                    onClick={() => fillDemoCredentials('author')}
                  >
                    Use Demo Author
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAuth;
