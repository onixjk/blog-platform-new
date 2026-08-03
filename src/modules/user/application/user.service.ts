import { User } from "../types/user";
import { UserInputDto } from "../types/input/user.input-dto";
import { BcryptService } from "../../auth/adapters/bcrypt.service";
import { ResultStatus } from "../../../core/result/resultCode";
import { Result } from "../../../core/result/result.type";
import { inject, injectable } from "inversify";
import { UserRepository } from "../repositories/user.repository";
import { UserDocument, UserModel } from "../domain/user.entity";

@injectable()
export class UserService {

    constructor(
        @inject(UserRepository) private userRepository: UserRepository,
        @inject(BcryptService) private bcryptService: BcryptService,
    ) {}

    async findById(id: string): Promise<Result<UserDocument | null>> {

        const user = await this.userRepository.findById(id);
        if (!user) return {
            status: ResultStatus.NotFound_404,
            errorMessage: 'NotFound',
            data: null,
            extensions: [{ field: 'User', message: 'User not exist' }],
        };

        return {
            status: ResultStatus.Success,
            data: user,
            extensions: []
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
                status: ResultStatus.BadRequest_400,
                errorMessage: 'BadRequest',
                data: null,
                extensions: extensions,
            };
        }

        const passwordHash = await this.bcryptService.generateHash(dto.password);

        const newUser = UserModel.createUser(dto.login, dto.email, passwordHash);

        const savedUserId = await this.userRepository.save(newUser);
        if (!savedUserId) return {
            status: ResultStatus.BadRequest_400,
            errorMessage: 'Bad Request',
            data: null,
            extensions: [{ field: 'User', message: 'User registration failed' }],
        }

        return {
            status: ResultStatus.Success,
            data: savedUserId,
            extensions: [],
        };
    }

    async delete(id: string): Promise<Result<boolean | null>> {

        const user = await this.userRepository.findById(id);
        if (!user) return {
            status: ResultStatus.NotFound_404,
            errorMessage: 'Not Found',
            data: null,
            extensions: [{ field: 'User', message: 'User not exist' }]
        };

        const isDeleted = await this.userRepository.delete(user);
        if (!isDeleted) return {
            status: ResultStatus.NotFound_404,
            errorMessage: 'Not Found',
            data: null,
            extensions: [{ field: 'User', message: 'User not exist' }]
        };

        return {
            status: ResultStatus.Success,
            data: isDeleted,
            extensions: []
        };
    }
}