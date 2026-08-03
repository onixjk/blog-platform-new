import { injectable } from "inversify";
import { UserDocument, UserModel } from "../domain/user.entity";

@injectable()
export class UserRepository {

    async findById(id: string): Promise<UserDocument | null> {
        return UserModel.findById(id);
    }

    async findByConfirmationCode(code: string): Promise<UserDocument | null> {
        return UserModel.findOne({ 'emailConfirmation.confirmationCode': code });
    }

    async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
        return UserModel.findOne({
            $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
        });
    }

    async findByLoginAndEmail(login: string, email: string): Promise<UserDocument | null> {
        return UserModel.findOne({
            $or: [{ login: login }, { email: email }],
        });
    }

    async findByRecoveryCode(recoveryCode: string): Promise<UserDocument | null> {
        return UserModel.findOne({
            "passwordRecovery.recoveryCode": recoveryCode,
            "passwordRecovery.expirationDate": { $gt: new Date().toISOString() }
        });
    }

    async save(user: UserDocument): Promise<string | null> {
        const savedUser = await user.save();

        return savedUser ? savedUser._id.toString() : null;
    }

    async delete(user: UserDocument): Promise<boolean> {
        const deleteResult = await user.deleteOne();

        return deleteResult.deletedCount > 0;
    }
}