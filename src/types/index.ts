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
    isMarchand: boolean;
    statistique: number;
    fastFoodId: string;
    fcmToken?: string;
}
