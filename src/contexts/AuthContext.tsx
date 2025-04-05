
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from "react";
import { useToast } from "@/hooks/use-toast";

// Define the admin credentials (would typically come from a secure backend)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "securepass123"; // In production, use a hashed password stored securely

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if there's an auth token in local storage
    const token = localStorage.getItem("auth_token");
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simple authentication logic (should be replaced with a secure API call in production)
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Set a temporary token in localStorage (in production, use a proper JWT)
      localStorage.setItem("auth_token", "temp_auth_token");
      setIsAuthenticated(true);
      setIsLoading(false);
      toast({
        title: "Login successful",
        description: "Welcome to the admin panel",
      });
      return true;
    } else {
      setIsLoading(false);
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
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
