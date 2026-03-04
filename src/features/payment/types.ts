export type PaymentMethod = 'card' | 'paypal' | 'orangemoney' | 'mtnmoney';

export type PayPage =
    | 1       // Plan selection
    | 1.5     // Netflix identity (Prénom/Nom)
    | 2       // Payment method selection + details
    | 5       // Processing / waiting for socket
    | 6;      // Success receipt

// Within page=2, activeStep drives which sub-screen is shown:
// activeStep=1 → method selection
// activeStep=2 → details form (mobile money phone, card form, paypal info)
// activeStep=3 → confirmation screen (payment success)
// activeStep=4 → receipt

export interface NetflixPlan {
    id: string;
    name: string;
    title: string;
    summary: string;
    price: number;
    currency: string;
    quality: string;
    resolution: string;
    support: string;
    simultaneous: number;
    downloads: number;
}

export interface PaymentState {
    currentPage: PayPage;
    activeStep: number;
    selectedPlanId: string;
    userFirstName: string;
    userLastName: string;
    netflixEmail: string;
    netflixPassword: string;
    selectedPaymentMethod: PaymentMethod | null;
    phoneNumber: string;
    cardNumber: string;
    cardName: string;
    expiryDate: string;
    cvv: string;
    transactionId: string;
    planActivationId: string;
    verificationStep: number;
    paymentLink: string;
}
