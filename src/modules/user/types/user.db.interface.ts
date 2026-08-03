export type EmailConfirmation = {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
}

export type PasswordRecovery = {
    recoveryCode: string | null;
    expirationDate: string | null;
}


export type UserDB = {
    login: string;
    email: string;
    passwordHash: string;
    createdAt: string;
    emailConfirmation: EmailConfirmation;
    passwordRecovery: PasswordRecovery;
}