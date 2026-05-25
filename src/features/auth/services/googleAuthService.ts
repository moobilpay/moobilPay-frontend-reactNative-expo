import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../../../services/firebase";
import { userFirestore } from "./userFirestore";
import { Users } from "../../../types";
import { Config } from "../../../api/config";

export interface GoogleSignInResult {
    success: boolean;
    isNewUser: boolean;
    userData?: Users;
    error?: string;
}

export async function handleGoogleSignIn(): Promise<GoogleSignInResult> {
    if (process.env.EXPO_PUBLIC_DISABLE_GOOGLE_AUTH === 'true') {
        return {
            success: false,
            isNewUser: false,
            error: "Google Auth est désactivé dans Expo Go. Utilisez un development build.",
        };
    }

    let statusCodes: any;

    try {
        const { GoogleSignin: GS, statusCodes: SC } = await import("@react-native-google-signin/google-signin");
        const GoogleSignin = GS;
        statusCodes = SC;

        // Configurer GoogleSignin avec les IDs clients
        GoogleSignin.configure({
            webClientId: Config.googleAuth.webClientId,  
            iosClientId: Config.googleAuth.iosClientId,
      offlineAccess: true,
        });

        console.log("🔵 [GoogleAuth] Vérification Google Play Services");
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

        console.log("🔵 [GoogleAuth] Lancement du sélecteur de compte");
        await GoogleSignin.signIn();

        console.log("🔵 [GoogleAuth] Récupération du token");
        const tokens = await GoogleSignin.getTokens();
        const idToken = tokens.idToken;

        if (!idToken) {
            return { success: false, isNewUser: false, error: "Token Google invalide" };
        }

        console.log("🔵 [GoogleAuth] Connexion Firebase");
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        const firebaseUser = userCredential.user;

        console.log("🔵 [GoogleAuth] Vérification backend (GET /user)");
        const existingUser = await userFirestore.getUser(firebaseUser);

        if (existingUser) {
            console.log("✅ [GoogleAuth] Utilisateur existant trouvé:", existingUser.infos.email);
            return { success: true, isNewUser: false, userData: existingUser };
        }

        console.log("🔵 [GoogleAuth] Nouvel utilisateur - Création du profil");
        const displayName = firebaseUser.displayName ?? "";
        const nameParts = displayName.trim().split(" ");
        const prenom = nameParts[0] ?? "User";
        const nom = nameParts.slice(1).join(" ") || prenom;

        const newUser: Users = {
            uid: firebaseUser.uid,
            id: firebaseUser.uid,
            infos: {
                nom,
                prenom,
                age: 0,
                numero: 0,
                email: firebaseUser.email ?? "",
                password: ""
            },
        };

        console.log("🔵 [GoogleAuth] Envoi au backend (POST /user)");
        await userFirestore.createUser(newUser, firebaseUser);

        const createdUserData = await userFirestore.getUser(firebaseUser);
        if (!createdUserData) {
            throw new Error("Failed to retrieve created user data");
        }

        console.log("✅ [GoogleAuth] Utilisateur créé avec succès");
        return { success: true, isNewUser: true, userData: createdUserData };
    } catch (error: any) {
        console.error("❌ [GoogleAuth] Erreur:", error);

        if (error.code === statusCodes?.SIGN_IN_CANCELLED) {
            return { success: false, isNewUser: false, error: "Connexion annulée" };
        } else if (error.code === statusCodes?.IN_PROGRESS) {
            return { success: false, isNewUser: false, error: "Connexion déjà en cours" };
        } else if (error.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
            return { success: false, isNewUser: false, error: "Google Play Services non disponible" };
        } else if (error.code === "auth/account-exists-with-different-credential") {
            return { success: false, isNewUser: false, error: "Un compte existe déjà avec cet email." };
        } else if (error.code === "auth/network-request-failed") {
            return { success: false, isNewUser: false, error: "Erreur réseau. Vérifiez votre connexion." };
        }

        return { success: false, isNewUser: false, error: "Erreur de connexion Google" };
    }
}

export async function handleGoogleSignOut(): Promise<void> {
    try {
        const { GoogleSignin } = await import("@react-native-google-signin/google-signin");
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
    } catch (error) {
        console.error("Google sign-out error:", error);
    }
}
