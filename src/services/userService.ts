import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'author' | 'editor';
  status: 'active' | 'inactive';
  password?: string;
  avatar?: string;
  bio?: string;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  joinedDate: string;
}

const STORAGE_KEY = 'tech_theory_users_v4';

const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Varun',
    username: 'varun99.techtheory',
    email: 'varun99.techtheory@techtheory.co.in',
    role: 'admin',
    status: 'active',
    password: 'Varun@99',
    avatar: 'https://github.com/shadcn.png',
    joinedDate: '2024-01-01'
  },
  {
    id: '2',
    name: 'Author Varun',
    username: 'varun99.author',
    email: 'author@techtheory.co.in',
    role: 'author',
    status: 'active',
    password: 'Varun@99',
    avatar: '',
    joinedDate: '2024-01-15'
  },
  {
    id: '3',
    name: 'Mohd Mehtab',
    username: 'mohdmehtab.techtheory',
    email: 'mohdmehtab.techtheory@techtheory.co.in',
    role: 'author',
    status: 'active',
    password: 'mohdmehtab.techtheory',
    avatar: '',
    joinedDate: '2024-01-20'
  },
  {
    id: '4',
    name: 'Utkarsh',
    username: 'utkarsh98.techtheory',
    email: 'utkarsh98.techtheory@techtheory.co.in',
    role: 'author',
    status: 'active',
    password: 'utkarsh98.techtheory',
    avatar: '',
    joinedDate: '2024-01-20'
  },
  {
    id: '5',
    name: 'Ritesh Kumar',
    username: 'riteshkumar.techtheory',
    email: 'riteshkumar.techtheory@techtheory.co.in',
    role: 'author',
    status: 'active',
    password: 'riteshkumar.techtheory',
    avatar: '',
    joinedDate: '2024-01-20'
  },
  {
    id: '6',
    name: 'Ashutosh Kumar',
    username: 'ashutoshkumar.techtheory',
    email: 'ashutoshkumar.techtheory@techtheory.co.in',
    role: 'author',
    status: 'active',
    password: 'ashutoshkumar.techtheory',
    avatar: '',
    joinedDate: '2024-01-20'
  },
  {
    id: '7',
    name: 'Ashwani Singh',
    username: 'ashwanisingh.techtheory',
    email: 'ashwanisingh.techtheory@techtheory.co.in',
    role: 'author',
    status: 'active',
    password: 'ashwanisingh.techtheory',
    avatar: '',
    joinedDate: '2024-01-20'
  }
];

export const userService = {
  // Sync method for local storage (legacy support)
  getLocalUsers: (): User[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("Failed to parse users from local storage:", error);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    // 1. Always include Local Users (because admin wants credentials in code)
    const localUsers = userService.getLocalUsers();
    
    if (isSupabaseConfigured()) {
      // 2. Fetch "Public" profiles from app_users table (sync target)
      // We use the new table 'app_users' which is decoupled from Auth
      const { data, error } = await supabase
        .from('app_users')
        .select('*');
      
      if (!error && data) {
         // Merge logic: prefer DB data for profile details, but keep local password
         // Map DB users to User interface
         const dbUsers: User[] = data.map((p: any) => ({
            id: p.username, // Use username as ID for consistency in this decoupled mode
            name: p.name || 'Unknown',
            username: p.username,
            email: p.email,
            role: (p.role as any) || 'author',
            status: 'active',
            password: '', // Password is not in DB
            avatar: p.avatar,
            bio: p.bio,
            joinedDate: new Date(p.created_at).toISOString().split('T')[0]
         }));

         // Merge: If user exists in Local, use Local (contains password). If only in DB, use DB.
         // Actually, the requirement is "credentials in code". So maybe we only return Local Users, 
         // but enriched with DB data (like avatar/bio)?
         
         return localUsers.map(local => {
            const remote = dbUsers.find(d => d.username === local.username);
            if (remote) {
                return { ...local, ...remote, password: local.password }; // Keep local password
            }
            return local;
         });
      }
    }

    // Fallback to local storage
    return new Promise(resolve => resolve(localUsers));
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    // 1. Check local storage first
    const localUsers = userService.getLocalUsers();
    const localUser = localUsers.find(user => user.id === id);
    if (localUser) {
      return localUser;
    }

    // 2. If not found locally, check Supabase if configured
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error(`Error fetching user with ID ${id} from Supabase:`, error);
        return undefined;
      }
      return data || undefined;
    }

    return undefined;
  },

  addUser: async (user: Omit<User, 'id' | 'joinedDate'>): Promise<User> => {
    // 1. Add to Local Storage (Primary for Auth)
    const users = userService.getLocalUsers();
    if (users.some(u => u.username === user.username)) {
      throw new Error("Username already exists");
    }
    
    const newUser: User = {
      ...user,
      id: Date.now().toString(), // Local ID
      joinedDate: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

    // 2. Sync to Supabase (app_users) if configured
    if (isSupabaseConfigured()) {
       await supabase.from('app_users').upsert({
           username: newUser.username,
           name: newUser.name,
           email: newUser.email,
           role: newUser.role,
           avatar: newUser.avatar,
           bio: newUser.bio
       });
    }

    return newUser;
  },

  updateUser: async (updatedUser: User): Promise<void> => {
    // 1. Update Local
    const users = userService.getLocalUsers();
    const index = users.findIndex(u => u.id === updatedUser.id || u.username === updatedUser.username);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser }; // Keep password/id, update details
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }

    // 2. Update Supabase
    if (isSupabaseConfigured()) {
      await supabase
        .from('app_users')
        .upsert({
          username: updatedUser.username,
          name: updatedUser.name,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          bio: updatedUser.bio,
          email: updatedUser.email
        });
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    // 1. Delete Local
    const users = userService.getLocalUsers();
    const userToDelete = users.find(u => u.id === id);
    const newUsers = users.filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsers));

    // 2. Delete Remote
    if (isSupabaseConfigured() && userToDelete) {
      await supabase
        .from('app_users')
        .delete()
        .eq('username', userToDelete.username);
    }
  },
  
  // Helper to reset to default if needed
  resetUsers: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
};
