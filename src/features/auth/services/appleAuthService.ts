import { OAuthProvider, signInWithCredential } from "firebase/auth";
import { Platform } from "react-native";
import * as Crypto from "expo-crypto";
import { auth } from "../../../services/firebase";
import { userFirestore } from "./userFirestore";
import { Users } from "../../../types";

export interface AppleSignInResult {
    success: boolean;
    isNewUser: boolean;
    userData?: Users;
    error?: string;
}

export async function handleAppleSignIn(): Promise<AppleSignInResult> {
    if (Platform.OS !== "ios") {
        return { success: false, isNewUser: false, error: "Sign in with Apple est disponible uniquement sur iOS." };
    }

    try {
        const AppleAuthentication = await import("expo-apple-authentication");

        const isAvailable = await AppleAuthentication.isAvailableAsync();
        if (!isAvailable) {
            return { success: false, isNewUser: false, error: "Sign in with Apple non disponible sur cet appareil." };
        }

        // Nonce: Apple signe le hash SHA-256, Firebase vérifie avec le rawNonce
        const randomBytes = await Crypto.getRandomBytesAsync(32);
        const rawNonce = Array.from(randomBytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        const hashedNonce = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            rawNonce
        );

        console.log("🍎 [AppleAuth] Lancement du sélecteur Apple");
        const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
            nonce: hashedNonce,
        });

        if (!credential.identityToken) {
            return { success: false, isNewUser: false, error: "Identity token Apple manquant" };
        }

        console.log("🍎 [AppleAuth] Connexion Firebase");
        const provider = new OAuthProvider("apple.com");
        const firebaseCred = provider.credential({
            idToken: credential.identityToken,
            rawNonce,
        });
        const userCredential = await signInWithCredential(auth, firebaseCred);
        const firebaseUser = userCredential.user;

        console.log("🍎 [AppleAuth] Vérification backend");
        const existingUser = await userFirestore.getUser(firebaseUser);
        if (existingUser) {
            console.log("✅ [AppleAuth] Utilisateur existant:", existingUser.infos.email);
            return { success: true, isNewUser: false, userData: existingUser };
        }

        // Apple ne renvoie le nom/email qu'à la PREMIÈRE connexion
        const prenom =
            credential.fullName?.givenName ||
            firebaseUser.displayName?.split(" ")[0] ||
            "User";
        const nom =
            credential.fullName?.familyName ||
            firebaseUser.displayName?.split(" ").slice(1).join(" ") ||
            prenom;
        const email = credential.email ?? firebaseUser.email ?? "";

        const newUser: Users = {
            uid: firebaseUser.uid,
            id: firebaseUser.uid,
            infos: { nom, prenom, age: 0, numero: 0, email, password: "" },
            isMarchand: false,
            statistique: 100,
            fastFoodId: "",
        };

        console.log("🍎 [AppleAuth] Création du profil backend");
        await userFirestore.createUser(newUser, firebaseUser);

        const createdUserData = await userFirestore.getUser(firebaseUser);
        if (!createdUserData) {
            throw new Error("Failed to retrieve created Apple user");
        }

        console.log("✅ [AppleAuth] Utilisateur créé");
        return { success: true, isNewUser: true, userData: createdUserData };
    } catch (error: any) {
        console.error("❌ [AppleAuth] Erreur:", error);

        if (error.code === "ERR_REQUEST_CANCELED" || error.code === "ERR_CANCELED") {
            return { success: false, isNewUser: false, error: "Connexion annulée" };
        }
        if (error.code === "auth/account-exists-with-different-credential") {
            return { success: false, isNewUser: false, error: "Un compte existe déjà avec cet email." };
        }
        if (error.code === "auth/network-request-failed") {
            return { success: false, isNewUser: false, error: "Erreur réseau. Vérifiez votre connexion." };
        }
        return { success: false, isNewUser: false, error: error.message || "Erreur de connexion Apple" };
    }
}
