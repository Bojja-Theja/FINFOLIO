import { createContext, useContext, useState, useEffect, ReactNode } from "react";


type User = {
  id: string;
  email: string | null;
  name?: string;
  isGuest?: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to decode JWT payload manually in the browser
function parseJwt(token: string) {
  try {
    const parts = token.split('.');
    if (!parts[1]) {
      return null;
    }
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app startup
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        if (!token) {
          // No token - user is not authenticated (but can continue as guest)
          setUser(null);
          setLoading(false);
          return;
        }

        // Try to decode token
        const decoded = parseJwt(token);
        if (!decoded || typeof decoded !== 'object' || !decoded.exp) {
          // Invalid token format
          localStorage.removeItem('token');
          setUser(null);
          setLoading(false);
          return;
        }

        const currentTime = Date.now() / 1000;
        if (decoded.exp <= currentTime) {
          // Token expired
          localStorage.removeItem('token');
          setUser(null);
          setLoading(false);
          return;
        }

        // Token is valid - extract user info
        const userData: User = {
          id: decoded.userId?.toString() ?? '1',
          email: decoded.email ?? null,
          name: decoded.name ?? 'User',
          isGuest: decoded.isGuest ?? false
        };
        setUser(userData);
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (token: string, userData: User) => {
    // Normalize token: strip leading 'Bearer ' if present to avoid double-prefixing
    const rawToken = token?.startsWith?.('Bearer ') ? token.slice(7) : token;
    localStorage.setItem("token", rawToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
