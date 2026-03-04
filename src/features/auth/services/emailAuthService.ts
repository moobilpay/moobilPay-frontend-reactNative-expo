import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    User
} from "firebase/auth";
import { auth } from "../../../services/firebase";
import { userFirestore } from "./userFirestore";
import { Users } from "../../../types";

export interface EmailSignInResult {
    success: boolean;
    isNewUser: boolean;
    userData?: Users;
    error?: string;
}

/**
 * Gère la connexion par Email/Password.
 * Si l'utilisateur n'existe pas dans Firebase, tente de le créer.
 */
export async function handleEmailAuth(email: string, password: string): Promise<EmailSignInResult> {
    try {
        console.log("🔵 [EmailAuth] Tentative de connexion pour:", email);
        let userCredential;
        let isNewUser = false;

        try {
            // 1. Tenter la connexion
            userCredential = await signInWithEmailAndPassword(auth, email, password);
        } catch (signInError: any) {
            // 2. Si l'utilisateur n'existe pas, on tente de le créer (Auto-Signup)
            if (signInError.code === 'auth/user-not-found') {
                console.log("🔵 [EmailAuth] Utilisateur non trouvé, tentative de création...");
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                isNewUser = true;
            } else {
                throw signInError;
            }
        }

        const firebaseUser = userCredential.user;

        // 3. Vérifier backend
        console.log("🔵 [EmailAuth] Vérification backend (GET /user)");
        const existingUser = await userFirestore.getUser(firebaseUser);

        if (existingUser && !isNewUser) {
            console.log("✅ [EmailAuth] Utilisateur existant trouvé");
            return { success: true, isNewUser: false, userData: existingUser };
        }

        // 4. Création du profil si nouveau ou absent du backend
        console.log("🔵 [EmailAuth] Création du profil backend");
        const prenom = email.split('@')[0];
        const nom = "User";

        const newUser: Users = {
            uid: firebaseUser.uid,
            id: firebaseUser.uid,
            infos: {
                nom,
                prenom,
                age: 0,
                numero: 0,
                email: firebaseUser.email ?? "",
                password: "" // On ne stocke pas le password en clair
            },
            isMarchand: false,
            statistique: 100,
            fastFoodId: ""
        };

        await userFirestore.createUser(newUser, firebaseUser);
        const createdUserData = await userFirestore.getUser(firebaseUser);

        return {
            success: true,
            isNewUser: true,
            userData: createdUserData || newUser
        };

    } catch (error: any) {
        console.error("❌ [EmailAuth] Erreur:", error);
        let errorMessage = "Une erreur est survenue lors de l'authentification.";

        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = "Format d'email invalide.";
                break;
            case 'auth/user-disabled':
                errorMessage = "Ce compte a été désactivé.";
                break;
            case 'auth/wrong-password':
                errorMessage = "Mot de passe incorrect.";
                break;
            case 'auth/email-already-in-use':
                errorMessage = "Cet email est déjà associé à un autre compte.";
                break;
            case 'auth/weak-password':
                errorMessage = "Le mot de passe doit contenir au moins 6 caractères.";
                break;
        }

        return { success: false, isNewUser: false, error: errorMessage };
    }
}
