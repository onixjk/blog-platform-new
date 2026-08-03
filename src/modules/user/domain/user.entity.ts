import mongoose, { HydratedDocument, Model, Schema } from "mongoose";
import { EmailConfirmation, PasswordRecovery, UserDB } from "../types/user.db.interface";
import { randomUUID } from "node:crypto";

export const EmailConfirmationSchema = new Schema<EmailConfirmation>({
    confirmationCode: { type: String },
    expirationDate: { type: Date },
    isConfirmed: { type: Boolean, default: false }
});
export const PasswordRecoverySchema = new Schema<PasswordRecovery>({
    recoveryCode: { type: String },
    expirationDate: { type: Date },
});
export const UserSchema = new Schema<UserDB>({
    login: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: String, required: true },
    emailConfirmation: EmailConfirmationSchema,
    passwordRecovery: PasswordRecoverySchema,
});


interface UserMethods {
    confirmEmail(code: string): boolean;

    updateConfirmationCode(confirmationCode: string): boolean;

    updateRecoveryCode(recoveryCode: string): void;

    updatePasswordAndClearRecovery(newPasswordHash: string): boolean;
}

export class UserEntity {

    private constructor(
        // private login: string,
        // private email: string,
        private passwordHash: string,
        // private createdAt: string,
        private emailConfirmation: EmailConfirmation,
        private passwordRecovery: PasswordRecovery,
    ) {}

    static createConfirmedUser(this: Model<UserDB, {}, UserMethods>, login: string, email: string, passwordHash: string): UserDocument {

        return new this({
            login: login,
            passwordHash: passwordHash,
            email: email,
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                confirmationCode: null,
                expirationDate: null,
                isConfirmed: true,
            },
            passwordRecovery: {
                recoveryCode: null,
                expirationDate: null,
            }
        });
    }

    static createUser(this: Model<UserDB, {}, UserMethods>, login: string, email: string, passwordHash: string) {

        return new this({
            login: login,
            passwordHash: passwordHash,
            email: email,
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                confirmationCode: randomUUID(),
                expirationDate: new Date().toISOString(),
                isConfirmed: false,
            },
            passwordRecovery: {
                recoveryCode: null,
                expirationDate: null,
            }
        });
    }

    confirmEmail(code: string): boolean {

        if (this.emailConfirmation.confirmationCode !== code) {
            return false;
        }

        if (this.emailConfirmation.isConfirmed) {
            return false;
        }

        const now = new Date();

        const expirationDate = new Date(this.emailConfirmation.expirationDate);
        if (expirationDate <= now) return false;

        this.emailConfirmation.isConfirmed = true;

        return this.emailConfirmation.isConfirmed;
    }

    updateConfirmationCode(confirmationCode: string): boolean {

        if (this.emailConfirmation.isConfirmed) return false;

        const expirationDate = new Date(Date.now() + 60 * 60 * 1000);

        this.emailConfirmation.confirmationCode = confirmationCode;
        this.emailConfirmation.expirationDate = expirationDate;

        return true;
    }

    updateRecoveryCode(recoveryCode: string): void {
        const expirationDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        this.passwordRecovery.recoveryCode = recoveryCode;
        this.passwordRecovery.expirationDate = expirationDate;
    }

    updatePasswordAndClearRecovery(newPasswordHash: string): boolean {
        if (!this.passwordRecovery.recoveryCode || !this.passwordRecovery.expirationDate)
            return false;

        this.passwordHash = newPasswordHash;
        this.passwordRecovery.recoveryCode = null;
        this.passwordRecovery.expirationDate = null;

        return true;
    }

}

type UserStatics = typeof UserEntity;
type UserModelType = Model<UserDB, {}, UserMethods> & UserStatics;
export type UserDocument = HydratedDocument<UserDB, UserMethods>

UserSchema.loadClass(UserEntity);
export let UserModel = mongoose.model<UserDB, UserModelType>('users', UserSchema);