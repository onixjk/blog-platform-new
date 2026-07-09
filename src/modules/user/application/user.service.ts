import { WithId } from "mongodb";
import { User } from "../types/user";
import { UserInputDto } from "../types/input/user.input-dto";
import { IUserDB } from "../types/user.db.interface";
import { BcryptService } from "../../auth/adapters/bcrypt.service";
import { randomUUID } from "node:crypto";
import { ResultStatus } from "../../../core/result/resultCode";
import { Result } from "../../../core/result/result.type";
import { inject, injectable } from "inversify";
import { UserRepository } from "../repositories/user.repository";

@injectable()
export class UserService {

    constructor(
        @inject(UserRepository) private usersRepository: UserRepository,
        @inject(BcryptService) private bcryptService: BcryptService,
    ) {

    }

    async findByIdOrFail(id: string): Promise<WithId<User>> {
        return this.usersRepository.findByIdOrFail(id);
    }

    async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<IUserDB> | null> {
        return this.usersRepository.findByLoginOrEmail(loginOrEmail);
    }

    async findByRecoveryCode(recoveryCode: string): Promise<Result<WithId<IUserDB> | null>> {
        const user = await this.usersRepository.findByRecoveryCode(recoveryCode);

        if (!user) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: 'recoveryCode', message: 'Recovery code not found' }],
            };
        }

        return {
            status: ResultStatus.Success_200,
            data: user,
            extensions: [],
        };
    }

    async updateEmailConfirmationStatus(code: string): Promise<WithId<IUserDB> | null> {
        return this.usersRepository.updateEmailConfirmationStatus(code);
    }

    async updatePasswordAndClearRecovery(userId: string, passwordHash: string): Promise<Result<boolean>> {

        const result = await this.usersRepository.updatePasswordAndClearRecovery(userId, passwordHash);

        if (!result) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: result,
                extensions: [{ field: 'User id', message: 'Invalid user id' }],
            };
        }

        return {
            status: ResultStatus.Success_200,
            data: result,
            extensions: [],
        };
    }

    async create(dto: UserInputDto): Promise<string> {

        const userByLogin = await this.usersRepository.findByLoginOrEmail(dto.login);

        if (userByLogin?.login === dto.login) {
            throw new Error("Login already exist");
        }

        const userByEmail = await this.usersRepository.findByLoginOrEmail(dto.email);

        if (userByEmail?.email === dto.email) {
            throw new Error("Email already exist");
        }

        const passwordHash = await this.bcryptService.generateHash(dto.password);

        const newUser: IUserDB = {
            login: dto.login,
            passwordHash: passwordHash,
            email: dto.email,
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
        }

        return this.usersRepository.create(newUser);
    }

    async delete(id: string): Promise<void> {
        await this.usersRepository.delete(id);
        return;
    }
}