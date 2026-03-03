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
        setLoading(true);
        try {
          console.log("🔵 [AuthContext] Tentative de récupération depuis API...");
          const apiData = await userFirestore.getUser(firebaseUser);
          if (apiData) {
            console.log("✅ [AuthContext] User data récupéré depuis API");
            setUserData(apiData);
            await storage.set("user_data", apiData);
          } else {
            console.log("⚠️ [AuthContext] API n'a pas retourné de données, fallback vers storage");
            const stored = await storage.get("user_data");
            if (stored) {
              console.log("✅ [AuthContext] User data récupéré depuis storage");
              setUserData(stored);
            } else {
              console.log("❌ [AuthContext] Aucune donnée trouvée");
            }
          }
        } catch (error) {
          console.error("❌ [AuthContext] Erreur lors du chargement:", error);
          const stored = await storage.get("user_data");
          if (stored) {
            console.log("✅ [AuthContext] Fallback vers storage après erreur");
            setUserData(stored);
          }
        }
      } else {
        console.log("🔵 [AuthContext] Pas de Firebase User, nettoyage userData");
        setUserData(null);
        await storage.remove("user_data");
      }
      setLoading(false);
      console.log("🔵 [AuthContext] Loading terminé");
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

  return (
    <AuthContext.Provider
      value={{ user, userData, loading, setUserData: handleUpdateUserData }}
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
