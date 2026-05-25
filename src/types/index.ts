export interface UsersInfos {
    nom: string;
    prenom: string;
    age: number;
    numero: number;
    email: string;
    password?: string;
}

export interface Users {
    uid: string;
    id?: string;
    infos: UsersInfos;
    fcmToken?: string;
    tokenType?: 'ios' | 'android';
}
