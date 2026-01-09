import { useState } from "react";
import { Eye, EyeOff, Shield, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { userService } from "@/services/userService";

const AdminAuth = () => {
  console.log("AdminAuth rendering");
  const navigate = useNavigate();
  
  // Admin state
  const [adminData, setAdminData] = useState({
    username: "",
    password: "",
  });

  // Author state
  const [authorData, setAuthorData] = useState({
    username: "",
    password: "",
  });

  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showAuthorPassword, setShowAuthorPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const username = adminData.username.trim();
    const password = adminData.password.trim();

    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Check against stored users
      const users = userService.getAllUsers();
      const adminUser = users.find(u => 
        u.username === username && 
        u.password === password && 
        u.role === 'admin' &&
        u.status === 'active'
      );

      if (adminUser) {
        localStorage.setItem("admin-auth", JSON.stringify({
          role: "admin",
          user: { name: adminUser.name, email: adminUser.email }
        }));
        toast({
          title: "Success",
          description: `Welcome ${adminUser.name}!`
        });
        navigate("/admin/dashboard");
      } else {
        // Check if user exists but with wrong role
        const wrongRoleUser = users.find(u => u.username === username && u.password === password);
        if (wrongRoleUser) {
           toast({
            title: "Error",
            description: `This is an ${wrongRoleUser.role} account. Please use the ${wrongRoleUser.role === 'author' ? 'Author' : 'Admin'} tab.`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: "Invalid admin credentials",
            variant: "destructive"
          });
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: `Login failed: ${error.message || "Unknown error"}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const username = authorData.username.trim();
    const password = authorData.password.trim();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Check against stored users
      const users = userService.getAllUsers();
      console.log("Checking credentials against users:", users.length);
      
      const authorUser = users.find(u => 
        u.username === username && 
        u.password === password && 
        u.role === 'author' &&
        u.status === 'active'
      );

      if (authorUser) {
        localStorage.setItem("admin-auth", JSON.stringify({
          role: "author",
          user: { name: authorUser.name, email: authorUser.email }
        }));
        toast({
          title: "Success",
          description: `Welcome ${authorUser.name}!`
        });
        navigate("/admin/author-dashboard");
      } else {
          // Check if user exists but with wrong role
         const wrongRoleUser = users.find(u => u.username === username && u.password === password);
         if (wrongRoleUser) {
            toast({
             title: "Error",
             description: `This is an ${wrongRoleUser.role} account. Please use the ${wrongRoleUser.role === 'admin' ? 'Admin' : 'Author'} tab.`,
             variant: "destructive"
           });
         } else {
           // Fallback debug - check if username exists but password wrong
           const userExists = users.find(u => u.username === username);
           if (userExists) {
             toast({
               title: "Error",
               description: "Invalid password",
               variant: "destructive"
             });
           } else {
             toast({
               title: "Error",
               description: "User not found",
               variant: "destructive"
             });
           }
         }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: `Login failed: ${error.message || "Unknown error"}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
                  <UserIcon className="w-4 h-4 mr-2" />
                  Author
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="admin" className="space-y-4 mt-6">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-username" className="text-white">Username</Label>
                    <Input
                      id="admin-username"
                      type="text"
                      placeholder="Username"
                      autoComplete="off"
                      value={adminData.username}
                      onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
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
                </form>
              </TabsContent>
              
              <TabsContent value="author" className="space-y-4 mt-6">
                <form onSubmit={handleAuthorLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="author-username" className="text-white">Username</Label>
                    <Input
                      id="author-username"
                      type="text"
                      placeholder="Username"
                      autoComplete="off"
                      value={authorData.username}
                      onChange={(e) => setAuthorData({ ...authorData, username: e.target.value })}
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
