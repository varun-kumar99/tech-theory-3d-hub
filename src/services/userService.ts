
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
    email: 'varun99.techtheory@techtheory.com',
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
    email: 'author@techtheory.com',
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
    email: 'mohdmehtab.techtheory@techtheory.com',
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
    email: 'utkarsh98.techtheory@techtheory.com',
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
    email: 'riteshkumar.techtheory@techtheory.com',
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
    email: 'ashutoshkumar.techtheory@techtheory.com',
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
    email: 'ashwanisingh.techtheory@techtheory.com',
    role: 'author',
    status: 'active',
    password: 'ashwanisingh.techtheory',
    avatar: '',
    joinedDate: '2024-01-20'
  }
];

export const userService = {
  getAllUsers: (): User[] => {
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

  addUser: (user: Omit<User, 'id' | 'joinedDate'>): User => {
    const users = userService.getAllUsers();
    // Check if username already exists
    if (users.some(u => u.username === user.username)) {
      throw new Error("Username already exists");
    }
    
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      joinedDate: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return newUser;
  },

  updateUser: (updatedUser: User): void => {
    const users = userService.getAllUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
  },

  deleteUser: (id: string): void => {
    const users = userService.getAllUsers().filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  },
  
  // Helper to reset to default if needed
  resetUsers: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
};
