import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
    // Check for saved user on mount
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
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

  const addBookmark = (articleId: number) => {
    if (user && !user.bookmarks.includes(articleId)) {
      const updatedUser = {
        ...user,
        bookmarks: [...user.bookmarks, articleId]
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const removeBookmark = (articleId: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        bookmarks: user.bookmarks.filter(id => id !== articleId)
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const addToReadingHistory = (articleId: number) => {
    if (user && !user.readingHistory.includes(articleId)) {
      const updatedUser = {
        ...user,
        readingHistory: [articleId, ...user.readingHistory.slice(0, 49)] // Keep last 50
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
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
