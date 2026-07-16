import { User } from "../types/user";
import { UserInputDto } from "../types/input/user.input-dto";
import { IUserDB } from "../types/user.db.interface";
import { BcryptService } from "../../auth/adapters/bcrypt.service";
import { randomUUID } from "node:crypto";
import { ResultStatus } from "../../../core/result/resultCode";
import { Result } from "../../../core/result/result.type";
import { inject, injectable } from "inversify";
import { UserRepository } from "../repositories/user.repository";
import { UserModel } from "../../../db/mongo.db";
import { HydratedDocument } from "mongoose";

@injectable()
export class UserService {

    constructor(
        @inject(UserRepository) private userRepository: UserRepository,
        @inject(BcryptService) private bcryptService: BcryptService,
    ) {}

    async findById(id: string): Promise<Result<HydratedDocument<User> | null>> {

        const user = await this.userRepository.findById(id);
        if (!user) {
            return {
                status: ResultStatus.NotFound_404,
                errorMessage: 'NotFound',
                data: null,
                extensions: [{ field: 'User', message: 'User not exist' }],
            };
        }

        return {
            status: ResultStatus.Success,
            data: user,
            extensions: []
        };
    }

    async findByRecoveryCode(recoveryCode: string): Promise<Result<HydratedDocument<IUserDB> | null>> {
        const user = await this.userRepository.findByRecoveryCode(recoveryCode);
        if (!user) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: 'recoveryCode', message: 'Recovery code not found' }],
            };
        }

        return {
            status: ResultStatus.Success,
            data: user,
            extensions: [],
        };
    }

    async create(dto: UserInputDto): Promise<Result<string | null>> {

        const user = await this.userRepository.findByLoginAndEmail(dto.login, dto.email);
        if (user) {
            const extensions: Array<{ field: string; message: string }> = [];

            if (user.login === dto.login) {
                extensions.push({ field: 'login', message: 'Login already exists' });
            }
            if (user.email === dto.email) {
                extensions.push({ field: 'email', message: 'Email already exists' });
            }

            return {
                status: ResultStatus.Conflict_409,
                errorMessage: 'Conflict',
                data: null,
                extensions: extensions,
            };
        }

        const passwordHash = await this.bcryptService.generateHash(dto.password);

        const newUser = new UserModel({
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
        })

        const savedUserId = await this.userRepository.save(newUser);
        if (!savedUserId) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{field: 'User', message: 'User registration failed' }],
            };
        }

        return {
            status: ResultStatus.Success,
            data: savedUserId,
            extensions: [],
        };
    }

    async updateEmailConfirmationStatus(code: string): Promise<Result<boolean | null>> {
        const isUpdated = await this.userRepository.updateEmailConfirmationStatus(code);
        if (!isUpdated) {
            return {
                status: ResultStatus.NotFound_404,
                errorMessage: 'NotFound',
                data: null,
                extensions: [{ field: 'User', message: 'User not exist' }],
            };
        }

        return {
            status: ResultStatus.Success,
            data: isUpdated,
            extensions: [],
        };
    }

    async updatePasswordAndClearRecovery(userId: string, passwordHash: string): Promise<Result<boolean | null>> {

        const isUpdated = await this.userRepository.updatePasswordAndClearRecovery(userId, passwordHash);
        if (!isUpdated) {
            return {
                status: ResultStatus.BadRequest_400,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{ field: 'User id', message: 'Invalid user id' }],
            };
        }

        return {
            status: ResultStatus.Success,
            data: isUpdated,
            extensions: [],
        };
    }

    async delete(id: string): Promise<Result<boolean | null>> {

        const isDeleted = await this.userRepository.delete(id);
        if (!isDeleted) {
            return {
                status: ResultStatus.NotFound_404,
                errorMessage: 'Not Found',
                data: null,
                extensions: [{ field: 'User', message: 'User not exist' }]
            };
        }

        return {
            status: ResultStatus.Success,
            data: isDeleted,
            extensions: []
        };
    }
}