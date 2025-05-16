
import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthState, User, UserCredentials } from "../types";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextProps {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const { toast } = useToast();

  // Load user data from localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("moodJournalUser");
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("moodJournalUser");
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  // Load user credentials from localStorage
  const getUserCredentials = (): Record<string, UserCredentials> => {
    const storedCredentials = localStorage.getItem("moodJournalCredentials");
    if (storedCredentials) {
      try {
        return JSON.parse(storedCredentials);
      } catch (error) {
        console.error("Failed to parse stored credentials:", error);
        return {};
      }
    }
    return {};
  };

  // Save user credentials to localStorage
  const saveUserCredentials = (credentials: Record<string, UserCredentials>) => {
    localStorage.setItem("moodJournalCredentials", JSON.stringify(credentials));
  };

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const credentials = getUserCredentials();
    const userCredential = credentials[email];
    
    if (!userCredential) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "User not found. Please check your email or sign up.",
      });
      throw new Error("User not found");
    }
    
    if (userCredential.password !== password) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Incorrect password. Please try again.",
      });
      throw new Error("Incorrect password");
    }
    
    // Find user by email
    const userInfo: User = {
      id: email.replace(/[^a-zA-Z0-9]/g, "-"),
      name: email.split("@")[0],
      email: email,
    };
    
    localStorage.setItem("moodJournalUser", JSON.stringify(userInfo));
    setAuthState({
      user: userInfo,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const signup = async (name: string, email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const credentials = getUserCredentials();
    
    if (credentials[email]) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: "Email already exists. Please use a different email or login.",
      });
      throw new Error("Email already exists");
    }
    
    // Create new user credential
    credentials[email] = { email, password };
    saveUserCredentials(credentials);
    
    // Create new user
    const newUser: User = {
      id: email.replace(/[^a-zA-Z0-9]/g, "-"),
      name: name || email.split("@")[0],
      email: email,
    };
    
    localStorage.setItem("moodJournalUser", JSON.stringify(newUser));
    setAuthState({
      user: newUser,
      isAuthenticated: true,
      isLoading: false,
    });
    
    toast({
      title: "Account created",
      description: "Your account has been created successfully.",
    });
  };

  const logout = () => {
    localStorage.removeItem("moodJournalUser");
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
