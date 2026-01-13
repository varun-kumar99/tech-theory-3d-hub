import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { userService, User } from "@/services/userService";
import { articleService } from "@/services/articleService";
import { toast } from "@/hooks/use-toast";
import { PlusCircle, Trash2, Shield, User as UserIcon, ArrowLeft, Eye, EyeOff, Database, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const ManageCredentials = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStats, setMigrationStats] = useState({ users: 0, articles: 0 });
  
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    email: "", 
    password: "",
    role: "author" as "admin" | "author" | "editor",
    status: "active" as "active" | "inactive"
  });

  useEffect(() => {
    loadUsers();
    checkLocalStats();
  }, []);

  const loadUsers = async () => {
    const data = await userService.getAllUsers();
    setUsers(data);
  };

  const checkLocalStats = () => {
    const localUsers = userService.getLocalUsers();
    // We can't easily get local articles count without async, but let's estimate or fetch
    const storedArticles = localStorage.getItem('tech_theory_articles');
    const localArticlesCount = storedArticles ? JSON.parse(storedArticles).length : 0;
    setMigrationStats({
      users: localUsers.length,
      articles: localArticlesCount
    });
  };

  const handleMigrateArticles = async () => {
    if (!isSupabaseConfigured()) {
      toast({ title: "Error", description: "Supabase is not configured", variant: "destructive" });
      return;
    }
    
    setIsMigrating(true);
    try {
      const result = await articleService.migrateLocalArticles();
      toast({
        title: "Migration Complete",
        description: `Successfully migrated ${result.success} articles. Failed: ${result.failed}`,
      });
      loadUsers(); // Refresh anything if needed
    } catch (error) {
      toast({ title: "Error", description: "Migration failed", variant: "destructive" });
    } finally {
      setIsMigrating(false);
    }
  };

  // Warning: This function is complex because client-side user creation is restricted
  const handleMigrateUsers = async () => {
    if (!isSupabaseConfigured()) return;
    
    if (!confirm("Warning: Migrating users will attempt to create accounts in Supabase. This process might be interrupted by authentication changes. Do you want to proceed?")) {
      return;
    }

    setIsMigrating(true);
    const localUsers = userService.getLocalUsers();
    let successCount = 0;
    let failCount = 0;

    for (const user of localUsers) {
      try {
        // We attempt to sign up. 
        // NOTE: This will sign in the user immediately!
        // We must immediately sign out to continue, but this invalidates the loop's context in some frameworks.
        // However, since we are iterating a local array, it might work if we handle the session.
        
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password || 'TemporaryPass123!', // Use stored pass or default
          options: {
            data: {
              full_name: user.name,
              role: user.role,
              username: user.username
            }
          }
        });

        if (error) {
          console.error(`Failed to migrate user ${user.username}:`, error.message);
          
          // CRITICAL FIX: If user already exists, we MUST treat this as success for the "profiles" table
          // The auth user exists, but the profile might be missing or incomplete.
          // We can't update Auth User (requires admin), but we CAN upsert the Profile.
          
          if (error.message.includes("already registered") || error.message.includes("unique constraint")) {
              // Try to find the user's ID by email (we can't query auth.users, but we can try to insert profile)
              // Actually, we can't get the UUID if we are anon... this is tricky.
              // BUT, if we are logged in as Admin, we might be able to? No, RLS.
              
              // ALTERNATIVE: Just count it as skipped/failed, but maybe try to insert profile if we somehow knew the ID.
              // Since we don't know the ID, we can't fix the profile.
              
              // However, if the user was created *by us* in a previous failed run, they exist.
              console.log("User already exists, skipping auth creation.");
          }
          failCount++;
        } else if (data.user) {
          successCount++;
          // Create profile entry explicitly just in case trigger failed or needed extra data
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            username: user.username,
            full_name: user.name,
            email: user.email,
            role: user.role,
            avatar_url: user.avatar
          });
          
          if (profileError) {
             console.error("Profile creation failed:", profileError);
          }

          // IMPORTANT: Sign out immediately so we can process the next one (or restore original session)
          await supabase.auth.signOut();
        }
      } catch (e) {
        console.error(e);
        failCount++;
      }
    }

    setIsMigrating(false);
    toast({
      title: "User Migration Completed",
      description: `Created ${successCount} users. Skipped/Failed ${failCount}. You have been logged out.`,
    });
    
    // Clear local auth state and reload
    await logout();
    window.location.reload();
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.username || !newUser.password) {
      toast({
        title: "Error",
        description: "Name, Username, and Password are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const email = newUser.email || `${newUser.username}@techtheory.com`;
      
      await userService.addUser({
        ...newUser,
        email,
        bio: "",
        avatar: ""
      });
      
      toast({
        title: "Success",
        description: "User added successfully"
      });
      
      loadUsers();
      setIsDialogOpen(false);
      setNewUser({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "author",
        status: "active"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add user",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await userService.deleteUser(id);
      toast({
        title: "Success",
        description: "User deleted successfully"
      });
      loadUsers();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/admin/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Credential Manager</h1>
              <p className="text-gray-500">Manage admin and author access credentials</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isSupabaseConfigured() && (
               <Dialog>
                 <DialogTrigger asChild>
                   <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                     <Database className="w-4 h-4 mr-2" />
                     Migration Tools
                   </Button>
                 </DialogTrigger>
                 <DialogContent>
                   <DialogHeader>
                     <DialogTitle>Migrate Data to Supabase</DialogTitle>
                     <DialogDescription>
                       Move your local browser data to the cloud database.
                     </DialogDescription>
                   </DialogHeader>
                   <div className="py-4 space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">Local Data Found:</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-2 bg-background rounded">
                            <div className="text-2xl font-bold">{migrationStats.users}</div>
                            <div className="text-xs text-muted-foreground">Users</div>
                          </div>
                          <div className="text-center p-2 bg-background rounded">
                            <div className="text-2xl font-bold">{migrationStats.articles}</div>
                            <div className="text-xs text-muted-foreground">Articles</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Step 1: Migrate Users</Label>
                        <Button 
                          onClick={handleMigrateUsers} 
                          disabled={isMigrating || migrationStats.users === 0}
                          className="w-full"
                        >
                          {isMigrating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Migrate Users & Credentials
                        </Button>
                        <p className="text-xs text-yellow-600">
                          Warning: This may log you out. Passwords will be preserved if possible.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Step 2: Migrate Articles</Label>
                        <Button 
                          onClick={handleMigrateArticles} 
                          disabled={isMigrating || migrationStats.articles === 0}
                          className="w-full"
                          variant="secondary"
                        >
                          {isMigrating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Migrate Articles
                        </Button>
                      </div>
                   </div>
                 </DialogContent>
               </Dialog>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={isSupabaseConfigured()} title={isSupabaseConfigured() ? "Use Sign Up page instead" : "Add User"}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add New User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new account with username and password.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      placeholder="e.g. john.doe"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Enter password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="author">Author</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button onClick={handleAddUser} className="w-full">
                  Create User
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
            <CardDescription>
              {isSupabaseConfigured() 
                ? "List of all users from Supabase Database." 
                : "List of all users in Local Storage."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                           {user.avatar ? (
                             <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                           ) : (
                             user.name.charAt(0).toUpperCase()
                           )}
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{user.username}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageCredentials;
