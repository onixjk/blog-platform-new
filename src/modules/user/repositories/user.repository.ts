import { IUserDB } from "../types/user.db.interface";
import { injectable } from "inversify";
import { UserModel } from "../../../db/mongo.db";
import { HydratedDocument } from "mongoose";

@injectable()
export class UserRepository {

    async findById(id: string): Promise<HydratedDocument<IUserDB> | null> {
        return UserModel.findById(id);
    }

    async findByLoginOrEmail(loginOrEmail: string): Promise<HydratedDocument<IUserDB> | null> {
        return UserModel.findOne({
            $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
        });
    }

    async findByLoginAndEmail(login: string, email: string): Promise<HydratedDocument<IUserDB> | null> {
        return UserModel.findOne({
            $or: [{ login: login }, { email: email }],
        });
    }

    async findByRecoveryCode(recoveryCode: string): Promise<HydratedDocument<IUserDB> | null> {
        return UserModel.findOne({
            "passwordRecovery.recoveryCode": recoveryCode,
            "passwordRecovery.expirationDate": { $gt: new Date().toISOString() }
        });
    }

    async updateEmailConfirmationStatus(code: string): Promise<boolean> {

        const isUpdated = await UserModel.updateOne(
            {
                'emailConfirmation.confirmationCode': code,
                'emailConfirmation.isConfirmed': false,
                'emailConfirmation.expirationDate': { $gt: new Date().toISOString() }
            },
            { 'emailConfirmation.isConfirmed': true }
        );

        return isUpdated.matchedCount > 0;
    }

    async updateEmailConfirmationCode(email: string, confirmationCode: string, expirationDate: string): Promise<boolean> {

        const isUpdated = await UserModel.updateOne(
            { email: email },
            {
                "emailConfirmation.confirmationCode": confirmationCode,
                "emailConfirmation.expirationDate": expirationDate,
            }
        );

        return isUpdated.matchedCount > 0;
    }

    async updatePasswordRecoveryCode(email: string, recoveryCode: string, expirationDate: string): Promise<boolean> {

        const isUpdate = await UserModel.updateOne(
            { email: email },
            {
                "passwordRecovery.recoveryCode": recoveryCode,
                "passwordRecovery.expirationDate": expirationDate,
            }
        );

        return isUpdate.matchedCount > 0;
    }

    async updatePasswordAndClearRecovery(userId: string, newPasswordHash: string): Promise<boolean> {
        const result = await UserModel.updateOne(
            { _id: userId },
            {
                passwordHash: newPasswordHash,
                "passwordRecovery.recoveryCode": null,
                "passwordRecovery.expirationDate": null
            }
        )

        return result.matchedCount > 0;
    }

    async save(document: HydratedDocument<IUserDB>): Promise<string> {
        const savedUser = await document.save();

        return savedUser.id;
    }

    async delete(id: string): Promise<boolean> {
        const deleteResult = await UserModel.deleteOne({ _id: id });

        return deleteResult.deletedCount > 0;
    }
}