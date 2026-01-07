import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    categories: string[];
    emailNotifications: boolean;
  };
  bookmarks: number[];
  readingHistory: number[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addBookmark: (articleId: number) => void;
  removeBookmark: (articleId: number) => void;
  addToReadingHistory: (articleId: number) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase is configured
    if (isSupabaseConfigured()) {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchSupabaseUser(session.user);
        } else {
          setIsLoading(false);
        }
      });

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await fetchSupabaseUser(session.user);
        } else {
          setUser(null);
          setIsLoading(false);
          localStorage.removeItem('user');
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Fallback to local storage for development without Supabase
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Failed to parse user from local storage:", error);
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    }
  }, []);

  const fetchSupabaseUser = async (supabaseUser: any) => {
    try {
      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
        
      // Fetch bookmarks
      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select('article_id')
        .eq('user_id', supabaseUser.id);
        
      const bookmarks = bookmarksData?.map(b => Number(b.article_id)) || [];

      // Construct app user object
      const appUser: User = {
        id: supabaseUser.id,
        name: profile?.full_name || supabaseUser.email?.split('@')[0] || 'User',
        email: supabaseUser.email || '',
        avatar: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url,
        preferences: profile?.preferences || {
          theme: 'system',
          categories: [],
          emailNotifications: true
        },
        bookmarks: bookmarks,
        readingHistory: [] // Reading history could be another table
      };
      
      setUser(appUser);
      // Keep local storage in sync for parts of the app that might read it directly (legacy)
      localStorage.setItem('user', JSON.stringify(appUser));
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        return true;
      } else {
        // Mock authentication - replace with actual API call
        if (email === "demo@example.com" && password === "password") {
          const mockUser: User = {
            id: "1",
            name: "Demo User",
            email: email,
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            preferences: {
              theme: 'system',
              categories: ['AI', 'Technology'],
              emailNotifications: true
            },
            bookmarks: [],
            readingHistory: []
          };
          
          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
        });
        if (error) throw error;
        return true;
      } else {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockGoogleUser: User = {
          id: "google-user-" + Date.now(),
          name: "Google User",
          email: "user@gmail.com",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face", // Realistic avatar for Google user
          preferences: {
            theme: 'system',
            categories: [],
            emailNotifications: true
          },
          bookmarks: [],
          readingHistory: []
        };
        
        setUser(mockGoogleUser);
        localStorage.setItem('user', JSON.stringify(mockGoogleUser));
        return true;
      }
    } catch (error) {
      console.error("Google login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });
        
        if (error) throw error;
        
        // If auto-confirm is enabled, we might get a session immediately
        // Otherwise, the user needs to confirm email
        if (data.user) {
          // Create profile entry if it doesn't exist (trigger usually handles this, but manual is safer fallback)
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ 
              id: data.user.id,
              full_name: name,
              username: email.split('@')[0] + Math.floor(Math.random() * 1000)
            });
            
          if (profileError) console.error("Error creating profile:", profileError);
        }
        
        return true;
      } else {
        // Mock registration - replace with actual API call
        const mockUser: User = {
          id: Date.now().toString(),
          name,
          email,
          preferences: {
            theme: 'system',
            categories: [],
            emailNotifications: true
          },
          bookmarks: [],
          readingHistory: []
        };
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return true;
      }
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const addBookmark = async (articleId: number) => {
    if (user && !user.bookmarks.includes(articleId)) {
      const updatedBookmarks = [...user.bookmarks, articleId];
      
      // Update local state immediately for UI responsiveness
      const updatedUser = {
        ...user,
        bookmarks: updatedBookmarks
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Sync with Supabase
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('bookmarks')
          .insert({ user_id: user.id, article_id: articleId });
          
        if (error) {
          console.error("Error adding bookmark to Supabase:", error);
          // Revert on error? For now, we keep local state optimistic
        }
      }
    }
  };

  const removeBookmark = async (articleId: number) => {
    if (user) {
      const updatedBookmarks = user.bookmarks.filter(id => id !== articleId);
      
      // Update local state
      const updatedUser = {
        ...user,
        bookmarks: updatedBookmarks
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Sync with Supabase
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', articleId);
          
        if (error) {
          console.error("Error removing bookmark from Supabase:", error);
        }
      }
    }
  };

  const addToReadingHistory = async (articleId: number) => {
    if (user && !user.readingHistory.includes(articleId)) {
      const updatedHistory = [articleId, ...user.readingHistory.slice(0, 49)]; // Keep last 50
      
      // Update local state
      const updatedUser = {
        ...user,
        readingHistory: updatedHistory
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Sync with Supabase (storing in preferences for now as schema doesn't have reading_history table)
      if (isSupabaseConfigured()) {
        const updatedPreferences = {
          ...user.preferences,
          reading_history: updatedHistory
        };
        
        const { error } = await supabase
          .from('profiles')
          .update({ preferences: updatedPreferences })
          .eq('id', user.id);
          
        if (error) {
          console.error("Error updating reading history in Supabase:", error);
        }
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUser,
        addBookmark,
        removeBookmark,
        addToReadingHistory,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
