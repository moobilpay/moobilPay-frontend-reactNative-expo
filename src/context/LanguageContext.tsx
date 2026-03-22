import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'fr' | 'en';

const translations = {
  fr: {
    // Tabs
    tabs_home: 'Accueil',
    tabs_transactions: 'Transactions',
    tabs_activations: 'Activations',
    tabs_notifications: 'Notifications',
    tabs_settings: 'Paramètres',

    // Settings page
    settings_title: 'Paramètres',
    settings_subtitle: 'Gérez vos préférences et votre compte',
    settings_general: 'GÉNÉRAL',
    settings_language: 'Langue',
    settings_language_desc: "Choisissez votre langue d'affichage",
    settings_dark_mode: 'Mode Sombre',
    settings_dark_mode_desc: 'Réduisez la fatigue oculaire',
    settings_notifications_section: 'NOTIFICATIONS',
    settings_push: 'Push Notifications',
    settings_push_desc: 'Recevez des alertes en temps réel',
    settings_security: 'SÉCURITÉ',
    settings_password: 'Mot de passe',
    settings_password_desc: 'Changez votre mot de passe',
    settings_biometrics: 'Biométrie',
    settings_biometrics_desc: 'Utilisez TouchID ou FaceID',
    settings_account: 'MON COMPTE',
    settings_profile: 'Profil',
    settings_profile_desc: 'Gérez vos informations personnelles',
    settings_subscription: 'Abonnement',
    settings_subscription_desc: 'Consultez votre plan actuel',
    settings_session: 'SESSION',
    settings_logout: 'Déconnexion',
    settings_logout_desc: 'Quitter votre session actuelle',
    settings_logout_confirm: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    settings_logout_cancel: 'Annuler',
    settings_logging_out: 'Déconnexion en cours...',
    settings_logout_error: 'Impossible de se déconnecter.',
    settings_danger_zone: 'ZONE DE DANGER',
    settings_delete_account: 'Supprimer le compte',
    settings_delete_account_desc: 'Cette action est irréversible',
    settings_version: 'MoobilPay v1.0.0',
    settings_copyright: '© 2025 MoobilPay. Tous droits réservés.',

    // Profile page
    profile_title: 'Mon Profil',
    profile_member_since: 'Membre depuis',
    profile_subscriptions: 'Abonnements',
    profile_transactions: 'Transactions',
    profile_months_active: 'Mois actif',
    profile_personal_info: 'Informations personnelles',
    profile_full_name: 'Nom complet',
    profile_email: 'Email',
    profile_phone: 'Téléphone',
    profile_country: 'Pays',
    profile_city: 'Ville',
    profile_security: 'Sécurité',
    profile_change_password: 'Modifier le mot de passe',
    profile_password_last_changed: 'Dernière modification il y a 3 mois',
    profile_biometric_auth: 'Authentification biométrique',
    profile_biometric_desc: 'TouchID / FaceID activé',
    profile_active: 'Actif',
    profile_2fa: 'Vérification en 2 étapes',
    profile_2fa_desc: 'Protégez votre compte',
    profile_danger_zone: 'Zone de danger',
    profile_delete: 'Supprimer mon compte',
    profile_delete_desc: 'Supprime définitivement toutes vos données',
    profile_delete_confirm: 'Cette action est irréversible. Toutes vos données seront supprimées.',
    profile_save_success: 'Vos informations ont été mises à jour.',
    profile_success: 'Succès',

    // Accounts page
    accounts_title: 'Mes Comptes',
    accounts_total: 'Total',
    accounts_active: 'Actifs',
    accounts_expired: 'Expirés',
    accounts_all: 'Tous',
    accounts_profiles: 'profils',
    accounts_no_account: 'Aucun compte',
    accounts_no_result: 'Aucun compte trouvé pour ce filtre',

    // Help page
    help_title: "Centre d'aide",
    help_search: 'Rechercher une question...',
    help_contact: 'Contactez-nous',
    help_faq: 'Questions fréquentes',
    help_no_result: 'Aucun résultat',
    help_no_result_desc: "Essayez avec d'autres mots-clés",
    help_more_help: "Besoin d'aide supplémentaire ?",
    help_more_help_desc: 'Notre équipe support est disponible 7j/7 pour vous accompagner.',
    help_whatsapp: 'Discuter sur WhatsApp',

    // News page
    news_title: 'Actus Film',
    news_all: 'Tout',
    news_trending: 'Tendances',
    news_new: 'Nouveautés',
    news_latest: 'Dernières actualités',
    news_featured: 'À la une',
    news_read_time: 'de lecture',

    // Share page
    share_title: 'Partager',
    share_invite_title: 'Invite tes amis, gagne des récompenses !',
    share_invite_desc: "Partage ton code de parrainage et gagne des crédits pour chaque ami qui s'inscrit.",
    share_code_label: 'Ton code parrain',
    share_invited: 'Invité(s)',
    share_earned: 'Gagné',
    share_pending: 'En attente',
    share_via: 'Partager via',
    share_copied: 'Copié !',
    share_copy_link: 'Copier le lien',
    share_more: 'Plus',
    share_rewards: 'Récompenses',
    share_how_it_works: 'Comment ça marche ?',
    share_step1_title: 'Partage ton code',
    share_step1_desc: 'Envoie ton code parrain à tes amis',
    share_step2_title: "Ton ami s'inscrit",
    share_step2_desc: 'Il crée un compte avec ton code',
    share_step3_title: 'Vous gagnez tous les deux',
    share_step3_desc: 'Recevez des crédits gratuits',
    share_now: 'Partager maintenant',
    share_invitations: 'invitations',

    // Home page
    home_search: 'Rechercher...',
    home_accounts: 'Comptes',
    home_help: 'Aide',
    home_news: 'Actus film',
    home_share: 'Partager',
    home_discover: 'Découvrir & Divertissement',
    home_discover_desc: 'Explorez nos services de divertissement et plus encore',
    home_cinema: 'Cinéma',
    home_cinema_desc: 'Films & séries',
    home_gaming: 'Gaming',
    home_gaming_desc: 'Jeux & consoles',
    home_shopping: 'Shopping',
    home_shopping_desc: 'Bons plans',
    home_education: 'Éducation',
    home_education_desc: 'Cours & formation',
    home_social: 'Social',
    home_social_desc: 'Réseaux sociaux',
    home_filter_all: 'Tous',
    home_filter_streaming: 'Streaming',
    home_filter_music: 'Musique',
    home_filter_gaming: 'Gaming',
    home_filter_productivity: 'Productivité',
    home_days_left: 'Jours restants',
    home_days: 'Jours',
    home_plan_label: 'Plan',
    home_plan_duration: '1 mois',
    home_resubscribe: 'Réabonner',
    home_add: 'Ajouter',
    home_no_active_plan: 'Aucun plan actif pour le moment',
    home_discover_plans: 'Découvrir les plans',
    home_services_title: 'Services & Streaming',
    home_services_desc: 'Gérez vos abonnements et accédez à vos services',
    home_service_plan_default: 'Plan',
    home_service_loading_email: 'Chargement...',
    home_service_netflix_title: 'Netflix Premium',
    home_service_netflix_subtitle: 'Compte partagé • 4 écrans',
    home_service_disney_title: 'Disney+ Premium',
    home_service_disney_subtitle: 'Famille • 4 profils',
    home_service_spotify_title: 'Spotify Premium',
    home_service_spotify_subtitle: 'Musique illimitée',
    home_status_active: 'Actif',
    home_status_inactive: 'Inactif',

    // Transactions page
    transactions_title: 'Mes Transactions',
    transactions_spent: 'Dépensé',
    transactions_short: 'Transac.',
    transactions_saved: 'Éco.',
    transactions_payment: 'Paiement',
    transactions_empty: 'Aucune transaction trouvée',

    // Activations page
    activations_title: 'Mes Activations',
    activations_history: 'Historique',
    activations_active: 'Activé',
    activations_expired: 'Expiré',
    activations_empty: 'Aucune activation',
    activations_empty_desc: "L'historique de vos activations de services et comptes apparaîtra ici.",

    // Notifications page
    notifications_title: 'Mes Notifications',
    notifications_new_count: 'nouvelles',
    notifications_up_to_date: 'À jour',
    notifications_empty_title: 'Plus rien ici !',
    notifications_empty_desc: "Vous n'avez pas de nouvelles notifications pour le moment.",
    notifications_now: "À l'instant",
    notifications_yesterday: 'Hier',

    // Common
    common_total: 'TOTAL',
    common_overview: 'Aperçu',
    common_recent: 'Récentes',
    common_filter: 'Filtrer',
    common_validated: 'Validé',
    common_pending: 'En attente',
    common_loading: 'Chargement...',
    common_date: 'Date',
    common_expires_on: 'Expire le',

    // Common
    common_error: 'Erreur',
    common_cancel: 'Annuler',
    common_delete: 'Supprimer',
    common_premium: 'Premium',

    // Language names
    lang_fr: '🇫🇷 Français',
    lang_en: '🇬🇧 English',

    // Pay page
    pay_title: 'Réabonnement',
    pay_subtitle: 'Choisissez votre plan Netflix',
    pay_error_enter_name: 'Veuillez entrer votre nom et prénom.',
    pay_error_fetch_netflix: 'Impossible de récupérer/créer le compte Netflix.',
    pay_error_name_used: 'Ce nom et prénom est déjà utilisé. Veuillez en choisir un autre.',
    pay_error_generate_netflix: 'Impossible de générer le compte Netflix. Vérifiez votre connexion.',
    pay_error_payment_server: 'Réponse invalide du serveur de paiement.',
    pay_error_payment_init: "Erreur lors de l'initialisation du paiement.",
    pay_error_card_processing: 'Erreur lors du traitement de la carte.',
    pay_error_paypal: 'Erreur PayPal.',

    // Help page support options
    help_support_whatsapp: 'WhatsApp',
    help_support_whatsapp_desc: 'Réponse en ~5 min',
    help_support_email: 'Email',
    help_support_email_desc: 'support@moobilpay.com',
    help_support_phone: 'Téléphone',
    help_support_phone_desc: 'Lun-Ven 8h-18h',

    // Share page methods
    share_method_whatsapp: 'WhatsApp',
    share_method_sms: 'SMS',
    share_method_telegram: 'Telegram',
    share_method_copy_link: 'Copier le lien',
    share_method_facebook: 'Facebook',
    share_method_more: 'Plus',

    // Share page native share
    share_native_message: "Découvre MoobilPay ! L'app pour gérer tes abonnements streaming facilement 🎬🎵 Télécharge-la ici : https://moobilpay.com/download",
    share_native_title: 'MoobilPay - Gère tes abonnements',

    // Share page rewards
    share_reward_bronze_title: 'Parrainage Bronze',
    share_reward_bronze_desc: 'Invite 3 amis',
    share_reward_bronze_reward: '500F offerts',
    share_reward_silver_title: 'Parrainage Argent',
    share_reward_silver_desc: 'Invite 10 amis',
    share_reward_silver_reward: '2000F offerts',
    share_reward_gold_title: 'Parrainage Or',
    share_reward_gold_desc: 'Invite 25 amis',
    share_reward_gold_reward: '1 mois gratuit',
  },
  en: {
    // Tabs
    tabs_home: 'Home',
    tabs_transactions: 'Transactions',
    tabs_activations: 'Activations',
    tabs_notifications: 'Notifications',
    tabs_settings: 'Settings',

    // Settings page
    settings_title: 'Settings',
    settings_subtitle: 'Manage your preferences and account',
    settings_general: 'GENERAL',
    settings_language: 'Language',
    settings_language_desc: 'Choose your display language',
    settings_dark_mode: 'Dark Mode',
    settings_dark_mode_desc: 'Reduce eye strain',
    settings_notifications_section: 'NOTIFICATIONS',
    settings_push: 'Push Notifications',
    settings_push_desc: 'Receive real-time alerts',
    settings_security: 'SECURITY',
    settings_password: 'Password',
    settings_password_desc: 'Change your password',
    settings_biometrics: 'Biometrics',
    settings_biometrics_desc: 'Use TouchID or FaceID',
    settings_account: 'MY ACCOUNT',
    settings_profile: 'Profile',
    settings_profile_desc: 'Manage your personal information',
    settings_subscription: 'Subscription',
    settings_subscription_desc: 'View your current plan',
    settings_session: 'SESSION',
    settings_logout: 'Log out',
    settings_logout_desc: 'End your current session',
    settings_logout_confirm: 'Are you sure you want to log out?',
    settings_logout_cancel: 'Cancel',
    settings_logging_out: 'Logging out...',
    settings_logout_error: 'Unable to log out.',
    settings_danger_zone: 'DANGER ZONE',
    settings_delete_account: 'Delete account',
    settings_delete_account_desc: 'This action is irreversible',
    settings_version: 'MoobilPay v1.0.0',
    settings_copyright: '© 2025 MoobilPay. All rights reserved.',

    // Profile page
    profile_title: 'My Profile',
    profile_member_since: 'Member since',
    profile_subscriptions: 'Subscriptions',
    profile_transactions: 'Transactions',
    profile_months_active: 'Months active',
    profile_personal_info: 'Personal information',
    profile_full_name: 'Full name',
    profile_email: 'Email',
    profile_phone: 'Phone',
    profile_country: 'Country',
    profile_city: 'City',
    profile_security: 'Security',
    profile_change_password: 'Change password',
    profile_password_last_changed: 'Last changed 3 months ago',
    profile_biometric_auth: 'Biometric authentication',
    profile_biometric_desc: 'TouchID / FaceID enabled',
    profile_active: 'Active',
    profile_2fa: '2-Step verification',
    profile_2fa_desc: 'Protect your account',
    profile_danger_zone: 'Danger zone',
    profile_delete: 'Delete my account',
    profile_delete_desc: 'Permanently delete all your data',
    profile_delete_confirm: 'This action is irreversible. All your data will be deleted.',
    profile_save_success: 'Your information has been updated.',
    profile_success: 'Success',

    // Accounts page
    accounts_title: 'My Accounts',
    accounts_total: 'Total',
    accounts_active: 'Active',
    accounts_expired: 'Expired',
    accounts_all: 'All',
    accounts_profiles: 'profiles',
    accounts_no_account: 'No account',
    accounts_no_result: 'No account found for this filter',

    // Help page
    help_title: 'Help Center',
    help_search: 'Search a question...',
    help_contact: 'Contact us',
    help_faq: 'Frequently asked questions',
    help_no_result: 'No results',
    help_no_result_desc: 'Try with other keywords',
    help_more_help: 'Need more help?',
    help_more_help_desc: 'Our support team is available 7 days a week.',
    help_whatsapp: 'Chat on WhatsApp',

    // News page
    news_title: 'Movie News',
    news_all: 'All',
    news_trending: 'Trending',
    news_new: 'New',
    news_latest: 'Latest news',
    news_featured: 'Featured',
    news_read_time: 'read',

    // Share page
    share_title: 'Share',
    share_invite_title: 'Invite friends, earn rewards!',
    share_invite_desc: 'Share your referral code and earn credits for each friend who signs up.',
    share_code_label: 'Your referral code',
    share_invited: 'Invited',
    share_earned: 'Earned',
    share_pending: 'Pending',
    share_via: 'Share via',
    share_copied: 'Copied!',
    share_copy_link: 'Copy link',
    share_more: 'More',
    share_rewards: 'Rewards',
    share_how_it_works: 'How it works?',
    share_step1_title: 'Share your code',
    share_step1_desc: 'Send your referral code to friends',
    share_step2_title: 'Your friend signs up',
    share_step2_desc: 'They create an account with your code',
    share_step3_title: 'You both win',
    share_step3_desc: 'Get free credits',
    share_now: 'Share now',
    share_invitations: 'invitations',

    // Home page
    home_search: 'Search...',
    home_accounts: 'Accounts',
    home_help: 'Help',
    home_news: 'Movie news',
    home_share: 'Share',
    home_discover: 'Discover & Entertainment',
    home_discover_desc: 'Explore our entertainment services and more',
    home_cinema: 'Cinema',
    home_cinema_desc: 'Movies & series',
    home_gaming: 'Gaming',
    home_gaming_desc: 'Games & consoles',
    home_shopping: 'Shopping',
    home_shopping_desc: 'Best deals',
    home_education: 'Education',
    home_education_desc: 'Courses & training',
    home_social: 'Social',
    home_social_desc: 'Social networks',
    home_filter_all: 'All',
    home_filter_streaming: 'Streaming',
    home_filter_music: 'Music',
    home_filter_gaming: 'Gaming',
    home_filter_productivity: 'Productivity',
    home_days_left: 'Days left',
    home_days: 'Days',
    home_plan_label: 'Plan',
    home_plan_duration: '1 month',
    home_resubscribe: 'Resubscribe',
    home_add: 'Add',
    home_no_active_plan: 'No active plan at the moment',
    home_discover_plans: 'Discover plans',
    home_services_title: 'Services & Streaming',
    home_services_desc: 'Manage your subscriptions and access your services',
    home_service_plan_default: 'Plan',
    home_service_loading_email: 'Loading...',
    home_service_netflix_title: 'Netflix Premium',
    home_service_netflix_subtitle: 'Shared account • 4 screens',
    home_service_disney_title: 'Disney+ Premium',
    home_service_disney_subtitle: 'Family • 4 profiles',
    home_service_spotify_title: 'Spotify Premium',
    home_service_spotify_subtitle: 'Unlimited music',
    home_status_active: 'Active',
    home_status_inactive: 'Inactive',

    // Transactions page
    transactions_title: 'My Transactions',
    transactions_spent: 'Spent',
    transactions_short: 'Transac.',
    transactions_saved: 'Saved',
    transactions_payment: 'Payment',
    transactions_empty: 'No transaction found',

    // Activations page
    activations_title: 'My Activations',
    activations_history: 'History',
    activations_active: 'Active',
    activations_expired: 'Expired',
    activations_empty: 'No activation',
    activations_empty_desc: 'Your service and account activation history will appear here.',

    // Notifications page
    notifications_title: 'My Notifications',
    notifications_new_count: 'new',
    notifications_up_to_date: 'Up to date',
    notifications_empty_title: 'Nothing here!',
    notifications_empty_desc: "You don't have any new notifications for now.",
    notifications_now: 'Just now',
    notifications_yesterday: 'Yesterday',

    // Common
    common_total: 'TOTAL',
    common_overview: 'Overview',
    common_recent: 'Recent',
    common_filter: 'Filter',
    common_validated: 'Validated',
    common_pending: 'Pending',
    common_loading: 'Loading...',
    common_date: 'Date',
    common_expires_on: 'Expires on',

    // Common
    common_error: 'Error',
    common_cancel: 'Cancel',
    common_delete: 'Delete',
    common_premium: 'Premium',

    // Language names
    lang_fr: '🇫🇷 Français',
    lang_en: '🇬🇧 English',

    // Pay page
    pay_title: 'Resubscription',
    pay_subtitle: 'Choose your Netflix plan',
    pay_error_enter_name: 'Please enter your first and last name.',
    pay_error_fetch_netflix: 'Unable to fetch/create Netflix account.',
    pay_error_name_used: 'This name and first name is already used. Please choose another one.',
    pay_error_generate_netflix: 'Unable to generate Netflix account. Check your connection.',
    pay_error_payment_server: 'Invalid response from payment server.',
    pay_error_payment_init: 'Error during payment initialization.',
    pay_error_card_processing: 'Error during card processing.',
    pay_error_paypal: 'PayPal error.',

    // Help page support options
    help_support_whatsapp: 'WhatsApp',
    help_support_whatsapp_desc: 'Response in ~5 min',
    help_support_email: 'Email',
    help_support_email_desc: 'support@moobilpay.com',
    help_support_phone: 'Phone',
    help_support_phone_desc: 'Mon-Fri 8am-6pm',

    // Share page methods
    share_method_whatsapp: 'WhatsApp',
    share_method_sms: 'SMS',
    share_method_telegram: 'Telegram',
    share_method_copy_link: 'Copy link',
    share_method_facebook: 'Facebook',
    share_method_more: 'More',

    // Share page native share
    share_native_message: "Discover MoobilPay! The app to manage your streaming subscriptions easily 🎬🎵 Download it here: https://moobilpay.com/download",
    share_native_title: 'MoobilPay - Manage your subscriptions',

    // Share page rewards
    share_reward_bronze_title: 'Bronze Referral',
    share_reward_bronze_desc: 'Invite 3 friends',
    share_reward_bronze_reward: '500F offered',
    share_reward_silver_title: 'Silver Referral',
    share_reward_silver_desc: 'Invite 10 friends',
    share_reward_silver_reward: '2000F offered',
    share_reward_gold_title: 'Gold Referral',
    share_reward_gold_desc: 'Invite 25 friends',
    share_reward_gold_reward: '1 month free',
  },
} as const;

type TranslationKey = keyof typeof translations.fr;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'app_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'fr' || stored === 'en') {
        setLanguageState(stored);
      }
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language][key] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
