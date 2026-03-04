import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../../services/firebase";
import { storage } from "../../../utils/storage";
import { Users } from "../../../types";
import { userFirestore } from "../services/userFirestore";

interface AuthContextType {
  user: User | null;
  userData: Users | null;
  loading: boolean;
  setUserData: (data: Users | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<Users | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🔵 [AuthContext] onAuthStateChanged déclenché");
      setUser(firebaseUser);
      
      if (firebaseUser) {
        console.log("🔵 [AuthContext] Firebase User détecté:", firebaseUser.uid);
        
        // 1. Tenter de charger le cache IMMÉDIATEMENT pour la rapidité
        const stored = await storage.get("user_data");
        if (stored) {
          console.log("✅ [AuthContext] User data chargé depuis le CACHE");
          setUserData(stored);
          setLoading(false); // On peut déjà arrêter le loading si on a du cache
        }

        try {
          // 2. Vérifier/Mettre à jour via l'API en arrière-plan
          console.log("🔵 [AuthContext] Vérification via API...");
          const apiData = await userFirestore.getUser(firebaseUser);
          if (apiData) {
            console.log("✅ [AuthContext] User data synchronisé depuis API");
            setUserData(apiData);
            await storage.set("user_data", apiData);
          }
        } catch (error) {
          console.error("❌ [AuthContext] Erreur API (on garde le cache si présent):", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("🔵 [AuthContext] Pas d'utilisateur");
        setUserData(null);
        await storage.remove("user_data");
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleUpdateUserData = async (data: Users | null) => {
    setUserData(data);
    if (data) {
      await storage.set("user_data", data);
    } else {
      await storage.remove("user_data");
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      await storage.remove("user_data");
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error("❌ [AuthContext] Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        userData, 
        loading, 
        setUserData: handleUpdateUserData,
        logout 
      }}
    >
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
