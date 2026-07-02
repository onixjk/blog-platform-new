import { WithId } from "mongodb";
import { User } from "../types/user";
import { UserInputDto } from "../routes/input/user.input-dto";
import { UsersRepository } from "../repositories/usersRepository";
import { IUserDB } from "../types/user.db.interface";
import { BcryptService } from "../../auth/adapters/bcrypt.service";
import { randomUUID } from "node:crypto";
import { bcryptService, usersRepository } from "../../../composition-root";

export class UsersService {

    constructor(
        public usersRepository: UsersRepository,
        public bcryptService: BcryptService,
    ) {
    }

    async findByIdOrFail(id: string): Promise<WithId<User>> {
        return usersRepository.findByIdOrFail(id);
    }

    async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<IUserDB> | null> {
        return usersRepository.findByLoginOrEmail(loginOrEmail);
    }

    async updateEmailConfirmationStatus(code: string): Promise<WithId<IUserDB> | null> {
        return usersRepository.updateEmailConfirmationStatus(code);
    }

    async create(dto: UserInputDto): Promise<string> {

        const userByLogin = await usersRepository.findByLoginOrEmail(dto.login);

        if (userByLogin?.login === dto.login) {
            throw new Error("Login already exist");
        }

        const userByEmail = await usersRepository.findByLoginOrEmail(dto.email);

        if (userByEmail?.email === dto.email) {
            throw new Error("Email already exist");
        }

        const passwordHash = await bcryptService.generateHash(dto.password);

        const newUser: IUserDB = {
            login: dto.login,
            passwordHash: passwordHash,
            email: dto.email,
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                confirmationCode: randomUUID(),
                expirationDate: new Date().toISOString(),
                isConfirmed: false,
            }
        }

        return usersRepository.create(newUser);
    }

    async delete(id: string): Promise<void> {
        await usersRepository.delete(id);
        return;
    }
}