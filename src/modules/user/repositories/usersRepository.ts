import { ObjectId, WithId } from "mongodb";
import { userCollection } from "../../../db/mongo.db";
import { RepositoryNotFoundError } from "../../../core/errors/repository-not-found.error";
import { IUserDB } from "../types/user.db.interface";
import { User } from "../types/user";
import { ResultStatus } from "../../../core/result/resultCode";
import { Result } from "../../../core/result/result.type";

export class UsersRepository {

    async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<IUserDB> | null> {
        return userCollection.findOne({
            $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
        });
    }

    async findByRecoveryCode(recoveryCode: string): Promise<WithId<IUserDB> | null> {
        return userCollection.findOne({
            "passwordRecovery.recoveryCode": recoveryCode,
            "passwordRecovery.expirationDate": { $gt: new Date().toISOString() }
        });
    }

    async updateEmailConfirmationStatus(code: string): Promise<WithId<IUserDB> | null> {

        return await userCollection.findOneAndUpdate(
            {
                'emailConfirmation.confirmationCode': code,
                'emailConfirmation.isConfirmed': false,
                'emailConfirmation.expirationDate': { $gt: new Date().toISOString() }
            },
            {
                $set: { 'emailConfirmation.isConfirmed': true }
            },
            {
                returnDocument: 'after'
            }
        );
    }

    async updateConfirmationCode(
        email: string,
        confirmationCode: string,
        expirationDate: string
    ): Promise<Result> {

        await userCollection.updateOne(
            { email: email },
            {
                $set: {
                    "emailConfirmation.confirmationCode": confirmationCode,
                    "emailConfirmation.expirationDate": expirationDate,
                }
            }
        );

        return {
            status: ResultStatus.NoContent_204,
            data: null,
            extensions: [],
        }
    }

    async updatePasswordAndClearRecovery(userId: string, newPasswordHash: string): Promise<boolean> {
        const result = await userCollection.updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    passwordHash: newPasswordHash,
                    "passwordRecovery.recoveryCode": null,
                    "passwordRecovery.expirationDate": null
                }
            }
        )
        return result.matchedCount > 0;
    }

    async findByIdOrFail(id: string): Promise<WithId<User>> {
        const res = await userCollection.findOne({ _id: new ObjectId(id) });

        if (!res) {
            throw new RepositoryNotFoundError('User not exist');
        }

        return res;
    }

    async create(newUser: IUserDB): Promise<string> {
        const insertResult = await userCollection.insertOne(newUser);

        return insertResult.insertedId.toString()
    }

    async delete(id: string): Promise<void> {
        const deleteResult = await userCollection.deleteOne({ _id: new ObjectId(id) });

        if (deleteResult.deletedCount < 1) {
            throw new RepositoryNotFoundError("User not exist");
        }

        return;
    }
}