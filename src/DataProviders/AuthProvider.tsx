import {
  useEffect,
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


// ================================
// ENV TYPES
// ================================

const POST_USERS_API_URL: string =
  import.meta.env.VITE_COLLECTION_SHEET_WRITE_URL;

const LoadUsersURL: string =
  import.meta.env.VITE_USER_SHEET_READ_URL;

// ================================
// TYPES
// ================================

interface AuthProviderProps {
  children: ReactNode;
}

interface SheetUser {
  name: string;
  role: string;
  email: string;
  photoURL: string;
  uid: string;
  emailVerified: string;
  phoneNumber: string;
  provider: string;
  lastLoginAt: string;

  // Allow extra dynamic sheet fields
  [key: string]: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
}

interface UserData {
  name: string;
  email: string;
  photoURL: string;
  uid: string;
  emailVerified: string;
  phoneNumber: string;
  provider: string;
  lastLoginAt: string;
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

  const [user, setUser] = useState<User | null>(
    null
  );

  const [userIsLoading, setUserIsLoading] =
    useState<boolean>(true);

  const [usersList, setUsersList] = useState<
    SheetUser[]
  >([]);

  // ================================
  // GOOGLE LOGIN
  // ================================

  const googleLogin = async (): Promise<UserCredential> => {
    try {
      toast.loading(
        "Signing in with Google...",
        {
          id: "login",
        }
      );

      // Firebase Login
      const userResult: UserCredential =
        await signInWithPopup(
          auth,
          provider
        );

      const loggedUser = userResult.user;

      if (!loggedUser) {
        toast.error(
          "Login failed. No user found.",
          {
            id: "login",
          }
        );

        throw new Error("No user found");
      }

      // Prepare user data
      const userData: UserData = {
        name:
          loggedUser.displayName || "",

        email:
          loggedUser.email || "",

        photoURL:
          loggedUser.photoURL || "",

        uid: loggedUser.uid || "",

        emailVerified: String(
          loggedUser.emailVerified || false
        ),

        phoneNumber:
          loggedUser.phoneNumber || "",

        provider:
          loggedUser.providerData?.[0]
            ?.providerId || "google",

        lastLoginAt:
          new Date().toLocaleString(),
      };

      // Send data to Sheet/API
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
            role: "viewer",
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

      const data: LoginResponse =
        await response.json();

      if (data.success) {
        toast.success(
          data.message ||
            "Login successful",
          {
            id: "login",
          }
        );
      } else {
        toast.error(
          data.message ||
            "Failed to save user",
          {
            id: "login",
          }
        );
      }

      return userResult;
    } catch (error: unknown) {
      let errorMessage =
        "Login failed";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.log(errorMessage);

      toast.error(errorMessage, {
        id: "login",
      });

      throw error;
    }
  };

  // ================================
  // LOGOUT
  // ================================

  const logout = (): Promise<void> => {
    return signOut(auth);
  };

  // ================================
  // CURRENT USER INFO
  // ================================

  const currentUserInfo:
    | SheetUser
    | undefined = usersList.find(
    (item) =>
      item.email?.toLowerCase() ===
      user?.email?.toLowerCase()
  );

  // Role
  const userRole: string | null =
    currentUserInfo?.role || null;

  // ================================
  // LOAD USERS + AUTH STATE
  // ================================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser: User | null) => {
          setUser(currentUser);
        }
      );

    const loadUsers =
      async (): Promise<void> => {
        setUserIsLoading(true);

        try {
          const res = await fetch(
            LoadUsersURL
          );

          const data: string =
            await res.text();

          if (!data) {
            console.log(
              "No data found"
            );

            setUsersList([]);
            return;
          }

          // CSV Lines
          const lines: string[] =
            data.trim().split("\n");

          // Headers
          const headers: string[] =
            lines[0]
              .split(",")
              .map((header) =>
                header.trim()
              );

          // Users
          const users: SheetUser[] =
            lines
              .slice(1)
              .map((line) => {
                const values: string[] =
                  line
                    .split(
                      /,(?=(?:(?:[^"]*"){2})*[^"]*$)/
                    )
                    .map((value) =>
                      value
                        .trim()
                        .replace(
                          /^"|"$/g,
                          ""
                        )
                    );

                const userObj: SheetUser =
                  {
                    name: "",
                    role: "",
                    email: "",
                    photoURL: "",
                    uid: "",
                    emailVerified:
                      "",
                    phoneNumber:
                      "",
                    provider: "",
                    lastLoginAt:
                      "",
                  };

                headers.forEach(
                  (
                    header,
                    index
                  ) => {
                    userObj[
                      header
                    ] =
                      values[
                        index
                      ] || "";
                  }
                );

                return userObj;
              });

          setUsersList(users);
        } catch (error: unknown) {
          let errorMessage =
            "Unknown Error";

          if (
            error instanceof Error
          ) {
            errorMessage =
              error.message;
          }

          console.log(
            "Load Users Error:",
            errorMessage
          );

          setUsersList([]);
        } finally {
          setUserIsLoading(false);
        }
      };

    loadUsers();

    return () => unsubscribe();
  }, []);

  // ================================
  // CONTEXT VALUE
  // ================================

 const authInfo: AuthContextType = {
  user,
  usersList,
  userIsLoading,
  googleLogin,
  logout,
  userRole,
};

  return (
    <AuthContext.Provider
      value={authInfo}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;