export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLogin: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const AUTH_KEY = 'dovepeak_auth';
const USERS_KEY = 'dovepeak_users';

// Get current authenticated user
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const authData = localStorage.getItem(AUTH_KEY);
  if (!authData) return null;
  
  try {
    const { user, expiresAt } = JSON.parse(authData);
    if (new Date().getTime() > expiresAt) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
    return user;
  } catch {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Get all users (for login validation)
const getUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Save user to storage
const saveUser = (user: User): void => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Register new user
export const register = async (email: string, password: string, name: string): Promise<{ success: boolean; message: string; user?: User }> => {
  const users = getUsers();
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'User with this email already exists' };
  }
  
  // Create new user
  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };
  
  // Save user and password (in real app, password would be hashed)
  saveUser(user);
  localStorage.setItem(`dovepeak_password_${user.id}`, password);
  
  return { success: true, message: 'Account created successfully', user };
};

// Login user
export const login = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }
  
  // Check password (in real app, would compare hashed passwords)
  const storedPassword = localStorage.getItem(`dovepeak_password_${user.id}`);
  if (storedPassword !== password) {
    return { success: false, message: 'Invalid email or password' };
  }
  
  // Update last login
  user.lastLogin = new Date().toISOString();
  saveUser(user);
  
  // Set authentication with 24 hour expiry
  const authData = {
    user,
    expiresAt: new Date().getTime() + (24 * 60 * 60 * 1000)
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
  
  return { success: true, message: 'Login successful', user };
};

// Logout user
export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

// Update user profile
export const updateProfile = (updates: Partial<User>): User | null => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;
  
  const updatedUser = { ...currentUser, ...updates };
  saveUser(updatedUser);
  
  // Update auth storage
  const authData = JSON.parse(localStorage.getItem(AUTH_KEY) || '{}');
  authData.user = updatedUser;
  localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
  
  return updatedUser;
};