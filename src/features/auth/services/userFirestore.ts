import axios from "axios";
import { Config } from "../../../api/config";
import { Users } from "../../../types";

export const userFirestore = {
    async getUser(firebaseUser: any): Promise<Users | null> {
        try {
            console.log("🔍 [getUser] Fetching user with UID:", firebaseUser.uid);
            const idToken = await firebaseUser.getIdToken();
            const response = await axios.get(`${Config.apiUrl}/api/user/${firebaseUser.uid}`, {
                headers: {
                    "ngrok-skip-browser-warning": "true",
                    "Authorization": `Bearer ${idToken}`,
                },
            });
            const data = response.data.data;
            return data && data.infos ? data : null;
        } catch (error) {
            console.error("Error fetching user via API:", error);
            return null;
        }
    },

    async createUser(user: Users, firebaseUser: any): Promise<void> {
        try {
            console.log("📤 [createUser] POST /api/user");
            const idToken = await firebaseUser.getIdToken();
            const response = await axios.post(
                `${Config.apiUrl}/api/user`,
                { ...user, uid: firebaseUser.uid },
                {
                    headers: {
                        "ngrok-skip-browser-warning": "true",
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${idToken}`,
                    },
                },
            );
            console.log("✅ [createUser] Réponse backend:", response.data);
        } catch (error: any) {
            console.error("❌ [createUser] Erreur API:", error.message);
            throw error;
        }
    },

    async updateUser(user: Users, firebaseUser: any): Promise<void> {
        try {
            const idToken = await firebaseUser.getIdToken();
            await axios.put(`${Config.apiUrl}/api/user/${firebaseUser.uid}`, user, {
                headers: {
                    "ngrok-skip-browser-warning": "true",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`,
                },
            });
        } catch (error) {
            console.error("Error updating user via API:", error);
            throw error;
        }
    },

    async saveUser(user: Users, firebaseUser: any): Promise<void> {
        try {
            const existingUser = await this.getUser(firebaseUser);
            if (existingUser) {
                await this.updateUser(user, firebaseUser);
            } else {
                await this.createUser(user, firebaseUser);
            }
        } catch (error) {
            console.error("Error saving user via API:", error);
            throw error;
        }
    },
};
