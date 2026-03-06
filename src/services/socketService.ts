import { io, Socket } from 'socket.io-client';
import { AppState, AppStateStatus } from 'react-native';
import { Config } from '../api/config';

/**
 * SocketService.ts
 * 
 * Gestionnaire modulaire de la connexion Socket.io.
 * Gère le cycle de vie, les reconnexions et le passage arrière-plan/premier-plan.
 */
class SocketService {
    private socket: Socket | null = null;
    private userId: string | null = null;
    private appStateSubscription: any = null;

    /**
     * Initialisation du socket pour un utilisateur spécifique
     */
    public connect(userId: string) {
        if (this.socket?.connected && this.userId === userId) {
            console.log('🔌 [SocketService] Déjà connecté pour cet utilisateur.');
            return this.socket;
        }

        this.userId = userId;
        this.userId = userId;

        if (this.socket) {
            this.socket.disconnect();
        }

        console.log(`🔌 [SocketService] Connexion au serveur: ${Config.apiUrl}`);
        this.socket = io(Config.apiUrl, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });

        this.setupListeners();
        this.setupAppStateListener();

        return this.socket;
    }

    private setupListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('✅ [SocketService] Connecté au serveur.');
            if (this.userId) {
                this.joinRoom(this.userId);
            }
        });

        this.socket.on('disconnect', (reason) => {
            console.warn(`⚠️ [SocketService] Déconnecté. Raison: ${reason}`);
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ [SocketService] Erreur de connexion:', error.message);
        });
    }

    /**
     * Rejoindre la room personnelle de l'utilisateur
     */
    public joinRoom(userId: string) {
        if (this.socket?.connected) {
            console.log(`🏠 [SocketService] Join room: ${userId}`);
            this.socket.emit('join_user', userId);
        }
    }

    /**
     * Gère les transitions Background/Foreground
     */
    private setupAppStateListener() {
        if (this.appStateSubscription) return;

        this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                console.log('📱 [SocketService] App passée en premier plan. Vérification connexion...');
                if (this.socket && !this.socket.connected) {
                    this.socket.connect();
                } else if (this.socket?.connected && this.userId) {
                    // Forcer le re-join au cas où la session serveur a expiré
                    this.joinRoom(this.userId);
                }
            }
        });
    }

    public getSocket(): Socket | null {
        return this.socket;
    }

    public disconnect() {
        console.log('🔌 [SocketService] Déconnexion manuelle.');
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        if (this.appStateSubscription) {
            this.appStateSubscription.remove();
            this.appStateSubscription = null;
        }
        this.userId = null;
    }

    /**
     * Helper pour enregistrer un listener proprement
     */
    public on(event: string, callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    /**
     * Helper pour retirer un listener
     */
    public off(event: string) {
        if (this.socket) {
            this.socket.off(event);
        }
    }
}

export const socketService = new SocketService();
