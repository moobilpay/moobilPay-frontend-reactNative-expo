import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, type Auth } from 'firebase/auth';
// @ts-ignore - getReactNativePersistence n'est pas toujours exporté dans les types de base mais présent en RN
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../api/config';

// Initialisation de l'application Firebase (safe pour le Fast Refresh)
const app: FirebaseApp = getApps().length === 0 ? initializeApp(Config.firebaseConfig) : getApp();

// Initialisation de l'auth avec persistance AsyncStorage
let auth: Auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
} catch (e) {
    // auth déjà initialisée (Fast Refresh)
    auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };
