import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../api/config';

// Initialisation de l'application Firebase (safe pour le Fast Refresh)
const app = getApps().length === 0 ? initializeApp(Config.firebaseConfig) : getApp();

// Initialisation de l'auth avec persistance AsyncStorage
// Metro résout 'firebase/auth' vers le build RN grâce à metro.config.js
let auth;
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
