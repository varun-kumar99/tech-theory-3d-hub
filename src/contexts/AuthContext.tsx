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
  bookmarks: (string | number)[];
  readingHistory: (string | number)[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  addBookmark: (articleId: string | number) => void;
  removeBookmark: (articleId: string | number) => void;
  addToReadingHistory: (articleId: string | number) => void;
  isLoading: boolean;
  isUserFullyLoaded: boolean;
  isFetchingUser: boolean;
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
  const [isUserFullyLoaded, setIsUserFullyLoaded] = useState(false);
  const [isFetchingUser, setIsFetchingUser] = useState(false);

  useEffect(() => {
    // Check if Supabase is configured
    if (isSupabaseConfigured()) {
      setIsLoading(true); // Start loading initially
      setIsUserFullyLoaded(false); // Not fully loaded yet

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("onAuthStateChange event:", event, "session:", session ? session.user?.id : "no session");

        if (session?.user) {
          // Only proceed if the user is not already set or if it's a different user
          // And if we are not already fetching user data
          if (!user || user.id !== session.user.id || !isFetchingUser) {
            await ensureProfileExists(session.user);
            await fetchSupabaseUser(session.user);
          } else {
            console.log("onAuthStateChange: User already set or fetching in progress, skipping fetch.");
          }
        } else {
          setUser(null);
          localStorage.removeItem('user');
          setIsLoading(false);
          setIsUserFullyLoaded(true);
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
      setIsUserFullyLoaded(true);
    }
  }, []);



  const ensureProfileExists = async (supabaseUser: any) => {
    try {
      console.log("ensureProfileExists: Checking for profile existence for user:", supabaseUser.id);
      // Set a timeout for the profile check to prevent hangs
      const profilePromise = (async () => {
        console.log("ensureProfileExists: Attempting to select profile.");
        const { data, error } = await retry(() =>
          supabase
            .from('profiles')
            .select('id')
            .eq('id', supabaseUser.id)
            .maybeSingle()
        );
        
        if (error) {
          console.error("ensureProfileExists: Error during profile select:", error);
        } else if (data) {
          console.log("ensureProfileExists: Profile found during select.");
        } else {
          console.log("ensureProfileExists: No profile found during select.");
        }

        if (!data && !error) {
          console.log("ensureProfileExists: No profile found for user, attempting to create one...");
          console.log("ensureProfileExists: Attempting to insert new profile.");
          const { error: insertError } = await retry(() =>
            supabase
              .from('profiles')
              .insert({
                id: supabaseUser.id,
                email: supabaseUser.email,
                full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
                avatar_url: supabaseUser.user_metadata?.avatar_url,
                username: (supabaseUser.email?.split('@')[0] || 'user') + Math.floor(Math.random() * 1000)
              })
          );
        
          if (insertError) {
            if (insertError.code === '23505') { // PostgreSQL unique violation error code
              console.log("ensureProfileExists: Profile already exists (duplicate key error).");
            } else {
              console.error("ensureProfileExists: Error creating profile:", insertError);
            }
          } else {
            console.log("ensureProfileExists: Profile created successfully");
          }
        } else if (error) {
          console.error("ensureProfileExists: Error selecting profile:", error);
        } else {
          console.log("ensureProfileExists: Profile already exists.");
        }
      })();

      // Wait at most 10 seconds for profile operations
      await Promise.race([
        profilePromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Profile creation timeout")), 20000))
      ]);
    } catch (err) {
      console.error("Exception in ensureProfileExists:", err);
    }
  };

  const fetchSupabaseUser = async (supabaseUser: any) => {
    if (isFetchingUser) {
      console.log("fetchSupabaseUser: Already fetching user data, returning early.");
      return;
    }
    setIsFetchingUser(true);
    console.log("fetchSupabaseUser: Started for user:", supabaseUser.id);
    // 1. Set basic user info immediately so the UI can render
    const initialUser: User = {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email || '',
      avatar: supabaseUser.user_metadata?.avatar_url,
      preferences: {
        theme: 'system',
        categories: [],
        emailNotifications: true
      },
      bookmarks: [],
      readingHistory: []
    };
    setUser(initialUser);

    const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));

  const retry = async <T,>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        console.warn(`Retry attempt (${retries} left) after error:`, error);
        await new Promise(res => setTimeout(res, delay));
        return retry(fn, retries - 1, delay * 2); // Exponential backoff
      }
      throw error;
    }
  };
    
    try {
      // 2. Fetch additional data in the background
      console.log("fetchSupabaseUser: Fetching additional profile data...");
      
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
        
      const bookmarksPromise = supabase
        .from('bookmarks')
        .select('article_id')
        .eq('user_id', supabaseUser.id);
        
      const historyPromise = supabase
        .from('user_reading_history')
        .select('article_id')
        .eq('user_id', supabaseUser.id)
        .order('last_read_at', { ascending: false })
        .limit(50);

      // Run all requests in parallel with a single timeout for all
      const [profileResult, bookmarksResult, historyResult] = await Promise.allSettled([
        Promise.race([profilePromise, timeout(10000)]),
        Promise.race([bookmarksPromise, timeout(10000)]),
        Promise.race([historyPromise, timeout(10000)])
      ]);

      let profile: any = null;
      let bookmarks: any[] = [];
      let readingHistory: any[] = [];

      if (profileResult.status === 'fulfilled') {
        const { data, error } = (profileResult.value as any);
        if (!error) profile = data;
      }

      if (bookmarksResult.status === 'fulfilled') {
        const { data, error } = (bookmarksResult.value as any);
        if (!error && data) bookmarks = data.map((b: any) => b.article_id);
      }

      if (historyResult.status === 'fulfilled') {
        const { data, error } = (historyResult.value as any);
        if (!error && data) readingHistory = data.map((h: any) => h.article_id);
      }

      // 3. Update user with full data
      const fullUser: User = {
        ...initialUser,
        name: profile?.full_name || initialUser.name,
        avatar: profile?.avatar_url || initialUser.avatar,
        preferences: profile?.preferences || initialUser.preferences,
        bookmarks: bookmarks,
        readingHistory: readingHistory
      };
      
      console.log("fetchSupabaseUser: User profile background load complete:", fullUser.name);
      setUser(fullUser);
      localStorage.setItem('user', JSON.stringify(fullUser));
    } catch (error) {
      console.error("fetchSupabaseUser: Error in background fetch:", error);
      // user is already set to initialUser, so no need to do anything here
    } finally {
      setIsLoading(false);
      setIsUserFullyLoaded(true);
      setIsFetchingUser(false);
      console.log("fetchSupabaseUser: Finished for user:", supabaseUser.id);
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
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error("Error during Supabase sign out:", error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('admin-auth');
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const addBookmark = async (articleId: string | number) => {
    if (user && !user.bookmarks.some(bId => String(bId) === String(articleId))) {
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
        try {
          const { error } = await supabase
            .from('bookmarks')
            .insert({ user_id: user.id, article_id: articleId });
            
          if (error) {
            console.error("Error adding bookmark to Supabase:", error);
          }
        } catch (e) {
          console.error("Exception adding bookmark:", e);
        }
      }
    }
  };

  const removeBookmark = async (articleId: string | number) => {
    if (user) {
      const updatedBookmarks = user.bookmarks.filter(bId => String(bId) !== String(articleId));
      
      // Update local state
      const updatedUser = {
        ...user,
        bookmarks: updatedBookmarks
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Sync with Supabase
      if (isSupabaseConfigured()) {
        try {
          const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('user_id', user.id)
            .eq('article_id', articleId);
            
          if (error) {
            console.error("Error removing bookmark from Supabase:", error);
          }
        } catch (e) {
          console.error("Exception removing bookmark:", e);
        }
      }
    }
  };

  const addToReadingHistory = async (articleId: string | number) => {
    // Check if user exists and if the article is not already at the top of the history
    // We allow re-reading, but if it's the most recent one, we don't duplicate it immediately
    if (!user) {
      return;
    }
    if (user.readingHistory[0] === articleId) {
      return;
    }
    
    const filteredHistory = user.readingHistory.filter(id => String(id) !== String(articleId));
    const updatedHistory = [articleId, ...filteredHistory].slice(0, 50); // Keep last 50 unique articles
    
    // Update local state
    const updatedUser = {
      ...user,
      readingHistory: updatedHistory
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    // Sync with Supabase
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('user_reading_history')
        .upsert({ 
          user_id: user.id, 
          article_id: articleId,
          last_read_at: new Date().toISOString()
        });
        
      if (error) {
        console.error("Error updating reading history in Supabase:", error);
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
        isLoading,
        isUserFullyLoaded,
        isFetchingUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
