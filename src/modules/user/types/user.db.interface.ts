export interface IUserDB {
    login: string;
    email: string;
    passwordHash: string;
    createdAt: string;
    emailConfirmation: {
        confirmationCode: string;
        expirationDate: string;
        isConfirmed: boolean;
    }
    passwordRecovery: {
        recoveryCode: string | null;
        expirationDate: string | null;
    }
}