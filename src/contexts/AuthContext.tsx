import { createContext } from "react";
import type { User, UserCredential } from "firebase/auth";

// ================================
// TYPES
// ================================

export interface SheetUser {
  name: string;
  role: string;
  email: string;
  photoURL: string;
  uid: string;
  emailVerified: string;
  phoneNumber: string;
  provider: string;
  lastLoginAt: string;
  [key: string]: string;
}

export interface AuthContextType {
  user: User | null;
  currentUserInfo: SheetUser | null;
  userIsLoading: boolean;
  googleLogin: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  userRole: string | null;
  getToken: () => Promise<string | null>; // ← only addition
}

// ================================
// CONTEXT
// ================================

const AuthContext = createContext<AuthContextType | null>(null);

export default AuthContext;