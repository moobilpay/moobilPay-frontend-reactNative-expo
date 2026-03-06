import { useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext';

/**
 * Hook spécialisé pour écouter les événements de paiement et d'activation.
 */
export function usePaymentSocket(handlers: {
    onPaymentValidated?: (data: any) => void;
    onActivationCreated?: (data: any) => void;
    onNotificationReceived?: (data: any) => void;
}) {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

        console.log('🔗 [usePaymentSocket] Attachement des listeners...');

        if (handlers.onPaymentValidated) {
            socket.on('payment_validated', handlers.onPaymentValidated);
        }

        if (handlers.onActivationCreated) {
            socket.on('activationcreated', handlers.onActivationCreated);
        }

        if (handlers.onNotificationReceived) {
            socket.on('newNotification', handlers.onNotificationReceived);
        }

        return () => {
            console.log('🔗 [usePaymentSocket] Détachement des listeners.');
            if (handlers.onPaymentValidated) {
                socket.off('payment_validated', handlers.onPaymentValidated);
            }
            if (handlers.onActivationCreated) {
                socket.off('activationcreated', handlers.onActivationCreated);
            }
            if (handlers.onNotificationReceived) {
                socket.off('newNotification', handlers.onNotificationReceived);
            }
        };
    }, [socket, isConnected, handlers.onPaymentValidated, handlers.onActivationCreated, handlers.onNotificationReceived]);

    return { socket, isConnected };
}
