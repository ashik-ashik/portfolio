import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  type User,
  type UserCredential,
} from "firebase/auth";

import { auth, provider } from "../services/firebase";

import toast from "react-hot-toast";

import AuthContext, {
  type AuthContextType,
} from "../contexts/AuthContext";
import MatrixLoader from "../components/MatrixLoader";

// ================================
// ENV
// ================================

const POST_USERS_API_URL: string =
  import.meta.env
    .VITE_COLLECTION_SHEET_WRITE_URL;

const LOAD_USER_API_URL: string =
  import.meta.env.VITE_SHEET_READ_URL;

// ================================
// TYPES
// ================================

interface AuthProviderProps {
  children: ReactNode;
}

export interface SheetUser {
  role: string;
  name: string;
  email: string;
  photoURL: string;
  uid: string;
  emailVerified: string;
  phoneNumber: string;
  provider: string;
  lastLoginAt: string;

  // Extra optional sheet fields
  [key: string]: string;
}

export interface UserData {
  role?: string;
  name: string;
  email: string;
  photoURL: string;
  uid: string;
  emailVerified: string;
  phoneNumber: string;
  provider: string;
  lastLoginAt: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
}

interface UserApiResponse {
  success: boolean;
  data: SheetUser | null;
  message?: string;
}

// ================================
// COMPONENT
// ================================

const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  // ================================
  // STATES
  // ================================

  const [user, setUser] =
    useState<User | null>(null);

  const [currentUserInfo, setCurrentUserInfo] =
    useState<SheetUser | null>(null);

  const [userIsLoading, setUserIsLoading] =
    useState<boolean>(true);

  const [authChecked, setAuthChecked] =
    useState<boolean>(false);

  // ================================
  // LOAD CURRENT USER FROM SHEET
  // ================================

  const loadCurrentUser = async (
  email: string
): Promise<void> => {
  try {
    if (!email) {
      setCurrentUserInfo(null);
      return;
    }
    const response = await fetch(
      `${LOAD_USER_API_URL}?action=users&email=${encodeURIComponent(
        email
      )}`
    );

    if (!response.ok) {
      throw new Error(
        "Failed to load user data"
      );
    }

    const data: UserApiResponse =
      await response.json();
    if (
      data.success &&
      data.data
    ) {
      setCurrentUserInfo(data.data);
    } else {
      setCurrentUserInfo(null);
    }
  } catch (error: unknown) {
    let errorMessage =
      "Failed to load user";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error(
      "Load User Error:",
      errorMessage
    );

    toast.error(errorMessage);

    setCurrentUserInfo(null);
  }
};

  // ================================
  // GOOGLE LOGIN
  // ================================

  const googleLogin =
    async (): Promise<UserCredential> => {
      try {
        setUserIsLoading(true);

        toast.loading(
          "Signing in with Google...",
          {
            id: "login",
          }
        );

        // Firebase Login
        const userResult =
          await signInWithPopup(
            auth,
            provider
          );

        const loggedUser =
          userResult.user;

        if (!loggedUser) {
          throw new Error(
            "No user found"
          );
        }

        // ================================
        // USER DATA
        // ================================

        const userData: UserData = {
          role: "viewer",

          name:
            loggedUser.displayName || "",

          email:
            loggedUser.email || "",

          photoURL:
            loggedUser.photoURL || "",

          uid: loggedUser.uid,

          emailVerified: String(
            loggedUser.emailVerified
          ),

          phoneNumber:
            loggedUser.phoneNumber || "",

          provider:
            loggedUser.providerData?.[0]
              ?.providerId || "google",

          lastLoginAt:
            new Date().toLocaleString(),
        };

        // ================================
        // SAVE USER TO SHEET
        // ================================

        const response = await fetch(
          POST_USERS_API_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",
            },

            body: new URLSearchParams({
              action: "user",

              role:
                userData.role || "viewer",

              name: userData.name,

              email: userData.email,

              photoURL:
                userData.photoURL,

              uid: userData.uid,

              emailVerified:
                userData.emailVerified,

              phoneNumber:
                userData.phoneNumber,

              provider:
                userData.provider,

              lastLoginAt:
                userData.lastLoginAt,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to save user"
          );
        }

        const data: LoginResponse =
          await response.json();

        if (!data.success) {
          throw new Error(
            data.message ||
              "Failed to save user"
          );
        }

        // ================================
        // LOAD CURRENT USER DATA
        // ================================

        await loadCurrentUser(
          userData.email
        );

        toast.success(
          data.message ||
            "Login successful",
          {
            id: "login",
          }
        );

        return userResult;
      } catch (error: unknown) {
        let errorMessage =
          "Login failed";

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        console.error(
          "Google Login Error:",
          errorMessage
        );

        toast.error(errorMessage, {
          id: "login",
        });

        throw error;
      } finally {
        setUserIsLoading(false);
      }
    };

  // ================================
  // LOGOUT
  // ================================

  const logout =
    async (): Promise<void> => {
      try {
        toast.loading(
          "Logging out...",
          {
            id: "logout",
          }
        );

        await signOut(auth);

        setCurrentUserInfo(null);

        toast.success(
          "Logged out successfully",
          {
            id: "logout",
          }
        );
      } catch (error: unknown) {
        let errorMessage =
          "Logout failed";

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast.error(errorMessage, {
          id: "logout",
        });

        throw error;
      }
    };

  // ================================
  // AUTH STATE LISTENER
  // ================================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (
          currentUser: User | null
        ) => {
          try {
            setUserIsLoading(true);

            setUser(currentUser);

            // Load current user data automatically
            if (
              currentUser?.email
            ) {
              await loadCurrentUser(
                currentUser.email
              );
            } else {
              setCurrentUserInfo(
                null
              );
            }
          } catch (error) {
            console.error(error);
          } finally {
            setAuthChecked(true);
            setUserIsLoading(false);
          }
        }
      );

    return () => unsubscribe();
  }, []);

  // ================================
  // USER ROLE
  // ================================

  const userRole: string | null =
    useMemo(() => {
      return (
        currentUserInfo?.Role ||
        null
      );
    }, [currentUserInfo]);

  // ================================
  // CONTEXT VALUE
  // ================================

  const authInfo: AuthContextType = {
    user,

    currentUserInfo,

    userIsLoading,

    googleLogin,

    logout,

    userRole,
  };


  // ================================
  // LOADER BEFORE AUTH CHECK
  // ================================

  if (!authChecked) {
    return (
      <MatrixLoader />
    );
  }

  // ================================
  // PROVIDER
  // ================================

  return (
    <AuthContext.Provider
      value={authInfo}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;