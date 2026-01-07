
export interface User {
  id: string;
  name: string;
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

const STORAGE_KEY = 'tech_theory_users';

const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@techtheory.com',
    role: 'admin',
    status: 'active',
    avatar: 'https://github.com/shadcn.png',
    joinedDate: '2024-01-01'
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@techtheory.com',
    role: 'author',
    status: 'active',
    avatar: '',
    joinedDate: '2024-01-15'
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
  }
};
